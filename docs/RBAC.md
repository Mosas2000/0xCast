# RBAC System Documentation

## Overview

The Role-Based Access Control (RBAC) system is a comprehensive framework for managing user permissions, roles, and resource access in the 0xCast platform. It provides fine-grained control over who can perform what actions and access which resources.

## Architecture

### Core Components

1. **Role Hierarchy Manager** - Manages the 7-level role hierarchy (SuperAdmin → Admin → Moderator → Analyst → Trader → User → Guest)
2. **Permission Matrix Manager** - Tracks which permissions are assigned to each role
3. **Access Control Service** - Enforces permission and role checks
4. **Audit Logger** - Records all access attempts and system changes
5. **Role Assignment Service** - Manages user role assignments with expiration and history

## Role Hierarchy

The system uses a 7-level role hierarchy:

| Level | Role | Privilege |
|-------|------|-----------|
| 0 | SuperAdmin | Full system access |
| 1 | Admin | Administrative functions |
| 2 | Moderator | Content moderation |
| 3 | Analyst | Data analysis access |
| 4 | Trader | Trading permissions |
| 5 | User | Standard user |
| 6 | Guest | Limited read-only access |

Higher level roles inherit permissions from their children but can be overridden.

## Permissions

The system defines 20 distinct permissions:

- `CREATE_MARKET` - Create new markets
- `MANAGE_USERS` - Manage user accounts
- `MANAGE_ROLES` - Assign and revoke roles
- `MANAGE_PERMISSIONS` - Modify role permissions
- `MANAGE_SYSTEM_SETTINGS` - Configure system settings
- `VIEW_AUDIT_LOGS` - Access audit trail
- `TRADE` - Execute trades
- `MODERATE_CONTENT` - Moderate user content
- `VIEW_ANALYTICS` - Access analytics dashboard
- `MANAGE_LIQUIDITY` - Manage liquidity pools
- And 10 more...

## Usage

### Checking Permissions

```typescript
const hasPermission = accessControl.checkPermission(userId, Permission.MANAGE_USERS);
if (hasPermission) {
  // Allow action
}
```

### Assigning Roles

```typescript
const assignment = roleAssignment.assignRole(
  userId,
  RoleType.MODERATOR,
  assignedBy,
  'Promoted to moderator',
  expirationTime
);
```

### Resource Access Control

```typescript
accessControl.grantResourceAccess(userId, resourceId, 'write');
const hasAccess = accessControl.checkResourceAccess(userId, resourceId, 'write');
```

### Audit Logging

```typescript
const logs = auditLogger.getLogsByUser(userId);
const failedAttempts = auditLogger.getFailedAccessAttempts();
const exported = auditLogger.exportLogs(logs, 'json');
```

## React Integration

### Hooks

The system provides React hooks for common operations:

```typescript
const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermission(userId, accessControl);
const { role, roleId, roleType } = useRole(userId, accessControl);
const { assignRole, revokeRole, bulkAssignRole } = useRoleAssignment(assignmentService);
```

### Components

- `PermissionGuard` - Guard components based on permissions
- `RoleGuard` - Guard components based on roles
- `RoleManagementDashboard` - Admin interface for role management
- `AuditLogViewer` - View and export audit logs
- `RoleAssignmentUI` - Assign roles to users
- `ResourceAccessManager` - Manage resource-level permissions
- `AdminRBACDashboard` - Comprehensive admin dashboard

### Context

Use the RBAC context provider to pass services throughout the component tree:

```typescript
<RBACProvider
  accessControl={accessControl}
  roleAssignment={roleAssignment}
  auditLogger={auditLogger}
  roleHierarchy={roleHierarchy}
  permissionMatrix={permissionMatrix}
  currentUserId={currentUserId}
>
  <YourApp />
</RBACProvider>
```

## Security Features

### Privilege Escalation Prevention

The system prevents users from assigning roles equal to or above their own level.

```typescript
const canAssign = accessControl.canAssignRole(assignerUserId, targetRoleId);
```

### Rate Limiting

Built-in rate limiting prevents brute force attacks:

```typescript
const rateLimiter = new RateLimiter(5, 60000); // 5 attempts per minute
if (!rateLimiter.isAllowed(userId)) {
  // Block request
}
```

### Session Management

Secure session management with timeout:

