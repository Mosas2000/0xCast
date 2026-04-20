# RBAC API Reference

## AccessControlService

Core service for access control enforcement.

### Methods

#### `registerUser(userId: string, roleId: string): void`
Register a user with a specific role.

```typescript
accessControl.registerUser('user123', 'trader');
```

#### `checkPermission(userId: string, permission: Permission): boolean`
Check if user has specific permission.

```typescript
const hasPermission = accessControl.checkPermission('user123', Permission.TRADE);
```

#### `checkResourceAccess(userId: string, resourceId: string, accessType: AccessType): boolean`
Check if user has specific access to a resource.

```typescript
const canWrite = accessControl.checkResourceAccess('user123', 'market-456', 'write');
```

#### `grantResourceAccess(userId: string, resourceId: string, accessType: AccessType): void`
Grant resource access to user.

```typescript
accessControl.grantResourceAccess('user123', 'market-456', 'write');
```

#### `revokeResourceAccess(userId: string, resourceId: string, accessType: AccessType): void`
Revoke resource access from user.

```typescript
accessControl.revokeResourceAccess('user123', 'market-456', 'write');
```

#### `getRoleForUser(userId: string): Role | null`
Get user's current role.

```typescript
const role = accessControl.getRoleForUser('user123');
```

#### `getUserPermissions(userId: string): Permission[]`
Get all permissions for user.

```typescript
const permissions = accessControl.getUserPermissions('user123');
```

#### `canAssignRole(assignerId: string, targetRoleId: string): boolean`
Check if assigner can assign target role.

```typescript
const canAssign = accessControl.canAssignRole('admin123', 'moderator');
```

---

## RoleHierarchyManager

Manages role hierarchy and relationships.

### Methods

#### `getRoleHierarchy(): Map<string, Role>`
Get all roles in hierarchy.

```typescript
const hierarchy = hierarchyManager.getRoleHierarchy();
```

#### `isRoleHigherThan(roleId1: string, roleId2: string): boolean`
Check if roleId1 is higher in hierarchy than roleId2.

```typescript
const isSuperior = hierarchyManager.isRoleHigherThan('admin', 'user');
```

#### `getAncestorRoles(roleId: string): Map<string, Role>`
Get all ancestor roles.

```typescript
const ancestors = hierarchyManager.getAncestorRoles('user');
```

#### `getDescendantRoles(roleId: string): Map<string, Role>`
Get all descendant roles.

```typescript
const descendants = hierarchyManager.getDescendantRoles('admin');
```

#### `getRoleByType(type: RoleType): Role | null`
Get role by type.

```typescript
const adminRole = hierarchyManager.getRoleByType(RoleType.ADMIN);
```

---

## PermissionMatrixManager

Manages permission assignments to roles.

### Methods

#### `grantPermission(roleId: string, permission: Permission): boolean`
Grant permission to role.

```typescript
permissionMatrix.grantPermission('admin', Permission.MANAGE_USERS);
```

#### `revokePermission(roleId: string, permission: Permission): boolean`
Revoke permission from role.

```typescript
permissionMatrix.revokePermission('user', Permission.MANAGE_USERS);
```

#### `getRolePermissions(roleId: string): Permission[]`
Get all permissions for role.

```typescript
const perms = permissionMatrix.getRolePermissions('admin');
```

#### `hasPermission(roleId: string, permission: Permission): boolean`
Check if role has permission.

```typescript
const has = permissionMatrix.hasPermission('admin', Permission.TRADE);
```

#### `getPermissionCoverage(roleId: string): number`
Get percentage of permissions assigned to role (0-100).

```typescript
const coverage = permissionMatrix.getPermissionCoverage('admin');
```

---

## RoleAssignmentService

Manages user role assignments and lifecycle.

### Methods

#### `assignRole(userId: string, roleId: string, assignedBy: string, reason?: string, expiresAt?: number): RoleAssignment`
Assign role to user.

```typescript
const assignment = roleAssignment.assignRole(
  'user123',
  'moderator',
  'admin456',
  'Promoted to moderator',
  Date.now() + 30 * 24 * 60 * 60 * 1000
);
```

#### `revokeRole(userId: string, roleId: string, reason?: string): void`
Revoke role from user.

```typescript
roleAssignment.revokeRole('user123', 'moderator', 'Demotion');
```

#### `getAssignmentsByUser(userId: string): RoleAssignment[]`
Get all role assignments for user.

```typescript
const assignments = roleAssignment.getAssignmentsByUser('user123');
```

#### `getAssignmentsByRole(roleId: string): RoleAssignment[]`
Get all users assigned to role.

```typescript
const assignees = roleAssignment.getAssignmentsByRole('moderator');
```

#### `bulkAssignRole(userIds: string[], roleId: string, assignedBy: string, reason?: string): { successful: string[]; failed: string[] }`
Assign role to multiple users.

```typescript
const result = roleAssignment.bulkAssignRole(
  ['user1', 'user2', 'user3'],
  'trader',
  'admin456',
  'Bulk promotion'
);
```

#### `cleanupExpiredAssignments(): number`
Remove expired role assignments.

```typescript
const cleaned = roleAssignment.cleanupExpiredAssignments();
```

---

## AuditLogger

Records all system actions for audit trail.

### Methods

#### `logAction(userId: string, action: string, resource: string, resourceId: string, status: string, ipAddress?: string, userAgent?: string): void`
Log an action.

```typescript
auditLogger.logAction(
  'user123',
  'delete_market',
  'market',
  'market-456',
  'success',
  '192.168.1.1',
  'Mozilla/5.0...'
);
```

#### `getLogs(): AuditLog[]`
Get all logs.

```typescript
const allLogs = auditLogger.getLogs();
```

