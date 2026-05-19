import React from 'react';
import { initializeRBAC, initializeDefaultPermissions, registerDefaultUsers } from '@/utils/rbacInit';
import { RBACProvider } from '@/context/RBACContext';
import { AdminRBACDashboard } from '@/components/AdminRBACDashboard';

export function RBACIntegrationExample() {
  const rbac = initializeRBAC();

  initializeDefaultPermissions(rbac.permissionMatrix);
  registerDefaultUsers(rbac.accessControl, [
    { userId: 'admin@example.com', role: 'super_admin' },
    { userId: 'user@example.com', role: 'user' },
  ]);

  return (
    <RBACProvider
      accessControl={rbac.accessControl}
      roleAssignment={rbac.roleAssignment}
      auditLogger={rbac.auditLogger}
      roleHierarchy={rbac.roleHierarchy}
      permissionMatrix={rbac.permissionMatrix}
      currentUserId="admin@example.com"
    >
      <AdminRBACDashboard
        accessControl={rbac.accessControl}
        roleAssignment={rbac.roleAssignment}
        auditLogger={rbac.auditLogger}
        roleHierarchy={rbac.roleHierarchy}
        permissionMatrix={rbac.permissionMatrix}
        currentUserId="admin@example.com"
      />
    </RBACProvider>
  );
}

export function ProtectedComponentExample() {
  const rbac = initializeRBAC();
  initializeDefaultPermissions(rbac.permissionMatrix);

  const userId = 'user@example.com';
  rbac.accessControl.registerUser(userId, 'admin');

  const hasPermission = rbac.accessControl.checkPermission(userId, 'CREATE_MARKET');

  return (
    <div>
      {hasPermission ? (
        <button>Create Market</button>
      ) : (
        <p>You don't have permission to create markets</p>
      )}
    </div>
  );
}

export function RoleManagementExample() {
  const rbac = initializeRBAC();
  initializeDefaultPermissions(rbac.permissionMatrix);

  const adminId = 'admin@example.com';
  const userId = 'user@example.com';

  rbac.accessControl.registerUser(adminId, 'admin');
  rbac.accessControl.registerUser(userId, 'user');

  rbac.roleAssignment.assignRole(
    userId,
    'moderator',
    adminId,
    'Promoted to moderator',
    Date.now() + 30 * 24 * 60 * 60 * 1000
  );

  return (
    <div>
      <p>User promoted to moderator with 30-day expiration</p>
    </div>
  );
}

export function AuditLoggingExample() {
  const rbac = initializeRBAC();

  const userId = 'admin@example.com';
  const action = 'user_created';
  const resource = 'user';
  const resourceId = 'user123';

  rbac.auditLogger.logAction(userId, action, resource, resourceId, 'success');

  const logs = rbac.auditLogger.getLogsByUser(userId);
  const failedAttempts = rbac.auditLogger.getFailedAccessAttempts();

  return (
    <div>
      <p>Total logs for user: {logs.length}</p>
      <p>Failed attempts: {failedAttempts.length}</p>
    </div>
  );
}

export function APIServiceExample() {
  const rbac = initializeRBAC();
  initializeDefaultPermissions(rbac.permissionMatrix);

  const userId = 'user@example.com';
  rbac.accessControl.registerUser(userId, 'user');

  async function performOperation() {
    try {
      const userRole = await rbac.api.getUserRole(userId);
      const hasPermission = await rbac.api.checkPermission(userId, 'TRADE');
      const summary = await rbac.api.getAuditSummary();

      return { userRole, hasPermission, summary };
    } catch (error) {
      console.error('Operation failed:', error);
    }
  }

  return (
    <button
      type="button"
      onClick={() => performOperation()}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      Perform Operation
    </button>
  );
}

export function ResourceAccessExample() {
  const rbac = initializeRBAC();

  const userId = 'user@example.com';
  const resourceId = 'market-123';

  rbac.accessControl.registerUser(userId, 'user');

  rbac.accessControl.grantResourceAccess(userId, resourceId, 'read');
  rbac.accessControl.grantResourceAccess(userId, resourceId, 'write');

  const canRead = rbac.accessControl.checkResourceAccess(userId, resourceId, 'read');
  const canDelete = rbac.accessControl.checkResourceAccess(userId, resourceId, 'delete');

  return (
    <div>
      <p>Can read: {canRead ? 'Yes' : 'No'}</p>
      <p>Can delete: {canDelete ? 'Yes' : 'No'}</p>
    </div>
  );
}

export function BulkOperationExample() {
  const rbac = initializeRBAC();
  initializeDefaultPermissions(rbac.permissionMatrix);

  const adminId = 'admin@example.com';
  const userIds = ['user1@example.com', 'user2@example.com', 'user3@example.com'];

  rbac.accessControl.registerUser(adminId, 'admin');
  userIds.forEach(userId => rbac.accessControl.registerUser(userId, 'user'));

  const result = rbac.roleAssignment.bulkAssignRole(
    userIds,
    'trader',
    adminId,
    'Bulk promotion to traders'
  );

  return (
    <div>
      <p>Successful: {result.successful.length}</p>
      <p>Failed: {result.failed.length}</p>
    </div>
  );
}

export function ValidationExample() {
  const rbac = initializeRBAC();
  const validator = rbac.api;

  async function validateSetup() {
    const status = await validator.getSystemStatus();
    const hierarchy = await validator.getRoleHierarchy();

    return {
      isHealthy: status.isHealthy,
      totalRoles: status.totalRoles,
      totalPermissions: status.totalPermissions,
    };
  }

  return (
    <button
      type="button"
      onClick={() => validateSetup()}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      Validate System
    </button>
  );
}
