# RBAC Integration Guide

## Quick Start

### 1. Initialize RBAC System

```typescript
import { initializeRBAC, initializeDefaultPermissions, registerDefaultUsers } from '@/utils/rbacInit';

const rbac = initializeRBAC();
initializeDefaultPermissions(rbac.permissionMatrix);
registerDefaultUsers(rbac.accessControl);
```

### 2. Setup React Provider

```typescript
import { RBACProvider } from '@/context/RBACContext';

<RBACProvider
  accessControl={rbac.accessControl}
  roleAssignment={rbac.roleAssignment}
  auditLogger={rbac.auditLogger}
  roleHierarchy={rbac.roleHierarchy}
  permissionMatrix={rbac.permissionMatrix}
  currentUserId="user@example.com"
>
  <App />
</RBACProvider>
```

### 3. Use in Components

```typescript
import { usePermission } from '@/hooks/useRBAC';

function UserMenu() {
  const { hasPermission } = usePermission(userId, accessControl);

  return (
    <>
      {hasPermission(Permission.MANAGE_USERS) && <AdminLink />}
      {hasPermission(Permission.TRADE) && <TradeButton />}
    </>
  );
}
```

## Integration Steps

### Step 1: Install Dependencies

Ensure all RBAC modules are in your project:
- `frontend/src/types/rbac.ts`
- `frontend/src/services/*`
- `frontend/src/hooks/useRBAC.ts`
- `frontend/src/context/RBACContext.tsx`
- `frontend/src/components/*`
- `frontend/src/utils/*`

### Step 2: Initialize Services

Create an RBAC initialization module in your app:

```typescript
// src/rbac-setup.ts
import { initializeRBAC, initializeDefaultPermissions } from '@/utils/rbacInit';

export const rbacServices = initializeRBAC();

export function setupRBAC() {
  initializeDefaultPermissions(rbacServices.permissionMatrix);
  
  // Register initial users
  rbacServices.accessControl.registerUser('admin', 'super_admin');
  rbacServices.accessControl.registerUser('moderator', 'moderator');
}
```

### Step 3: Wrap Application with Provider

```typescript
// src/main.tsx or src/App.tsx
import { RBACProvider } from '@/context/RBACContext';
import { rbacServices, setupRBAC } from './rbac-setup';

setupRBAC();

ReactDOM.render(
  <RBACProvider
    {...rbacServices}
    currentUserId={getCurrentUserId()}
  >
    <App />
  </RBACProvider>,
  document.getElementById('root')
);
```

### Step 4: Protect Routes

```typescript
import { PermissionGuard, RoleGuard } from '@/components/PermissionGuard';

function ProtectedRoute({ element }) {
  return (
    <PermissionGuard
      userId={userId}
      permission={Permission.MANAGE_USERS}
      accessControl={accessControl}
      fallback={<UnauthorizedPage />}
    >
      {element}
    </PermissionGuard>
  );
}
```

### Step 5: Protect API Calls

```typescript
import { createPermissionMiddleware } from '@/middleware/rbacMiddleware';

const middleware = createPermissionMiddleware(
  accessControl,
  auditLogger,
  Permission.CREATE_MARKET
);

async function createMarket(context, marketData) {
  middleware(context);
  
  // Create market
  return api.post('/markets', marketData);
}
```

### Step 6: Setup Admin Dashboard

```typescript
import { AdminRBACDashboard } from '@/components/AdminRBACDashboard';

function AdminPanel() {
  return (
    <AdminRBACDashboard
      accessControl={rbacServices.accessControl}
      roleAssignment={rbacServices.roleAssignment}
      auditLogger={rbacServices.auditLogger}
      roleHierarchy={rbacServices.roleHierarchy}
      permissionMatrix={rbacServices.permissionMatrix}
      currentUserId={userId}
    />
  );
}
```

## Common Integration Patterns

### Pattern 1: Permission-Based UI

```typescript
import { usePermission } from '@/hooks/useRBAC';

function Dashboard() {
  const { hasPermission } = usePermission(userId, accessControl);

  return (
    <div>
      {hasPermission(Permission.VIEW_ANALYTICS) && <Analytics />}
      {hasPermission(Permission.MANAGE_USERS) && <UserManagement />}
      {hasPermission(Permission.MANAGE_SYSTEM_SETTINGS) && <Settings />}
    </div>
  );
}
```

### Pattern 2: Role-Based Components

