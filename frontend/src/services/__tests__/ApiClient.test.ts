import { ApiClient } from '../ApiClient';
import { ApiError, ErrorCode } from '../../utils/apiErrors';

global.fetch = jest.fn();

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient({
      baseURL: 'https://api.example.com',
      timeout: 5000,
    });
    jest.clearAllMocks();
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await client.get('/test');
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should handle 404 errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers(),
      });

      await expect(client.get('/not-found')).rejects.toThrow(ApiError);
      await expect(client.get('/not-found')).rejects.toMatchObject({
        code: ErrorCode.NOT_FOUND,
        statusCode: 404,
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(client.get('/test')).rejects.toThrow(ApiError);
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request with data', async () => {
      const mockData = { success: true };
      const postData = { name: 'Test' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      const result = await client.post('/test', postData);
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      );
    });

    it('should handle validation errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid data' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      await expect(client.post('/test', {})).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_ERROR,
        statusCode: 400,
      });
    });
  });

  describe('Error handling', () => {
    it('should handle 401 unauthorized', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers(),
      });

      await expect(client.get('/protected')).rejects.toMatchObject({
        code: ErrorCode.UNAUTHORIZED,
        statusCode: 401,
      });
    });

    it('should handle 429 rate limit with retry-after', async () => {
      const headers = new Headers();
      headers.set('Retry-After', '120');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers,
      });

      await expect(client.get('/test')).rejects.toMatchObject({
        code: ErrorCode.RATE_LIMIT_ERROR,
        statusCode: 429,
        retryAfter: 120,
      });
    });

    it('should handle 500 server errors as retryable', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
      });

      await expect(client.get('/test')).rejects.toMatchObject({
        code: ErrorCode.RPC_ERROR,
        statusCode: 500,
        retryable: true,
      });
    });
  });

  describe('Timeout handling', () => {
    it('should timeout after specified duration', async () => {
      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 10000))
      );

      const shortTimeoutClient = new ApiClient({
        baseURL: 'https://api.example.com',
        timeout: 100,
      });

      await expect(shortTimeoutClient.get('/slow')).rejects.toMatchObject({
        code: ErrorCode.TIMEOUT_ERROR,
      });
    });
  });

  describe('Interceptors', () => {
    it('should apply request interceptors', async () => {
      const mockData = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      client.addRequestInterceptor((config) => ({
        ...config,
        headers: {
          ...config.headers,
          'X-Custom-Header': 'test-value',
        },
      }));

      await client.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'test-value',
          }),
        })
      );
    });

    it('should apply response interceptors', async () => {
      const mockData = { success: true };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        headers: new Headers({ 'content-type': 'application/json' }),
      });

      let interceptorCalled = false;
      client.addResponseInterceptor((response) => {
        interceptorCalled = true;
        return response;
      });

      await client.get('/test');
      expect(interceptorCalled).toBe(true);
    });
  });

  describe('Retry logic', () => {
    it('should retry failed requests', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
          headers: new Headers({ 'content-type': 'application/json' }),
        });

      const result = await client.get('/test', {
        retry: {
          maxAttempts: 3,
          initialDelayMs: 10,
        },
      });

      expect(result).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers(),
      });

      await expect(
        client.get('/test', {
          retry: {
            maxAttempts: 3,
          },
        })
      ).rejects.toThrow();

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
