import { Permission } from '@/types/rbac';
import { AccessControlService } from '@/services/AccessControlService';
import { AuditLogger } from '@/services/AuditLogger';

export interface AuthContext {
  userId: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
}

export function createPermissionMiddleware(
  accessControl: AccessControlService,
  auditLogger: AuditLogger,
  requiredPermission: Permission
) {
  return (context: AuthContext) => {
    const hasPermission = accessControl.checkPermission(context.userId, requiredPermission);

    auditLogger.logAction(
      context.userId,
      'access_check',
      'permission',
      requiredPermission,
      hasPermission ? 'success' : 'failed',
      context.ipAddress,
      context.userAgent
    );

    if (!hasPermission) {
      throw new Error(`User ${context.userId} lacks permission: ${requiredPermission}`);
    }

    return true;
  };
}

export function createRoleMiddleware(
  accessControl: AccessControlService,
  auditLogger: AuditLogger,
  allowedRoles: string[]
) {
  return (context: AuthContext) => {
    const userRole = accessControl.getRoleForUser(context.userId);
    const allowed = userRole && allowedRoles.includes(userRole.id);

    auditLogger.logAction(
      context.userId,
      'role_check',
      'role',
      userRole?.id || 'unknown',
      allowed ? 'success' : 'failed',
      context.ipAddress,
      context.userAgent
    );

    if (!allowed) {
      throw new Error(`User ${context.userId} has insufficient role`);
    }

    return true;
  };
}

export function createResourceAccessMiddleware(
  accessControl: AccessControlService,
  auditLogger: AuditLogger,
  accessType: 'read' | 'write' | 'delete' | 'admin'
) {
  return (context: AuthContext, resourceId: string) => {
    const hasAccess = accessControl.checkResourceAccess(context.userId, resourceId, accessType);

    auditLogger.logAction(
      context.userId,
      'resource_access_check',
      'resource',
      resourceId,
      hasAccess ? 'success' : 'failed',
      context.ipAddress,
      context.userAgent
    );

    if (!hasAccess) {
      throw new Error(`User ${context.userId} lacks ${accessType} access to resource ${resourceId}`);
    }

    return true;
  };
}

export function createRateLimitMiddleware(maxAttempts: number = 5, windowMs: number = 60000) {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (context: AuthContext) => {
    const key = context.userId;
    const attempt = attempts.get(key);
    const now = Date.now();

    if (!attempt) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (now > attempt.resetTime) {
      attempt.count = 1;
      attempt.resetTime = now + windowMs;
      return true;
    }

    if (attempt.count < maxAttempts) {
      attempt.count++;
      return true;
    }

    throw new Error(`Rate limit exceeded for user ${context.userId}`);
  };
}

export function composeMiddleware(...middlewares: Array<(ctx: AuthContext, ...args: any[]) => boolean>) {
  return (context: AuthContext, ...args: any[]) => {
    return middlewares.every(middleware => {
      try {
        return middleware(context, ...args);
      } catch (error) {
        throw error;
      }
    });
  };
}

export function createPermissionDecorator(
  accessControl: AccessControlService,
  auditLogger: AuditLogger,
  permission: Permission
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (context: AuthContext, ...args: any[]) {
      const hasPermission = accessControl.checkPermission(context.userId, permission);

      auditLogger.logAction(
        context.userId,
        `method_call:${propertyKey}`,
        'method',
        propertyKey,
        hasPermission ? 'success' : 'failed'
      );

      if (!hasPermission) {
        throw new Error(`User ${context.userId} lacks permission to call ${propertyKey}`);
      }

      return originalMethod.apply(this, [context, ...args]);
    };

    return descriptor;
  };
}

export function createRoleDecorator(
  accessControl: AccessControlService,
  auditLogger: AuditLogger,
  allowedRoles: string[]
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (context: AuthContext, ...args: any[]) {
      const userRole = accessControl.getRoleForUser(context.userId);
      const allowed = userRole && allowedRoles.includes(userRole.id);

      auditLogger.logAction(
        context.userId,
        `role_check:${propertyKey}`,
        'method',
        propertyKey,
        allowed ? 'success' : 'failed'
      );

      if (!allowed) {
        throw new Error(`User ${context.userId} lacks required role to call ${propertyKey}`);
      }

      return originalMethod.apply(this, [context, ...args]);
    };

    return descriptor;
  };
}
