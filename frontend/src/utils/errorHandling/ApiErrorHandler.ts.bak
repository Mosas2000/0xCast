export interface ApiErrorResponse {
  status: number;
  statusText: string;
  message?: string;
  code?: string;
  details?: unknown;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public code?: string,
    public details?: unknown
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }
}

export class ApiErrorHandler {
  static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await this.parseErrorResponse(response);
      throw new ApiError(
        error.status,
        error.statusText,
        error.code,
        error.details
      );
    }

    try {
      return await response.json();
    } catch (error) {
      throw new Error('Failed to parse response JSON');
    }
  }

  static async parseErrorResponse(response: Response): Promise<ApiErrorResponse> {
    let details: unknown;

    try {
      details = await response.json();
    } catch {
      details = await response.text();
    }

    return {
      status: response.status,
      statusText: response.statusText,
      message: this.getErrorMessage(response.status),
      code: this.getErrorCode(response.status),
      details,
    };
  }

  static getErrorMessage(status: number): string {
    const messages: Record<number, string> = {
      400: 'Bad request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not found',
      408: 'Request timeout',
      429: 'Too many requests',
      500: 'Internal server error',
      502: 'Bad gateway',
      503: 'Service unavailable',
      504: 'Gateway timeout',
    };

    return messages[status] || 'Unknown error';
  }

  static getErrorCode(status: number): string {
    const codes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      408: 'TIMEOUT',
      429: 'RATE_LIMIT',
      500: 'SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT',
    };

    return codes[status] || 'UNKNOWN_ERROR';
  }

  static isRetryable(error: ApiError): boolean {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }

  static getRetryDelay(attempt: number, error: ApiError): number {
    if (error.status === 429) {
      return Math.min(1000 * Math.pow(2, attempt), 32000);
    }
    return Math.min(1000 * attempt, 10000);
  }

  static isNetworkError(error: unknown): boolean {
    return (
      error instanceof TypeError &&
      (error.message.includes('fetch') || error.message.includes('network'))
    );
  }

  static async fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (error instanceof ApiError && !this.isRetryable(error)) {
          throw error;
        }

        if (attempt < maxRetries) {
          const delay =
            error instanceof ApiError
              ? this.getRetryDelay(attempt, error)
              : 1000 * (attempt + 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}
