import type { Role, RoleAssignment } from '@/types/rbac';
import { Permission } from '@/types/rbac';

export class RBACValidator {
  validateRole(role: Role): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!role.id || role.id.trim().length === 0) {
      errors.push('Role ID is required');
    }

    if (!role.name || role.name.trim().length === 0) {
      errors.push('Role name is required');
    }

    if (!role.type) {
      errors.push('Role type is required');
    }

    if (!Array.isArray(role.permissions)) {
      errors.push('Permissions must be an array');
    }

    if (role.permissions.length > 0) {
      const validPermissions = new Set(Object.values(Permission));
      role.permissions.forEach(p => {
        if (!validPermissions.has(p)) {
          errors.push(`Invalid permission: ${p}`);
        }
      });
    }

    if (!role.description || role.description.trim().length === 0) {
      errors.push('Role description is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validatePermissionList(permissions: Permission[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(permissions)) {
      errors.push('Permissions must be an array');
      return { valid: false, errors };
    }

    if (permissions.length === 0) {
      errors.push('At least one permission is required');
    }

    const validPermissions = new Set(Object.values(Permission));
    const uniquePermissions = new Set<Permission>();

    permissions.forEach(permission => {
      if (!validPermissions.has(permission)) {
        errors.push(`Invalid permission: ${permission}`);
      }
      uniquePermissions.add(permission);
    });

    if (uniquePermissions.size !== permissions.length) {
      errors.push('Duplicate permissions found');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateRoleAssignment(assignment: RoleAssignment): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!assignment.userId || assignment.userId.trim().length === 0) {
      errors.push('User ID is required');
    }

    if (!assignment.roleId || assignment.roleId.trim().length === 0) {
      errors.push('Role ID is required');
    }

    if (!assignment.assignedBy || assignment.assignedBy.trim().length === 0) {
      errors.push('Assigned by is required');
    }

    if (!assignment.assignedAt || typeof assignment.assignedAt !== 'number') {
      errors.push('Assigned at timestamp is required');
    }

    if (assignment.expiresAt && assignment.expiresAt <= assignment.assignedAt) {
      errors.push('Expiration time must be after assignment time');
    }

    if (!['active', 'pending', 'revoked', 'expired'].includes(assignment.status)) {
      errors.push(`Invalid status: ${assignment.status}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateUserPermissions(
    userId: string,
    permissions: Permission[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!userId || userId.trim().length === 0) {
      errors.push('User ID is required');
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      errors.push('At least one permission is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateRoleHierarchy(parentRoleId: string, childRoleId: string): { valid: boolean; message?: string } {
    if (parentRoleId === childRoleId) {
      return {
        valid: false,
        message: 'A role cannot be its own parent',
      };
    }

    return { valid: true };
  }

  validatePermissionAssignment(
    roleId: string,
    permission: Permission
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!roleId || roleId.trim().length === 0) {
      errors.push('Role ID is required');
    }

    const validPermissions = new Set(Object.values(Permission));
    if (!validPermissions.has(permission)) {
      errors.push(`Invalid permission: ${permission}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateRoleUpdate(oldRole: Role, newRole: Role): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (oldRole.id !== newRole.id) {
      errors.push('Role ID cannot be changed');
    }

    if (oldRole.type !== newRole.type) {
      errors.push('Role type cannot be changed');
    }

    const validation = this.validateRole(newRole);
    errors.push(...validation.errors);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  checkRoleNameConflict(newName: string, existingRoles: Role[]): boolean {
    return existingRoles.some(role => role.name.toLowerCase() === newName.toLowerCase());
  }

  checkCircularRoleReference(
    roleId: string,
    parentRoleId: string | undefined,
    allRoles: Map<string, Role>
  ): boolean {
    if (!parentRoleId) return false;

    let current = parentRoleId;
    const visited = new Set<string>();

    while (current) {
      if (visited.has(current)) {
        return true;
      }

      visited.add(current);

      const role = allRoles.get(current);
      if (!role || !role.parentRole) {
        break;
      }

      current = role.parentRole;
    }

    return false;
  }

  validateBulkRoleAssignment(
    userIds: string[],
    roleId: string
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(userIds) || userIds.length === 0) {
      errors.push('User IDs array is required and must not be empty');
    }

    if (!roleId || roleId.trim().length === 0) {
      errors.push('Role ID is required');
    }

    const duplicateUsers = new Set<string>();
    const userSet = new Set<string>();

    userIds.forEach(userId => {
      if (userSet.has(userId)) {
        duplicateUsers.add(userId);
      }
      userSet.add(userId);
    });

    if (duplicateUsers.size > 0) {
      errors.push(`Duplicate user IDs found: ${Array.from(duplicateUsers).join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateResourceAccess(
    userId: string,
    resourceId: string,
    accessType: 'read' | 'write' | 'delete' | 'admin'
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!userId || userId.trim().length === 0) {
      errors.push('User ID is required');
    }

    if (!resourceId || resourceId.trim().length === 0) {
      errors.push('Resource ID is required');
    }

    if (!['read', 'write', 'delete', 'admin'].includes(accessType)) {
      errors.push(`Invalid access type: ${accessType}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
