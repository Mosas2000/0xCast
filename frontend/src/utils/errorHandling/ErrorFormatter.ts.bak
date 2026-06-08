export class ErrorFormatter {
  static formatError(error: Error): string {
    return `${error.name}: ${error.message}`;
  }

  static formatErrorWithStack(error: Error): string {
    return `${this.formatError(error)}\n\nStack trace:\n${error.stack || 'No stack trace available'}`;
  }

  static formatUserFriendly(error: Error): string {
    const friendlyMessages: Record<string, string> = {
      NetworkError: 'Unable to connect to the server. Please check your internet connection.',
      TimeoutError: 'The request took too long. Please try again.',
      ValidationError: 'Please check your input and try again.',
      AuthenticationError: 'Please log in to continue.',
      AuthorizationError: 'You do not have permission to perform this action.',
      NotFoundError: 'The requested resource was not found.',
      ServerError: 'A server error occurred. Please try again later.',
    };

    return friendlyMessages[error.name] || 'An unexpected error occurred. Please try again.';
  }

  static formatForLogging(error: Error, context?: Record<string, unknown>): string {
    const parts = [
      `Error: ${error.name}`,
      `Message: ${error.message}`,
      `Timestamp: ${new Date().toISOString()}`,
    ];

    if (error.stack) {
      parts.push(`Stack: ${error.stack}`);
    }

    if (context) {
      parts.push(`Context: ${JSON.stringify(context, null, 2)}`);
    }

    return parts.join('\n');
  }

  static formatForDisplay(error: Error): {
    title: string;
    message: string;
    details?: string;
  } {
    return {
      title: error.name || 'Error',
      message: this.formatUserFriendly(error),
      details: error.message,
    };
  }

  static formatValidationErrors(errors: Array<{ field: string; message: string }>): string {
    if (errors.length === 0) return '';
    if (errors.length === 1) return errors[0].message;

    return errors.map((e, i) => `${i + 1}. ${e.field}: ${e.message}`).join('\n');
  }

  static formatApiError(status: number, message?: string): string {
    const statusMessages: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      408: 'Request Timeout',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };

    const statusText = statusMessages[status] || 'Unknown Error';
    return message ? `${statusText}: ${message}` : statusText;
  }

  static truncate(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  static sanitize(text: string): string {
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}
