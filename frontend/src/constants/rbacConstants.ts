import { Permission, RoleType } from '@/types/rbac';

export const RBAC_CONSTANTS = {
  ROLE_LEVELS: {
    [RoleType.SUPER_ADMIN]: 0,
    [RoleType.ADMIN]: 1,
    [RoleType.MODERATOR]: 2,
    [RoleType.ANALYST]: 3,
    [RoleType.TRADER]: 4,
    [RoleType.USER]: 5,
    [RoleType.GUEST]: 6,
  },

  ROLE_NAMES: {
    [RoleType.SUPER_ADMIN]: 'Super Administrator',
    [RoleType.ADMIN]: 'Administrator',
    [RoleType.MODERATOR]: 'Moderator',
    [RoleType.ANALYST]: 'Analyst',
    [RoleType.TRADER]: 'Trader',
    [RoleType.USER]: 'User',
    [RoleType.GUEST]: 'Guest',
  },

  ROLE_DESCRIPTIONS: {
    [RoleType.SUPER_ADMIN]: 'Full system access and administrative control',
    [RoleType.ADMIN]: 'Administrative functions and user management',
    [RoleType.MODERATOR]: 'Content moderation and user oversight',
    [RoleType.ANALYST]: 'Data analysis and reporting access',
    [RoleType.TRADER]: 'Trading and market creation permissions',
    [RoleType.USER]: 'Standard user with trading capabilities',
    [RoleType.GUEST]: 'Limited read-only access',
  },

  PERMISSION_CATEGORIES: {
    SYSTEM: [
      Permission.MANAGE_SYSTEM_SETTINGS,
      Permission.MANAGE_PERMISSIONS,
      Permission.VIEW_AUDIT_LOGS,
    ],
    USER: [
      Permission.MANAGE_USERS,
      Permission.MANAGE_ROLES,
    ],
    MARKET: [
      Permission.CREATE_MARKET,
      Permission.MANAGE_LIQUIDITY,
    ],
    TRADING: [
      Permission.TRADE,
    ],
    CONTENT: [
      Permission.MODERATE_CONTENT,
    ],
    ANALYTICS: [
      Permission.VIEW_ANALYTICS,
    ],
  },

  PERMISSION_DESCRIPTIONS: {
    [Permission.CREATE_MARKET]: 'Create and initialize new markets',
    [Permission.MANAGE_USERS]: 'Manage user accounts and profiles',
    [Permission.MANAGE_ROLES]: 'Assign and revoke user roles',
    [Permission.MANAGE_PERMISSIONS]: 'Modify role permissions',
    [Permission.MANAGE_SYSTEM_SETTINGS]: 'Configure system-wide settings',
    [Permission.VIEW_AUDIT_LOGS]: 'Access audit trail and logs',
    [Permission.TRADE]: 'Execute trades and transactions',
    [Permission.MODERATE_CONTENT]: 'Moderate user-generated content',
    [Permission.VIEW_ANALYTICS]: 'Access analytics dashboard',
    [Permission.MANAGE_LIQUIDITY]: 'Manage liquidity pools and rewards',
    [Permission.MANAGE_MARKETS]: 'Manage market parameters',
    [Permission.MANAGE_CONTRACTS]: 'Deploy and manage smart contracts',
    [Permission.MANAGE_NOTIFICATIONS]: 'Configure notification settings',
    [Permission.MANAGE_REPORTS]: 'Generate and export reports',
    [Permission.VIEW_REPORTS]: 'View system reports',
    [Permission.MANAGE_INTEGRATIONS]: 'Manage external integrations',
    [Permission.MANAGE_FEATURES]: 'Enable/disable platform features',
    [Permission.MANAGE_PAYMENTS]: 'Handle payment processing',
    [Permission.VIEW_ANALYTICS_DETAILED]: 'View detailed analytics',
    [Permission.MANAGE_DISCORD]: 'Manage Discord integration',
  },

  ACCESS_TYPES: ['read', 'write', 'delete', 'admin'] as const,

  ASSIGNMENT_STATUSES: ['active', 'pending', 'revoked', 'expired'] as const,

  AUDIT_ACTIONS: {
    ACCESS_CHECK: 'access_check',
    ROLE_ASSIGNMENT: 'role_assignment',
    ROLE_REVOCATION: 'role_revocation',
    PERMISSION_GRANT: 'permission_grant',
    PERMISSION_REVOKE: 'permission_revoke',
    RESOURCE_ACCESS_GRANTED: 'resource_access_granted',
    RESOURCE_ACCESS_REVOKED: 'resource_access_revoked',
    USER_REGISTRATION: 'user_registration',
    FAILED_ACCESS: 'failed_access',
  },

  SECURITY: {
    MAX_AUDIT_LOGS: 10000,
    SESSION_TIMEOUT_MS: 3600000,
    RATE_LIMIT_WINDOW_MS: 60000,
    RATE_LIMIT_MAX_ATTEMPTS: 5,
    EXPIRATION_CLEANUP_INTERVAL_MS: 60000,
  },

  ERRORS: {
    INSUFFICIENT_PRIVILEGE: 'Insufficient privilege level',
    PERMISSION_DENIED: 'Permission denied',
    INVALID_ROLE: 'Invalid role',
    INVALID_PERMISSION: 'Invalid permission',
    USER_NOT_FOUND: 'User not found',
    ROLE_NOT_FOUND: 'Role not found',
    PRIVILEGE_ESCALATION: 'Privilege escalation attempt detected',
    SESSION_EXPIRED: 'Session expired',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
    CIRCULAR_REFERENCE: 'Circular role reference detected',
  },
};

