import { Permission, AccessControl, PermissionCheck, RoleContext } from '@/types/rbac';
import { RoleHierarchyManager } from '@/services/RoleHierarchyManager';
import { PermissionMatrixManager } from '@/services/PermissionMatrixManager';

export class AccessControlService {
  private roleHierarchy: RoleHierarchyManager;
  private permissionMatrix: PermissionMatrixManager;
  private userAccessControl: Map<string, AccessControl>;

  constructor(
    roleHierarchy: RoleHierarchyManager,
    permissionMatrix: PermissionMatrixManager
  ) {
    this.roleHierarchy = roleHierarchy;
    this.permissionMatrix = permissionMatrix;
    this.userAccessControl = new Map();
  }

  registerUser(userId: string, roleIds: string[]): AccessControl {
    const permissions: Set<Permission> = new Set();
    const resourceAccess: AccessControl['resourceAccess'] = {};

    roleIds.forEach(roleId => {
      const permissions_list = this.permissionMatrix.getPermissionsForRole(roleId);
      permissions_list.forEach(p => permissions.add(p));
    });

    const accessControl: AccessControl = {
      userId,
      roleIds,
      permissions: Array.from(permissions),
      resourceAccess,
    };

    this.userAccessControl.set(userId, accessControl);
    return accessControl;
  }

  getUserAccessControl(userId: string): AccessControl | undefined {
    return this.userAccessControl.get(userId);
  }

  checkPermission(userId: string, permission: Permission): PermissionCheck {
    const accessControl = this.userAccessControl.get(userId);

    if (!accessControl) {
      return {
        hasPermission: false,
        reason: 'User not found',
      };
    }

    const hasPermission = accessControl.permissions.includes(permission);

    return {
      hasPermission,
      reason: hasPermission ? undefined : 'Permission denied',
    };
  }

  checkMultiplePermissions(
    userId: string,
    permissions: Permission[],
    requireAll: boolean = true
  ): PermissionCheck {
    const accessControl = this.userAccessControl.get(userId);

    if (!accessControl) {
      return {
        hasPermission: false,
        reason: 'User not found',
      };
    }

    const userPermissions = new Set(accessControl.permissions);

    let hasPermission: boolean;
    if (requireAll) {
      hasPermission = permissions.every(p => userPermissions.has(p));
    } else {
      hasPermission = permissions.some(p => userPermissions.has(p));
    }

    return {
      hasPermission,
      reason: hasPermission ? undefined : 'Permission denied',
    };
  }

  canPerformAction(
    userId: string,
    action: string,
    requiredPermissions: Permission[]
  ): PermissionCheck {
    return this.checkMultiplePermissions(userId, requiredPermissions, true);
  }

  grantPermission(userId: string, permission: Permission): void {
    const accessControl = this.userAccessControl.get(userId);
    if (accessControl && !accessControl.permissions.includes(permission)) {
      accessControl.permissions.push(permission);
    }
  }

  revokePermission(userId: string, permission: Permission): void {
    const accessControl = this.userAccessControl.get(userId);
    if (accessControl) {
      accessControl.permissions = accessControl.permissions.filter(p => p !== permission);
    }
  }

  addRole(userId: string, roleId: string): void {
    const accessControl = this.userAccessControl.get(userId);
    if (accessControl && !accessControl.roleIds.includes(roleId)) {
      accessControl.roleIds.push(roleId);

      const rolePermissions = this.permissionMatrix.getPermissionsForRole(roleId);
      rolePermissions.forEach(p => {
        if (!accessControl.permissions.includes(p)) {
          accessControl.permissions.push(p);
        }
      });
    }
  }

  removeRole(userId: string, roleId: string): void {
    const accessControl = this.userAccessControl.get(userId);
    if (accessControl) {
      accessControl.roleIds = accessControl.roleIds.filter(id => id !== roleId);
      this.recalculatePermissions(userId);
    }
  }

  private recalculatePermissions(userId: string): void {
    const accessControl = this.userAccessControl.get(userId);
    if (!accessControl) return;

    const permissions: Set<Permission> = new Set();
    accessControl.roleIds.forEach(roleId => {
      const rolePermissions = this.permissionMatrix.getPermissionsForRole(roleId);
      rolePermissions.forEach(p => permissions.add(p));
    });

    accessControl.permissions = Array.from(permissions);
  }

  grantResourceAccess(
    userId: string,
    resourceId: string,
    access: {
      read: boolean;
      write: boolean;
      delete: boolean;
      admin: boolean;
    }
  ): void {
    const accessControl = this.userAccessControl.get(userId);
    if (accessControl) {
      accessControl.resourceAccess[resourceId] = access;
    }
  }

  canAccessResource(
    userId: string,
    resourceId: string,
    accessType: 'read' | 'write' | 'delete' | 'admin'
  ): boolean {
    const accessControl = this.userAccessControl.get(userId);
    if (!accessControl) return false;

    const resource = accessControl.resourceAccess[resourceId];
    if (!resource) return false;

    return resource[accessType];
  }

  getRoleContext(userId: string): RoleContext | undefined {
    const accessControl = this.userAccessControl.get(userId);
    if (!accessControl) return undefined;

    const primaryRoleId = accessControl.roleIds[0];
    const primaryRole = this.roleHierarchy.getRole(primaryRoleId);

    if (!primaryRole) return undefined;

    const allRoles = accessControl.roleIds
      .map(roleId => this.roleHierarchy.getRole(roleId))
      .filter((role): role is any => role !== undefined);

    const hierarchyLevel = this.roleHierarchy.getHierarchyLevel(primaryRoleId);
    const isElevated = hierarchyLevel < 3;

    return {
      userId,
      currentRole: primaryRole,
      allRoles,
      permissions: accessControl.permissions,
      hierarchyLevel,
      isElevated,
    };
  }

  preventPrivilegeEscalation(userId: string, targetRoleId: string): boolean {
    const accessControl = this.userAccessControl.get(userId);
    if (!accessControl) return false;

    const userRoleIds = accessControl.roleIds;
    if (userRoleIds.length === 0) return false;

    const userHighestRoleId = userRoleIds[0];
    return this.roleHierarchy.canAssignRole(userHighestRoleId, targetRoleId);
  }

  getAllUsersWithPermission(permission: Permission): string[] {
    const users: string[] = [];

    this.userAccessControl.forEach((accessControl, userId) => {
      if (accessControl.permissions.includes(permission)) {
        users.push(userId);
      }
    });

    return users;
  }

  getAllUsersWithRole(roleId: string): string[] {
    const users: string[] = [];

    this.userAccessControl.forEach((accessControl, userId) => {
      if (accessControl.roleIds.includes(roleId)) {
        users.push(userId);
      }
    });

    return users;
  }

  removeUser(userId: string): boolean {
    return this.userAccessControl.delete(userId);
  }

  getAccessControlSummary(userId: string): {
    roles: string[];
    permissions: number;
    resourceAccess: number;
  } | null {
    const accessControl = this.userAccessControl.get(userId);
    if (!accessControl) return null;

    return {
      roles: accessControl.roleIds,
      permissions: accessControl.permissions.length,
      resourceAccess: Object.keys(accessControl.resourceAccess).length,
    };
  }
}
