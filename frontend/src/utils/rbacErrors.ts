import { RBAC_CONSTANTS } from '@/constants/rbacConstants';

export class RBACError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 403
  ) {
    super(message);
    this.name = 'RBACError';
  }
}

export class InsufficientPrivilegeError extends RBACError {
  constructor(message: string = RBAC_CONSTANTS.ERRORS.INSUFFICIENT_PRIVILEGE) {
    super('INSUFFICIENT_PRIVILEGE', message, 403);
  }
}

export class PermissionDeniedError extends RBACError {
  constructor(message: string = RBAC_CONSTANTS.ERRORS.PERMISSION_DENIED) {
    super('PERMISSION_DENIED', message, 403);
  }
}

export class InvalidRoleError extends RBACError {
  constructor(message: string = RBAC_CONSTANTS.ERRORS.INVALID_ROLE) {
    super('INVALID_ROLE', message, 400);
  }
}

export class InvalidPermissionError extends RBACError {
  constructor(message: string = RBAC_CONSTANTS.ERRORS.INVALID_PERMISSION) {
    super('INVALID_PERMISSION', message, 400);
  }
}

export class UserNotFoundError extends RBACError {
  constructor(message: string = RBAC_CONSTANTS.ERRORS.USER_NOT_FOUND) {
    super('USER_NOT_FOUND', message, 404);
  }
}

export class RoleNotFoundError extends RBACError {
  constructor(message: string = RBAC_CONSTANTS.ERRORS.ROLE_NOT_FOUND) {
    super('ROLE_NOT_FOUND', message, 404);
  }
}

export class PrivilegeEscalationError extends RBACError {
  constructor(message: string = RBAC_CONSTANTS.ERRORS.PRIVILEGE_ESCALATION) {
    super('PRIVILEGE_ESCALATION', message, 403);
  }
}

export class SessionExpiredError extends RBACError {
  constructor(message: string = RBAC_CONSTANTS.ERRORS.SESSION_EXPIRED) {
    super('SESSION_EXPIRED', message, 401);
  }
}

export class RateLimitExceededError extends RBACError {
  constructor(message: string = RBAC_CONSTANTS.ERRORS.RATE_LIMIT_EXCEEDED) {
    super('RATE_LIMIT_EXCEEDED', message, 429);
  }
}

export class CircularReferenceError extends RBACError {
  constructor(message: string = RBAC_CONSTANTS.ERRORS.CIRCULAR_REFERENCE) {
    super('CIRCULAR_REFERENCE', message, 400);
  }
}

export class RBACErrorHandler {
  static handle(error: Error): { code: string; message: string; statusCode: number } {
    if (error instanceof RBACError) {
      return {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      statusCode: 500,
    };
  }

  static throwIfError<T>(result: { success: boolean; error?: Error; data?: T }): T {
    if (!result.success && result.error) {
      throw result.error;
    }
    return result.data as T;
  }

  static wrapAsync<T extends (...args: any[]) => Promise<any>>(fn: T) {
    return async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    };
  }

  static wrapSync<T extends (...args: any[]) => any>(fn: T) {
    return (...args: any[]) => {
      try {
        return { success: true, data: fn(...args) };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    };
  }
}

export function formatErrorMessage(error: RBACError): string {
  const errorMessages: Record<string, string> = {
    INSUFFICIENT_PRIVILEGE: 'You do not have sufficient privileges to perform this action',
    PERMISSION_DENIED: 'Access to this resource is denied',
    INVALID_ROLE: 'The specified role is invalid',
    INVALID_PERMISSION: 'The specified permission is invalid',
    USER_NOT_FOUND: 'The requested user was not found',
    ROLE_NOT_FOUND: 'The requested role was not found',
    PRIVILEGE_ESCALATION: 'Privilege escalation is not allowed',
    SESSION_EXPIRED: 'Your session has expired, please login again',
    RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
    CIRCULAR_REFERENCE: 'Circular reference detected in role hierarchy',
  };

  return errorMessages[error.code] || error.message;
}

export function isRBACError(error: any): error is RBACError {
  return error instanceof RBACError;
}

export function createErrorResponse(error: Error) {
  const handled = RBACErrorHandler.handle(error);
  return {
    ok: false,
    status: handled.statusCode,
    error: {
      code: handled.code,
      message: handled.message,
    },
  };
}

export function assertPermission(hasPermission: boolean, message?: string) {
  if (!hasPermission) {
    throw new PermissionDeniedError(message);
  }
}

export function assertRole(isValidRole: boolean, message?: string) {
  if (!isValidRole) {
    throw new InvalidRoleError(message);
  }
}

export function assertUser(userExists: boolean, message?: string) {
  if (!userExists) {
    throw new UserNotFoundError(message);
  }
}

export function assertPrivilege(canPerform: boolean, message?: string) {
  if (!canPerform) {
    throw new InsufficientPrivilegeError(message);
  }
}

export function assertNoPrivilegeEscalation(isSecure: boolean, message?: string) {
  if (!isSecure) {
    throw new PrivilegeEscalationError(message);
  }
}
