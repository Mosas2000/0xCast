export const ERROR_CODES = {
  UNKNOWN: 'UNKNOWN_ERROR',
  NETWORK: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  STORAGE: 'STORAGE_ERROR',
  API: 'API_ERROR',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 408,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export const RETRY_CONFIG = {
  DEFAULT_ATTEMPTS: 3,
  DEFAULT_DELAY: 1000,
  MAX_DELAY: 32000,
  BACKOFF_MULTIPLIER: 2,
} as const;

export const TIMEOUT_CONFIG = {
  DEFAULT: 5000,
  SHORT: 2000,
  MEDIUM: 10000,
  LONG: 30000,
} as const;

export const STORAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024,
  WARNING_THRESHOLD: 0.9,
  MAX_AGE_MS: 30 * 24 * 60 * 60 * 1000,
} as const;

export const LOG_CONFIG = {
  MAX_ENTRIES: 1000,
  MAX_SAMPLES: 5,
  FLUSH_INTERVAL: 60000,
} as const;

export const ERROR_MESSAGES = {
  NETWORK: 'Unable to connect. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  VALIDATION: 'Please check your input and try again.',
  AUTHENTICATION: 'Please log in to continue.',
  AUTHORIZATION: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER: 'A server error occurred. Please try again later.',
  STORAGE: 'Unable to access local storage.',
  UNKNOWN: 'An unexpected error occurred.',
} as const;
