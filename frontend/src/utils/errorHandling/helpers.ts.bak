import { ERROR_CODES, HTTP_STATUS } from './constants';

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    );
  }
  return false;
}

export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === 'TimeoutError' ||
      error.message.includes('timeout') ||
      error.message.includes('timed out')
    );
  }
  return false;
}

export function isValidationError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === 'ValidationError' ||
      error.message.includes('validation')
    );
  }
  return false;
}

export function isAuthenticationError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === 'AuthenticationError' ||
      error.message.includes('authentication') ||
      error.message.includes('unauthorized')
    );
  }
  return false;
}

export function getErrorCode(error: unknown): string {
  if (isNetworkError(error)) return ERROR_CODES.NETWORK;
  if (isTimeoutError(error)) return ERROR_CODES.TIMEOUT;
  if (isValidationError(error)) return ERROR_CODES.VALIDATION;
  if (isAuthenticationError(error)) return ERROR_CODES.AUTHENTICATION;
  return ERROR_CODES.UNKNOWN;
}

export function isRetryableError(error: unknown): boolean {
  return isNetworkError(error) || isTimeoutError(error);
}

export function isRetryableStatus(status: number): boolean {
  return [
    HTTP_STATUS.TIMEOUT,
    HTTP_STATUS.TOO_MANY_REQUESTS,
    HTTP_STATUS.SERVER_ERROR,
    HTTP_STATUS.BAD_GATEWAY,
    HTTP_STATUS.UNAVAILABLE,
    HTTP_STATUS.GATEWAY_TIMEOUT,
  ].includes(status);
}

export function calculateBackoff(attempt: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 32000);
}

export function shouldRetry(error: unknown, attempt: number, maxAttempts: number): boolean {
  if (attempt >= maxAttempts) return false;
  return isRetryableError(error);
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

export function extractErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

export function createError(message: string, name: string = 'Error'): Error {
  const error = new Error(message);
  error.name = name;
  return error;
}

export function wrapError(error: unknown, context: string): Error {
  const message = extractErrorMessage(error);
  return createError(`${context}: ${message}`);
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function ensureError(value: unknown): Error {
  if (isError(value)) return value;
  return createError(String(value));
}
