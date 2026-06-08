import { ApiError, ErrorCode } from '@/utils/apiErrors';
import { withRetry, RetryConfig } from '@/utils/retry';
import { errorLoggingService } from './ErrorLoggingService';

interface RequestConfig extends RequestInit {
  timeout?: number;
  retry?: Partial<RetryConfig>;
  logErrors?: boolean;
}

interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
  retry?: Partial<RetryConfig>;
}

export class ApiClient {
  private config: ApiClientConfig;
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>> = [];
  private responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = [];

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseURL: '',
      timeout: 30000,
      ...config,
    };
  }

  addRequestInterceptor(
    interceptor: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  ): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(
    interceptor: (response: Response) => Response | Promise<Response>
  ): void {
    this.responseInterceptors.push(interceptor);
  }

  async get<T>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  private async request<T>(url: string, config: RequestConfig = {}): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseURL}${url}`;
    
    let finalConfig: RequestConfig = {
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...config.headers,
      },
    };

    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }

    const timeout = config.timeout || this.config.timeout;
    const retryConfig = config.retry || this.config.retry;
    const logErrors = config.logErrors !== false;

    const executeRequest = async (): Promise<T> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        let response = await fetch(fullUrl, {
          ...finalConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        for (const interceptor of this.responseInterceptors) {
          response = await interceptor(response);
        }

        if (!response.ok) {
          throw await this.handleErrorResponse(response);
        }

        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return await response.json();
        }

        return (await response.text()) as unknown as T;
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof ApiError) {
          throw error;
        }

        if ((error as Error).name === 'AbortError') {
          throw new ApiError(
            'Request timed out. Please try again.',
            ErrorCode.TIMEOUT_ERROR,
            undefined,
            undefined,
            true
          );
        }

        throw ApiError.fromError(error);
      }
    };

    try {
      if (retryConfig) {
        return await withRetry(executeRequest, retryConfig);
      }
      return await executeRequest();
    } catch (error) {
      if (logErrors) {
        const apiError = error instanceof ApiError ? error : ApiError.fromError(error);
        errorLoggingService.logError(apiError, {
          component: 'ApiClient',
          action: `${config.method} ${url}`,
          additionalData: {
            url: fullUrl,
            method: config.method,
          },
        });
      }
      throw error;
    }
  }

  private async handleErrorResponse(response: Response): Promise<ApiError> {
    let errorData: Record<string, unknown> = {};

    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      }
    } catch {
      // Failed to parse error response
    }

    const message = (errorData.message as string) || response.statusText || 'Request failed';

    switch (response.status) {
      case 400:
        return new ApiError(
          message,
          ErrorCode.VALIDATION_ERROR,
          400,
          errorData
        );
      case 401:
        return new ApiError(
          'Authentication required. Please connect your wallet.',
          ErrorCode.UNAUTHORIZED,
          401,
          errorData
        );
      case 403:
        return new ApiError(
          'You do not have permission to perform this action.',
          ErrorCode.FORBIDDEN,
          403,
          errorData
        );
      case 404:
        return new ApiError(
          'The requested resource was not found.',
          ErrorCode.NOT_FOUND,
          404,
          errorData
        );
      case 429:
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
        return new ApiError(
          'Too many requests. Please wait before trying again.',
          ErrorCode.RATE_LIMIT_ERROR,
          429,
          errorData,
          true,
          retryAfter
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return new ApiError(
          'Server error. Please try again later.',
          ErrorCode.RPC_ERROR,
          response.status,
          errorData,
          true
        );
      default:
        return new ApiError(
          message,
          ErrorCode.UNKNOWN_ERROR,
          response.status,
          errorData,
          response.status >= 500
        );
    }
  }
}

export const apiClient = new ApiClient({
  baseURL: import.meta.env?.VITE_API_BASE_URL || '',
  timeout: 30000,
  retry: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    backoffMultiplier: 2,
  },
});