export const ROLE_HIERARCHY_MAP: Record<string, string[]> = {
  [RoleType.SUPER_ADMIN]: [RoleType.ADMIN, RoleType.MODERATOR, RoleType.ANALYST, RoleType.TRADER, RoleType.USER, RoleType.GUEST],
  [RoleType.ADMIN]: [RoleType.MODERATOR, RoleType.ANALYST, RoleType.TRADER, RoleType.USER, RoleType.GUEST],
  [RoleType.MODERATOR]: [RoleType.ANALYST, RoleType.TRADER, RoleType.USER, RoleType.GUEST],
  [RoleType.ANALYST]: [RoleType.TRADER, RoleType.USER, RoleType.GUEST],
  [RoleType.TRADER]: [RoleType.USER, RoleType.GUEST],
  [RoleType.USER]: [RoleType.GUEST],
  [RoleType.GUEST]: [],
};

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [RoleType.SUPER_ADMIN]: Object.values(Permission),
  [RoleType.ADMIN]: [
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES,
    Permission.MANAGE_PERMISSIONS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.CREATE_MARKET,
    Permission.MODERATE_CONTENT,
    Permission.MANAGE_LIQUIDITY,
    Permission.TRADE,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_MARKETS,
    Permission.MANAGE_NOTIFICATIONS,
  ],
  [RoleType.MODERATOR]: [
    Permission.MODERATE_CONTENT,
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_REPORTS,
  ],
  [RoleType.ANALYST]: [
    Permission.VIEW_ANALYTICS,
    Permission.CREATE_MARKET,
    Permission.MANAGE_REPORTS,
    Permission.VIEW_REPORTS,
  ],
  [RoleType.TRADER]: [
    Permission.TRADE,
    Permission.CREATE_MARKET,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_REPORTS,
  ],
  [RoleType.USER]: [
    Permission.TRADE,
    Permission.CREATE_MARKET,
    Permission.VIEW_REPORTS,
  ],
  [RoleType.GUEST]: [
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_REPORTS,
  ],
};

export function getRoleLevel(roleId: string): number {
  return RBAC_CONSTANTS.ROLE_LEVELS[roleId as RoleType] ?? -1;
}

export function getRoleName(roleId: string): string {
  return RBAC_CONSTANTS.ROLE_NAMES[roleId as RoleType] ?? roleId;
}

export function getRoleDescription(roleId: string): string {
  return RBAC_CONSTANTS.ROLE_DESCRIPTIONS[roleId as RoleType] ?? '';
}

export function getPermissionDescription(permission: Permission): string {
  return RBAC_CONSTANTS.PERMISSION_DESCRIPTIONS[permission] ?? permission;
}

export function isValidRole(roleId: string): boolean {
  return Object.values(RoleType).includes(roleId as RoleType);
}

export function isValidPermission(permission: string): boolean {
  return Object.values(Permission).includes(permission as Permission);
}

export function canAssignRole(assignerRoleId: string, targetRoleId: string): boolean {
  const assignerLevel = getRoleLevel(assignerRoleId);
  const targetLevel = getRoleLevel(targetRoleId);
  return assignerLevel < targetLevel;
}

export function getDefaultPermissionsForRole(roleId: string): Permission[] {
  return DEFAULT_ROLE_PERMISSIONS[roleId] ?? [];
}

export function getChildRoles(roleId: string): string[] {
  return ROLE_HIERARCHY_MAP[roleId] ?? [];
}