```typescript
const sessionManager = new SecureSessionManager(3600000); // 1 hour timeout
sessionManager.createSession(sessionId, userId, ipAddress);
sessionManager.validateSession(sessionId);
```

## Middleware and Decorators

### Middleware

Create middleware for route protection:

```typescript
const permissionMiddleware = createPermissionMiddleware(
  accessControl,
  auditLogger,
  Permission.MANAGE_USERS
);

const roleMiddleware = createRoleMiddleware(
  accessControl,
  auditLogger,
  [RoleType.ADMIN, RoleType.SUPER_ADMIN]
);

const composed = composeMiddleware(permissionMiddleware, roleMiddleware);
```

### Decorators

Use decorators for method-level protection:

```typescript
@createPermissionDecorator(accessControl, auditLogger, Permission.MANAGE_USERS)
deleteUser(context: AuthContext, userId: string) {
  // Delete user
}
```

## API Service

The `RBACAPIService` provides a unified interface to all RBAC operations:

```typescript
const api = createRBACAPI(
  accessControl,
  roleAssignment,
  auditLogger,
  roleHierarchy,
  permissionMatrix
);

const permissions = await api.getUserPermissions(userId);
const success = await api.assignRole(userId, roleId, assignedBy);
const logs = await api.getAuditLogs({ userId, action: 'role_assignment' });
```

## Validation

The system provides comprehensive validation utilities:

```typescript
const validator = new RBACValidator();

const roleValidation = validator.validateRole(role);
const permissionValidation = validator.validatePermissionList(permissions);
const assignmentValidation = validator.validateRoleAssignment(assignment);
```

## Audit Trail

All system actions are logged:

- Access attempts (success/failure)
- Role assignments and revocations
- Permission grants and revokes
- Resource access changes
- User registrations
- Failed authentication attempts

Logs can be filtered, searched, and exported:

```typescript
const logs = auditLogger.getLogs()
  .filter(log => log.timestamp > startTime)
  .filter(log => log.status === 'failed');

const exported = auditLogger.exportLogs(logs, 'csv');
```

## Best Practices

1. **Always check permissions before sensitive operations** - Prevent unauthorized access
2. **Use role hierarchy correctly** - Higher level roles should have fewer restrictions
3. **Log all administrative actions** - Maintain audit trail for compliance
4. **Implement rate limiting** - Prevent brute force attacks
5. **Validate user input** - Use provided validation utilities
6. **Use permission guards** - Hide unauthorized UI elements
7. **Implement timeouts** - Expire old sessions and assignments
8. **Monitor failed attempts** - Detect suspicious activity
9. **Regular audit review** - Check logs for security incidents
10. **Document custom permissions** - Keep permission definitions updated

## Testing

The system includes comprehensive tests:

```bash
npm run test -- tests/rbac.test.ts
```

Tests cover:
- Role hierarchy
- Permission matrix
- Access control
- Audit logging
- Role assignment
- Validation
- Security features

## Configuration

### Session Timeout

```typescript
const sessionManager = new SecureSessionManager(3600000); // 1 hour
```

### Audit Log Retention

Audit logs are stored with automatic cleanup. Default: 10,000 logs with FIFO rotation.

### Rate Limit Settings

```typescript
const rateLimiter = new RateLimiter(5, 60000); // 5 attempts per 60 seconds
```

## Migration Guide

To integrate RBAC into an existing application:

1. Install the RBAC module
2. Create service instances
3. Initialize role hierarchy
4. Set up permission matrix
5. Register users with roles
6. Wrap components with permission guards
7. Add audit logging
8. Deploy with RBAC middleware

## Troubleshooting

### User cannot access resource

Check:
1. User's role is active
2. Role has required permission
3. Resource access is granted
4. Session is valid

### Audit logs missing

Check:
1. Audit logger is initialized
2. Action is being logged
3. Log retention limit not exceeded

### Role assignment fails

Check:
1. Assigner has higher privilege level
2. Role exists in hierarchy
3. Assignment doesn't create circular reference

## Future Enhancements

- Dynamic role creation
- Time-based access policies
- Risk-based access control
- Machine learning for anomaly detection
- OAuth2/OIDC integration
- Multi-factor authentication
- Federated identity management

## Support

For issues or questions:
1. Check the documentation
2. Review audit logs
3. Run tests
4. Contact the development team
