import { STACKS_API_URL } from '../constants/contract';

interface ApiClientOptions {
    maxRetries?: number;
    retryDelay?: number;
    timeout?: number;
}

interface FetchOptions extends RequestInit {
    params?: Record<string, string>;
}

class ApiClient {
    private baseUrl: string;
    private maxRetries: number;
    private retryDelay: number;
    private timeout: number;

    constructor(baseUrl: string, options: ApiClientOptions = {}) {
        this.baseUrl = baseUrl;
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000;
        this.timeout = options.timeout || 30000;
    }

    /**
     * Make a GET request
     */
    async get<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
        return this.request<T>('GET', endpoint, options);
    }

    /**
     * Make a POST request
     */
    async post<T>(endpoint: string, data?: unknown, options: FetchOptions = {}): Promise<T> {
        return this.request<T>('POST', endpoint, {
            ...options,
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * Make an HTTP request with retries and timeout
     */
    private async request<T>(
        method: string,
        endpoint: string,
        options: FetchOptions = {}
    ): Promise<T> {
        const url = this.buildUrl(endpoint, options.params);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(
                        `API request failed: ${response.status} ${response.statusText}. ${errorText}`
                    );
                }

                const data = await response.json();
                return data as T;
            } catch (error) {
                lastError = error as Error;

                // Don't retry on abort (timeout) or if it's the last attempt
                if (error instanceof Error && error.name === 'AbortError') {
                    throw new Error(`Request timeout after ${this.timeout}ms`);
                }

                if (attempt === this.maxRetries) {
                    break;
                }

                // Wait before retrying (exponential backoff)
                await this.delay(this.retryDelay * Math.pow(2, attempt));
            }
        }

        clearTimeout(timeoutId);
        throw lastError || new Error('Request failed after all retries');
    }

    /**
     * Build URL with query parameters
     */
    private buildUrl(endpoint: string, params?: Record<string, string>): string {
        const url = `${this.baseUrl}${endpoint}`;
        if (!params) return url;

        const queryString = Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

        return `${url}?${queryString}`;
    }

    /**
     * Delay helper for retries
     */
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

// Export a singleton instance
export const apiClient = new ApiClient(STACKS_API_URL, {
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
});

// Export types
export type { ApiClientOptions, FetchOptions };
