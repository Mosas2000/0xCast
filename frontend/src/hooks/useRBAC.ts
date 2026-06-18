import { useState, useCallback, useEffect } from 'react';
import type { Role, RoleAssignment, AuditLog } from '@/types/rbac';
import { Permission } from '@/types/rbac';
import { AccessControlService } from '@/services/AccessControlService';
import { RoleAssignmentService } from '@/services/RoleAssignmentService';
import { AuditLogger } from '@/services/AuditLogger';
import { RoleHierarchyManager } from '@/services/RoleHierarchyManager';
import { PermissionMatrixManager } from '@/services/PermissionMatrixManager';

export function usePermission(userId: string, accessControl: AccessControlService) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      const userPermissions = accessControl.getUserPermissions(userId);
      setPermissions(userPermissions);
      setLoading(false);
    }
  }, [userId, accessControl]);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.every(p => permissions.includes(p));
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (permissionList: Permission[]): boolean => {
      return permissionList.some(p => permissions.includes(p));
    },
    [permissions]
  );

  return {
    permissions,
    loading,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  };
}

export function useRole(userId: string, accessControl: AccessControlService) {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      const userRole = accessControl.getRoleForUser(userId);
      setRole(userRole || null);
      setLoading(false);
    }
  }, [userId, accessControl]);

  return {
    role,
    loading,
    roleId: role?.id,
    roleType: role?.type,
  };
}

export function useRoleAssignment(assignmentService: RoleAssignmentService) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignRole = useCallback(
    async (
      userId: string,
      roleId: string,
      assignedBy: string,
      reason?: string,
      expiresAt?: number
    ): Promise<RoleAssignment | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const assignment = assignmentService.assignRole(userId, roleId, assignedBy, reason, expiresAt);
        return assignment;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to assign role';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [assignmentService]
  );

  const revokeRole = useCallback(
    async (userId: string, roleId: string, reason?: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        assignmentService.revokeRole(userId, roleId, reason);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to revoke role';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [assignmentService]
  );

  const bulkAssignRole = useCallback(
    async (
      userIds: string[],
      roleId: string,
      assignedBy: string,
      reason?: string
    ): Promise<{ successful: string[]; failed: string[] }> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = assignmentService.bulkAssignRole(userIds, roleId, assignedBy, reason);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to bulk assign role';
        setError(message);
        return { successful: [], failed: userIds };
      } finally {
        setIsLoading(false);
      }
    },
    [assignmentService]
  );

  return {
    assignRole,
    revokeRole,
    bulkAssignRole,
    isLoading,
    error,
  };
}

export function useAuditLog(auditLogger: AuditLogger) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const getLogsByUser = useCallback(
    (userId: string) => {
      setLoading(true);
      const userLogs = auditLogger.getLogsByUser(userId);
      setLogs(userLogs);
      setLoading(false);
    },
    [auditLogger]
  );

  const getLogsByAction = useCallback(
    (action: string) => {
      setLoading(true);
      const actionLogs = auditLogger.getLogs().filter(log => log.action === action);
      setLogs(actionLogs);
      setLoading(false);
    },
    [auditLogger]
  );

  const getFailedAccessAttempts = useCallback(
    (limit?: number) => {
      setLoading(true);
      const failedLogs = auditLogger.getFailedAccessAttempts(limit);
      setLogs(failedLogs);
      setLoading(false);
    },
    [auditLogger]
  );

  const getLogsByTimeRange = useCallback(
    (startTime: number, endTime: number) => {
      setLoading(true);
      const rangeLogs = auditLogger
        .getLogs()
        .filter(log => log.timestamp >= startTime && log.timestamp <= endTime);
      setLogs(rangeLogs);
      setLoading(false);
    },
    [auditLogger]
  );

  const exportLogs = useCallback(
    (format: 'json' | 'csv') => {
      return auditLogger.exportLogs(logs, format);
    },
    [auditLogger, logs]
  );

  return {
    logs,
    loading,
    getLogsByUser,
    getLogsByAction,
    getFailedAccessAttempts,
    getLogsByTimeRange,
    exportLogs,
  };
}

export function useRoleHierarchy(hierarchyManager: RoleHierarchyManager) {
  const [roles, setRoles] = useState<Map<string, Role>>(new Map());

  const getRoleHierarchy = useCallback(() => {
    return hierarchyManager.getRoleHierarchy();
  }, [hierarchyManager]);

  const isRoleHigherThan = useCallback(
    (roleId1: string, roleId2: string): boolean => {
      return hierarchyManager.isRoleHigherThan(roleId1, roleId2);
    },
    [hierarchyManager]
  );

  const getAncestors = useCallback(
    (roleId: string): Map<string, Role> => {
      return hierarchyManager.getAncestorRoles(roleId);
    },
    [hierarchyManager]
  );

  const getDescendants = useCallback(
    (roleId: string): Map<string, Role> => {
      return hierarchyManager.getDescendantRoles(roleId);
    },
    [hierarchyManager]
  );

  return {
    roles,
    getRoleHierarchy,
    isRoleHigherThan,
    getAncestors,
    getDescendants,
  };
}

export function usePermissionMatrix(permissionManager: PermissionMatrixManager) {
  const [permissions, setPermissions] = useState<Map<string, Permission[]>>(new Map());

  const getRolePermissions = useCallback(
    (roleId: string): Permission[] => {
      return permissionManager.getRolePermissions(roleId);
    },
    [permissionManager]
  );

  const grantPermission = useCallback(
    (roleId: string, permission: Permission): boolean => {
      return permissionManager.grantPermission(roleId, permission);
    },
    [permissionManager]
  );

  const revokePermission = useCallback(
    (roleId: string, permission: Permission): boolean => {
      return permissionManager.revokePermission(roleId, permission);
    },
    [permissionManager]
  );

  const hasPermission = useCallback(
    (roleId: string, permission: Permission): boolean => {
      return permissionManager.hasPermission(roleId, permission);
    },
    [permissionManager]
  );

  const getPermissionCoverage = useCallback(
    (roleId: string): number => {
      return permissionManager.getPermissionCoverage(roleId);
    },
    [permissionManager]
  );

  return {
    permissions,
    getRolePermissions,
    grantPermission,
    revokePermission,
    hasPermission,
    getPermissionCoverage,
  };
}

export function useAccessControl(accessControl: AccessControlService) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkPermission = useCallback(
    (userId: string, permission: Permission): boolean => {
      return accessControl.checkPermission(userId, permission);
    },
    [accessControl]
  );

  const checkResourceAccess = useCallback(
    (userId: string, resourceId: string, accessType: 'read' | 'write' | 'delete' | 'admin'): boolean => {
      return accessControl.checkResourceAccess(userId, resourceId, accessType);
    },
    [accessControl]
  );

  const grantResourceAccess = useCallback(
    (userId: string, resourceId: string, accessType: 'read' | 'write' | 'delete' | 'admin'): void => {
      accessControl.grantResourceAccess(userId, resourceId, accessType);
    },
    [accessControl]
  );

  const revokeResourceAccess = useCallback(
    (userId: string, resourceId: string, accessType: 'read' | 'write' | 'delete' | 'admin'): void => {
      accessControl.revokeResourceAccess(userId, resourceId, accessType);
    },
    [accessControl]
  );

  return {
    isAuthorized,
    loading,
    checkPermission,
    checkResourceAccess,
    grantResourceAccess,
    revokeResourceAccess,
  };
}