```typescript
import { useRole } from '@/hooks/useRBAC';

function UserProfile() {
  const { roleType } = useRole(userId, accessControl);

  return (
    <div>
      <p>Your Role: {roleType}</p>
      {roleType === 'SUPER_ADMIN' && <SuperAdminPanel />}
      {['ADMIN', 'MODERATOR'].includes(roleType) && <AdminPanel />}
    </div>
  );
}
```

### Pattern 3: Resource-Based Access

```typescript
import { useAccessControl } from '@/hooks/useRBAC';

function DocumentEditor({ documentId }) {
  const { checkResourceAccess } = useAccessControl(accessControl);

  const canEdit = checkResourceAccess(userId, documentId, 'write');
  const canDelete = checkResourceAccess(userId, documentId, 'delete');

  return (
    <div>
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
    </div>
  );
}
```

### Pattern 4: Audit Logging

```typescript
import { useAuditLog } from '@/hooks/useRBAC';

function AuditTrail() {
  const { logs, getLogsByAction, getFailedAccessAttempts } = useAuditLog(auditLogger);

  useEffect(() => {
    getFailedAccessAttempts();
  }, []);

  return (
    <div>
      {logs.map(log => (
        <LogEntry key={log.id} log={log} />
      ))}
    </div>
  );
}
```

### Pattern 5: Permission Enforcement

```typescript
import { assertPermission, PermissionDeniedError } from '@/utils/rbacErrors';

function deleteUser(userId) {
  const hasPermission = accessControl.checkPermission(currentUserId, Permission.MANAGE_USERS);
  
  assertPermission(hasPermission, 'You do not have permission to delete users');
  
  // Delete user
  return api.delete(`/users/${userId}`);
}
```

## Testing Integration

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { initializeRBAC, initializeDefaultPermissions } from '@/utils/rbacInit';

describe('RBAC Integration', () => {
  let rbac;

  beforeEach(() => {
    rbac = initializeRBAC();
    initializeDefaultPermissions(rbac.permissionMatrix);
  });

  it('should check permissions correctly', () => {
    rbac.accessControl.registerUser('user1', 'admin');
    const hasPermission = rbac.accessControl.checkPermission('user1', 'MANAGE_USERS');
    expect(hasPermission).toBe(true);
  });

  it('should assign roles', () => {
    rbac.accessControl.registerUser('admin', 'admin');
    rbac.accessControl.registerUser('user1', 'user');

    const assignment = rbac.roleAssignment.assignRole('user1', 'moderator', 'admin');
    expect(assignment.roleId).toBe('moderator');
  });
});
```

## Deployment Considerations

### 1. Environment Setup

```typescript
const RBAC_CONFIG = {
  development: {
    sessionTimeout: 3600000,
    auditLogRetention: 10000,
    rateLimitWindow: 60000,
  },
  production: {
    sessionTimeout: 1800000,
    auditLogRetention: 100000,
    rateLimitWindow: 30000,
  },
};
```

### 2. Database Persistence

```typescript
import { PersistenceLayer } from '@/services/PersistenceLayer';

const persistence = new PersistenceLayer();

// Save audit logs
await persistence.saveAuditLogs(auditLogger.getLogs());

// Load role assignments
const assignments = await persistence.loadRoleAssignments();
```

### 3. Monitoring

```typescript
function monitorRBAC(rbac) {
  setInterval(() => {
    const health = getSystemHealth(rbac);
    const summary = rbac.auditLogger.getAuditSummary();
    
    logger.info('RBAC Health Check', {
      status: health.status,
      auditLogs: summary.totalLogs,
      failedAttempts: summary.failureCount,
    });
  }, 60000);
}
```

## Troubleshooting

### Issue: Permission check not working

Solution: Ensure permissions are granted to role
```typescript
const perms = rbac.permissionMatrix.getRolePermissions(roleId);
console.log('Role permissions:', perms);
```

### Issue: Audit logs not being recorded

Solution: Verify auditLogger is initialized
```typescript
const logs = rbac.auditLogger.getLogs();
console.log('Total logs:', logs.length);
```

### Issue: Role assignment fails

Solution: Check privilege levels
```typescript
const canAssign = rbac.accessControl.canAssignRole(assignerId, targetRoleId);
console.log('Can assign:', canAssign);
```

## Next Steps

1. Integrate RBAC into your application
2. Test with sample data
3. Deploy to staging environment
4. Monitor audit logs
5. Gather user feedback
6. Deploy to production
7. Continue monitoring and optimization
