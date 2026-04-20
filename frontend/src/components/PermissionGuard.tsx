import React from 'react';
import { Permission } from '@/types/rbac';
import { usePermission } from '@/hooks/useRBAC';
import { AccessControlService } from '@/services/AccessControlService';

interface PermissionGuardProps {
  userId: string;
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  accessControl: AccessControlService;
}

export function PermissionGuard({
  userId,
  permission,
  children,
  fallback = null,
  accessControl,
}: PermissionGuardProps) {
  const { hasPermission } = usePermission(userId, accessControl);

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

interface MultiPermissionGuardProps {
  userId: string;
  permissions: Permission[];
  children: React.ReactNode;
  requireAll?: boolean;
  fallback?: React.ReactNode;
  accessControl: AccessControlService;
}

export function MultiPermissionGuard({
  userId,
  permissions,
  children,
  requireAll = false,
  fallback = null,
  accessControl,
}: MultiPermissionGuardProps) {
  const { hasAllPermissions, hasAnyPermission } = usePermission(userId, accessControl);

  const hasRequiredPermissions = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (hasRequiredPermissions) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

interface RoleGuardProps {
  userId: string;
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  accessControl: AccessControlService;
}

export function RoleGuard({ userId, allowedRoles, children, fallback = null, accessControl }: RoleGuardProps) {
  const role = accessControl.getRoleForUser(userId);

  if (role && allowedRoles.includes(role.id)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

interface UnauthorizedFallbackProps {
  message?: string;
}

export function UnauthorizedFallback({ message = 'You do not have permission to view this content' }: UnauthorizedFallbackProps) {
  return (
    <div className="unauthorized-message">
      <p>{message}</p>
    </div>
  );
}
