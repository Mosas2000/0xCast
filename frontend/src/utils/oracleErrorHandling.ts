export class OracleError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'OracleError';
  }
}

export class ValidationError extends OracleError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class ProviderError extends OracleError {
  constructor(message: string, public providerId: string, details?: any) {
    super(message, 'PROVIDER_ERROR', 502, details);
    this.name = 'ProviderError';
  }
}

export class ConsensusError extends OracleError {
  constructor(message: string, details?: any) {
    super(message, 'CONSENSUS_ERROR', 424, details);
    this.name = 'ConsensusError';
  }
}

export class TimeoutError extends OracleError {
  constructor(message: string, details?: any) {
    super(message, 'TIMEOUT_ERROR', 504, details);
    this.name = 'TimeoutError';
  }
}

export class NetworkError extends OracleError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', 503, details);
    this.name = 'NetworkError';
  }
}

export class FallbackError extends OracleError {
  constructor(message: string, details?: any) {
    super(message, 'FALLBACK_ERROR', 503, details);
    this.name = 'FallbackError';
  }
}

export class ErrorHandler {
  static handle(error: unknown): OracleError {
    if (error instanceof OracleError) {
      return error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return new TimeoutError('Request timeout', { original: error });
      }

      if (error.message.includes('network') || error.message.includes('fetch')) {
        return new NetworkError(error.message, { original: error });
      }

      return new OracleError(error.message, 'UNKNOWN_ERROR', 500, { original: error });
    }

    return new OracleError('Unknown error occurred', 'UNKNOWN_ERROR', 500);
  }

  static formatError(error: OracleError): {
    message: string;
    code: string;
    statusCode: number;
    details?: any;
  } {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  static isRetryable(error: OracleError): boolean {
    return (
      error.code === 'TIMEOUT_ERROR' ||
      error.code === 'NETWORK_ERROR' ||
      error.statusCode >= 500
    );
  }

  static isFatal(error: OracleError): boolean {
    return (
      error.code === 'VALIDATION_ERROR' ||
      error.statusCode === 400 ||
      error.statusCode === 404
    );
  }
}