#### `getLogsByUser(userId: string): AuditLog[]`
Get logs for specific user.

```typescript
const userLogs = auditLogger.getLogsByUser('user123');
```

#### `getFailedAccessAttempts(limit?: number): AuditLog[]`
Get failed access attempts.

```typescript
const failed = auditLogger.getFailedAccessAttempts(10);
```

#### `exportLogs(logs: AuditLog[], format: 'json' | 'csv'): string`
Export logs in specified format.

```typescript
const json = auditLogger.exportLogs(logs, 'json');
const csv = auditLogger.exportLogs(logs, 'csv');
```

#### `getAuditSummary(): AuditSummary`
Get audit statistics.

```typescript
const summary = auditLogger.getAuditSummary();
```

---

## React Hooks

### `usePermission(userId: string, accessControl: AccessControlService)`

```typescript
const {
  permissions,
  loading,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
} = usePermission(userId, accessControl);
```

### `useRole(userId: string, accessControl: AccessControlService)`

```typescript
const { role, loading, roleId, roleType } = useRole(userId, accessControl);
```

### `useRoleAssignment(assignmentService: RoleAssignmentService)`

```typescript
const {
  assignRole,
  revokeRole,
  bulkAssignRole,
  isLoading,
  error,
} = useRoleAssignment(assignmentService);
```

### `useAuditLog(auditLogger: AuditLogger)`

```typescript
const {
  logs,
  loading,
  getLogsByUser,
  getLogsByAction,
  getFailedAccessAttempts,
  getLogsByTimeRange,
  exportLogs,
} = useAuditLog(auditLogger);
```

### `useRoleHierarchy(hierarchyManager: RoleHierarchyManager)`

```typescript
const {
  roles,
  getRoleHierarchy,
  isRoleHigherThan,
  getAncestors,
  getDescendants,
} = useRoleHierarchy(hierarchyManager);
```

### `usePermissionMatrix(permissionManager: PermissionMatrixManager)`

```typescript
const {
  permissions,
  getRolePermissions,
  grantPermission,
  revokePermission,
  hasPermission,
  getPermissionCoverage,
} = usePermissionMatrix(permissionManager);
```

### `useAccessControl(accessControl: AccessControlService)`

```typescript
const {
  isAuthorized,
  loading,
  checkPermission,
  checkResourceAccess,
  grantResourceAccess,
  revokeResourceAccess,
} = useAccessControl(accessControl);
```

---

## Components

### `PermissionGuard`
Guard component based on permissions.

```typescript
<PermissionGuard
  userId={userId}
  permission={Permission.MANAGE_USERS}
  accessControl={accessControl}
  fallback={<Unauthorized />}
>
  <AdminPanel />
</PermissionGuard>
```

### `RoleGuard`
Guard component based on roles.

```typescript
<RoleGuard
  userId={userId}
  allowedRoles={['admin', 'moderator']}
  accessControl={accessControl}
  fallback={<Unauthorized />}
>
  <AdminPanel />
</RoleGuard>
```

### `RoleManagementDashboard`
Admin interface for managing roles and permissions.

### `AuditLogViewer`
Component for viewing and filtering audit logs.

### `RoleAssignmentUI`
Component for assigning roles to users.

### `ResourceAccessManager`
Component for managing resource-level access.

### `AdminRBACDashboard`
Comprehensive admin dashboard for all RBAC functions.

---

## Middleware

### `createPermissionMiddleware`
Create middleware for permission checking.

```typescript
const middleware = createPermissionMiddleware(
  accessControl,
  auditLogger,
  Permission.MANAGE_USERS
);

middleware(context);
```

### `createRoleMiddleware`
Create middleware for role checking.

```typescript
const middleware = createRoleMiddleware(
  accessControl,
  auditLogger,
  ['admin', 'moderator']
);

middleware(context);
```

### `createResourceAccessMiddleware`
Create middleware for resource access checking.

```typescript
const middleware = createResourceAccessMiddleware(
  accessControl,
  auditLogger,
  'write'
);

middleware(context, resourceId);
```

### `createRateLimitMiddleware`
Create rate limiting middleware.

```typescript
const middleware = createRateLimitMiddleware(5, 60000);
middleware(context);
```

---

## Utilities

### `RBACValidator`
Comprehensive validation utilities.

```typescript
const validator = new RBACValidator();
const validation = validator.validateRole(role);
const permValidation = validator.validatePermissionList(permissions);
```

### `RBACErrorHandler`
Error handling utilities.

```typescript
const handled = RBACErrorHandler.handle(error);
assertPermission(hasPermission, 'Access denied');
```

### Initialization
Initialize RBAC system.

```typescript
const rbac = initializeRBAC();
initializeDefaultPermissions(rbac.permissionMatrix);
registerDefaultUsers(rbac.accessControl);
```

---

## Enums

### `Permission`
20 available permissions in the system.

### `RoleType`
7 role types (SuperAdmin, Admin, Moderator, Analyst, Trader, User, Guest).

### `AccessType`
Access types: 'read', 'write', 'delete', 'admin'.

---

## Types

See `frontend/src/types/rbac.ts` for complete type definitions.

Key types:
- `Role`
- `RoleAssignment`
- `AuditLog`
- `AccessControl`
- `PermissionMatrix`
- `RoleContext`
- `AuditSummary`

---

## Error Classes

- `RBACError` - Base error
- `PermissionDeniedError` - Permission denied
- `InsufficientPrivilegeError` - Insufficient privilege
- `InvalidRoleError` - Invalid role
- `InvalidPermissionError` - Invalid permission
- `UserNotFoundError` - User not found
- `PrivilegeEscalationError` - Privilege escalation
- `SessionExpiredError` - Session expired
- `RateLimitExceededError` - Rate limit exceeded
