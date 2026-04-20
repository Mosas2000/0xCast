export enum Permission {
  CREATE_MARKET = 'create_market',
  EDIT_MARKET = 'edit_market',
  DELETE_MARKET = 'delete_market',
  RESOLVE_MARKET = 'resolve_market',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  VIEW_USER_DATA = 'view_user_data',
  EXPORT_DATA = 'export_data',
  MANAGE_PERMISSIONS = 'manage_permissions',
  CREATE_PORTFOLIO = 'create_portfolio',
  EDIT_PORTFOLIO = 'edit_portfolio',
  DELETE_PORTFOLIO = 'delete_portfolio',
  VIEW_REPORTS = 'view_reports',
  MANAGE_LIQUIDITY = 'manage_liquidity',
  EXECUTE_TRADES = 'execute_trades',
  VIEW_TRADES = 'view_trades',
}

export enum RoleType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  ANALYST = 'analyst',
  TRADER = 'trader',
  USER = 'user',
  GUEST = 'guest',
}

export interface Role {
  id: string;
  name: string;
  type: RoleType;
  permissions: Permission[];
  description: string;
  parentRole?: string;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: number;
  assignedBy: string;
  expiresAt?: number;
}

export interface PermissionMatrix {
  roleId: string;
  permissions: {
    [key in Permission]: boolean;
  };
  resourceRestrictions?: {
    [key: string]: boolean;
  };
}

export interface RoleHierarchy {
  roleId: string;
  level: number;
  parent?: string;
  children: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValue?: any;
  newValue?: any;
  status: 'success' | 'failure';
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface AccessControl {
  userId: string;
  roleIds: string[];
  permissions: Permission[];
  resourceAccess: {
    [key: string]: {
      read: boolean;
      write: boolean;
      delete: boolean;
      admin: boolean;
    };
  };
}

export interface RoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: number;
  expiresAt?: number;
  reason?: string;
  status: 'active' | 'pending' | 'revoked' | 'expired';
}

export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
  expiresAt?: number;
}

export interface RoleContext {
  userId: string;
  currentRole: Role;
  allRoles: Role[];
  permissions: Permission[];
  hierarchyLevel: number;
  isElevated: boolean;
}
