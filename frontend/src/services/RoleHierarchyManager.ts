import type { Role, RoleHierarchy } from '@/types/rbac';
import { Permission } from '@/types/rbac';
import { RoleType } from '@/types/rbac';

export class RoleHierarchyManager {
  private hierarchy: Map<string, RoleHierarchy>;
  private roles: Map<string, Role>;

  constructor() {
    this.hierarchy = new Map();
    this.roles = new Map();
    this.initializeDefaultHierarchy();
  }

  private initializeDefaultHierarchy(): void {
    const superAdminRole: Role = {
      id: 'super_admin_role',
      name: 'Super Admin',
      type: RoleType.SUPER_ADMIN,
      permissions: Object.values(Permission),
      description: 'Full system access',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    };

    const adminRole: Role = {
      id: 'admin_role',
      name: 'Admin',
      type: RoleType.ADMIN,
      permissions: [
        Permission.CREATE_MARKET,
        Permission.EDIT_MARKET,
        Permission.DELETE_MARKET,
        Permission.RESOLVE_MARKET,
        Permission.MANAGE_USERS,
        Permission.MANAGE_ROLES,
        Permission.VIEW_AUDIT_LOGS,
        Permission.VIEW_ANALYTICS,
      ],
      description: 'Administrator access',
      parentRole: 'super_admin_role',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    };

    const moderatorRole: Role = {
      id: 'moderator_role',
      name: 'Moderator',
      type: RoleType.MODERATOR,
      permissions: [
        Permission.RESOLVE_MARKET,
        Permission.VIEW_AUDIT_LOGS,
        Permission.VIEW_ANALYTICS,
        Permission.VIEW_USER_DATA,
      ],
      description: 'Market moderation access',
      parentRole: 'admin_role',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    };

    const analystRole: Role = {
      id: 'analyst_role',
      name: 'Analyst',
      type: RoleType.ANALYST,
      permissions: [
        Permission.VIEW_ANALYTICS,
        Permission.VIEW_REPORTS,
        Permission.EXPORT_DATA,
        Permission.VIEW_TRADES,
      ],
      description: 'Data analysis access',
      parentRole: 'moderator_role',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    };

    const traderRole: Role = {
      id: 'trader_role',
      name: 'Trader',
      type: RoleType.TRADER,
      permissions: [
        Permission.CREATE_PORTFOLIO,
        Permission.EDIT_PORTFOLIO,
        Permission.DELETE_PORTFOLIO,
        Permission.EXECUTE_TRADES,
        Permission.VIEW_TRADES,
      ],
      description: 'Trading access',
      parentRole: 'analyst_role',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    };

    const userRole: Role = {
      id: 'user_role',
      name: 'User',
      type: RoleType.USER,
      permissions: [
        Permission.CREATE_PORTFOLIO,
        Permission.VIEW_TRADES,
      ],
      description: 'Standard user access',
      parentRole: 'trader_role',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    };

    const guestRole: Role = {
      id: 'guest_role',
      name: 'Guest',
      type: RoleType.GUEST,
      permissions: [],
      description: 'Limited guest access',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    };

    [superAdminRole, adminRole, moderatorRole, analystRole, traderRole, userRole, guestRole].forEach(
      role => {
        this.roles.set(role.id, role);
      }
    );

    this.hierarchy.set('super_admin_role', {
      roleId: 'super_admin_role',
      level: 0,
      children: ['admin_role'],
    });

    this.hierarchy.set('admin_role', {
      roleId: 'admin_role',
      level: 1,
      parent: 'super_admin_role',
      children: ['moderator_role'],
    });

    this.hierarchy.set('moderator_role', {
      roleId: 'moderator_role',
      level: 2,
      parent: 'admin_role',
      children: ['analyst_role'],
    });

    this.hierarchy.set('analyst_role', {
      roleId: 'analyst_role',
      level: 3,
      parent: 'moderator_role',
      children: ['trader_role'],
    });

    this.hierarchy.set('trader_role', {
      roleId: 'trader_role',
      level: 4,
      parent: 'analyst_role',
      children: ['user_role'],
    });

    this.hierarchy.set('user_role', {
      roleId: 'user_role',
      level: 5,
      parent: 'trader_role',
      children: ['guest_role'],
    });

    this.hierarchy.set('guest_role', {
      roleId: 'guest_role',
      level: 6,
      parent: 'user_role',
      children: [],
    });
  }

  getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  getRoleHierarchy(roleId: string): RoleHierarchy | undefined {
    return this.hierarchy.get(roleId);
  }

  getHierarchyLevel(roleId: string): number {
    const hierarchy = this.hierarchy.get(roleId);
    return hierarchy?.level ?? -1;
  }

  isRoleHigherThan(roleId1: string, roleId2: string): boolean {
    const level1 = this.getHierarchyLevel(roleId1);
    const level2 = this.getHierarchyLevel(roleId2);
    return level1 < level2 && level1 !== -1;
  }

  getParentRole(roleId: string): Role | undefined {
    const hierarchy = this.hierarchy.get(roleId);
    if (!hierarchy || !hierarchy.parent) return undefined;
    return this.roles.get(hierarchy.parent);
  }

  getChildRoles(roleId: string): Role[] {
    const hierarchy = this.hierarchy.get(roleId);
    if (!hierarchy) return [];

    return hierarchy.children
      .map(childId => this.roles.get(childId))
      .filter((role): role is Role => role !== undefined);
  }

  getAllAncestors(roleId: string): Role[] {
    const ancestors: Role[] = [];
    let current = this.getRole(roleId);

    while (current) {
      const parent = this.getParentRole(current.id);
      if (parent) {
        ancestors.push(parent);
        current = parent;
      } else {
        break;
      }
    }

    return ancestors;
  }

  getAllDescendants(roleId: string): Role[] {
    const descendants: Role[] = [];
    const visited = new Set<string>();

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const children = this.getChildRoles(id);
      descendants.push(...children);

      children.forEach(child => traverse(child.id));
    };

    traverse(roleId);
    return descendants;
  }

  canAssignRole(assignerRoleId: string, targetRoleId: string): boolean {
    return this.isRoleHigherThan(assignerRoleId, targetRoleId);
  }

  addRole(role: Role): void {
    this.roles.set(role.id, role);

    if (!this.hierarchy.has(role.id)) {
      const level = role.parentRole
        ? (this.getHierarchyLevel(role.parentRole) ?? 0) + 1
        : 0;

      this.hierarchy.set(role.id, {
        roleId: role.id,
        level,
        parent: role.parentRole,
        children: [],
      });

      if (role.parentRole) {
        const parent = this.hierarchy.get(role.parentRole);
        if (parent) {
          parent.children.push(role.id);
        }
      }
    }
  }

  removeRole(roleId: string): boolean {
    if (!this.roles.has(roleId)) return false;

    const hierarchy = this.hierarchy.get(roleId);
    if (hierarchy && hierarchy.parent) {
      const parent = this.hierarchy.get(hierarchy.parent);
      if (parent) {
        parent.children = parent.children.filter(id => id !== roleId);
      }
    }

    this.roles.delete(roleId);
    this.hierarchy.delete(roleId);
    return true;
  }

  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  getRolesByType(type: RoleType): Role[] {
    return Array.from(this.roles.values()).filter(role => role.type === type);
  }
}
