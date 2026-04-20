import { describe, it, expect, beforeEach } from 'vitest';
import { AccessControlService } from '@/services/AccessControlService';
import { RoleHierarchyManager } from '@/services/RoleHierarchyManager';
import { PermissionMatrixManager } from '@/services/PermissionMatrixManager';
import { RoleAssignmentService } from '@/services/RoleAssignmentService';
import { AuditLogger } from '@/services/AuditLogger';
import { RBACValidator } from '@/utils/rbacValidator';
import { Permission, RoleType } from '@/types/rbac';

describe('RBAC System', () => {
  let accessControl: AccessControlService;
  let roleHierarchy: RoleHierarchyManager;
  let permissionMatrix: PermissionMatrixManager;
  let roleAssignment: RoleAssignmentService;
  let auditLogger: AuditLogger;
  let validator: RBACValidator;

  beforeEach(() => {
    roleHierarchy = new RoleHierarchyManager();
    permissionMatrix = new PermissionMatrixManager();
    auditLogger = new AuditLogger();
    accessControl = new AccessControlService(roleHierarchy, permissionMatrix, auditLogger);
    roleAssignment = new RoleAssignmentService(accessControl, auditLogger);
    validator = new RBACValidator();
  });

  describe('Role Hierarchy', () => {
    it('should initialize default hierarchy with 7 roles', () => {
      const hierarchy = roleHierarchy.getRoleHierarchy();
      expect(hierarchy.size).toBe(7);
    });

    it('should have SuperAdmin at level 0', () => {
      const superAdmin = roleHierarchy.getRoleHierarchy().get(RoleType.SUPER_ADMIN);
      expect(superAdmin?.level).toBe(0);
    });

    it('should have Guest at level 6', () => {
      const guest = roleHierarchy.getRoleHierarchy().get(RoleType.GUEST);
      expect(guest?.level).toBe(6);
    });

    it('should identify role hierarchy correctly', () => {
      const isHigher = roleHierarchy.isRoleHigherThan(RoleType.SUPER_ADMIN, RoleType.ADMIN);
      expect(isHigher).toBe(true);
    });

    it('should prevent invalid role hierarchy relationships', () => {
      const isHigher = roleHierarchy.isRoleHigherThan(RoleType.GUEST, RoleType.SUPER_ADMIN);
      expect(isHigher).toBe(false);
    });
  });

  describe('Permission Matrix', () => {
    it('should grant and revoke permissions', () => {
      permissionMatrix.grantPermission(RoleType.ADMIN, Permission.MANAGE_USERS);
      expect(permissionMatrix.hasPermission(RoleType.ADMIN, Permission.MANAGE_USERS)).toBe(true);

      permissionMatrix.revokePermission(RoleType.ADMIN, Permission.MANAGE_USERS);
      expect(permissionMatrix.hasPermission(RoleType.ADMIN, Permission.MANAGE_USERS)).toBe(false);
    });

    it('should get all role permissions', () => {
      permissionMatrix.grantPermission(RoleType.ADMIN, Permission.MANAGE_USERS);
      permissionMatrix.grantPermission(RoleType.ADMIN, Permission.MANAGE_ROLES);

      const permissions = permissionMatrix.getRolePermissions(RoleType.ADMIN);
      expect(permissions).toContain(Permission.MANAGE_USERS);
      expect(permissions).toContain(Permission.MANAGE_ROLES);
    });

    it('should calculate permission coverage', () => {
      permissionMatrix.grantPermission(RoleType.ADMIN, Permission.MANAGE_USERS);
      const coverage = permissionMatrix.getPermissionCoverage(RoleType.ADMIN);

      expect(coverage).toBeGreaterThan(0);
      expect(coverage).toBeLessThanOrEqual(100);
    });
  });

  describe('Access Control', () => {
    it('should register users and assign roles', () => {
      accessControl.registerUser('user1', RoleType.USER);
      const role = accessControl.getRoleForUser('user1');

      expect(role?.id).toBe(RoleType.USER);
    });

    it('should check user permissions', () => {
      accessControl.registerUser('admin1', RoleType.ADMIN);
      permissionMatrix.grantPermission(RoleType.ADMIN, Permission.MANAGE_USERS);

      const hasPermission = accessControl.checkPermission('admin1', Permission.MANAGE_USERS);
      expect(hasPermission).toBe(true);
    });

    it('should prevent unauthorized permission access', () => {
      accessControl.registerUser('user1', RoleType.USER);
      const hasPermission = accessControl.checkPermission('user1', Permission.MANAGE_USERS);

      expect(hasPermission).toBe(false);
    });

    it('should grant and revoke resource access', () => {
      accessControl.registerUser('user1', RoleType.USER);
      accessControl.grantResourceAccess('user1', 'resource1', 'read');

      expect(accessControl.checkResourceAccess('user1', 'resource1', 'read')).toBe(true);

      accessControl.revokeResourceAccess('user1', 'resource1', 'read');
      expect(accessControl.checkResourceAccess('user1', 'resource1', 'read')).toBe(false);
    });

    it('should prevent privilege escalation', () => {
      accessControl.registerUser('user1', RoleType.USER);
      accessControl.registerUser('user2', RoleType.SUPER_ADMIN);

      const canAssign = accessControl.canAssignRole('user1', RoleType.ADMIN);
      expect(canAssign).toBe(false);
    });
  });

  describe('Audit Logging', () => {
    it('should log access attempts', () => {
      auditLogger.logAction(
        'user1',
        'access_check',
        'permission',
        'MANAGE_USERS',
        'success'
      );

      const logs = auditLogger.getLogsByUser('user1');
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].action).toBe('access_check');
    });

    it('should filter logs by action', () => {
      auditLogger.logAction('user1', 'role_assignment', 'role', 'admin', 'success');
      auditLogger.logAction('user2', 'permission_grant', 'permission', 'MANAGE_USERS', 'success');

      const logs = auditLogger.getLogs().filter(l => l.action === 'role_assignment');
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should get failed access attempts', () => {
      auditLogger.logAction('user1', 'access_check', 'permission', 'MANAGE_USERS', 'failed');

      const failedLogs = auditLogger.getFailedAccessAttempts();
      expect(failedLogs.some(log => log.status === 'failed')).toBe(true);
    });

    it('should export logs in JSON format', () => {
      auditLogger.logAction('user1', 'access_check', 'permission', 'MANAGE_USERS', 'success');

      const logs = auditLogger.getLogs();
      const exported = auditLogger.exportLogs(logs, 'json');

      expect(exported).toContain('access_check');
      expect(exported).toContain('user1');
    });
  });

  describe('Role Assignment', () => {
    it('should assign roles to users', () => {
      accessControl.registerUser('assignor', RoleType.ADMIN);
      accessControl.registerUser('assignee', RoleType.USER);

      const assignment = roleAssignment.assignRole(
        'assignee',
        RoleType.MODERATOR,
        'assignor',
        'Promoted to moderator'
      );

      expect(assignment.userId).toBe('assignee');
      expect(assignment.roleId).toBe(RoleType.MODERATOR);
      expect(assignment.status).toBe('active');
    });

    it('should revoke roles from users', () => {
      accessControl.registerUser('assignor', RoleType.ADMIN);
      accessControl.registerUser('assignee', RoleType.MODERATOR);

      roleAssignment.assignRole('assignee', RoleType.MODERATOR, 'assignor');
      roleAssignment.revokeRole('assignee', RoleType.MODERATOR);

      const assignments = roleAssignment.getAssignmentsByUser('assignee');
      const isActive = assignments.some(a => a.status === 'active' && a.roleId === RoleType.MODERATOR);

      expect(isActive).toBe(false);
    });

    it('should handle role expiration', () => {
      accessControl.registerUser('assignor', RoleType.ADMIN);
      accessControl.registerUser('assignee', RoleType.USER);

      const expiresAt = Date.now() - 1000;
      roleAssignment.assignRole('assignee', RoleType.MODERATOR, 'assignor', undefined, expiresAt);

      roleAssignment.cleanupExpiredAssignments();

      const assignments = roleAssignment.getAssignmentsByUser('assignee');
      const expiredAssignment = assignments.find(a => a.roleId === RoleType.MODERATOR);

      expect(expiredAssignment?.status).toBe('expired');
    });

    it('should support bulk role assignment', () => {
      accessControl.registerUser('assignor', RoleType.ADMIN);
      const userIds = ['user1', 'user2', 'user3'];

      userIds.forEach(userId => {
        accessControl.registerUser(userId, RoleType.USER);
      });

      const result = roleAssignment.bulkAssignRole(userIds, RoleType.TRADER, 'assignor');

      expect(result.successful.length).toBeGreaterThan(0);
    });
  });

  describe('RBAC Validation', () => {
    it('should validate role structure', () => {
      const role = {
        id: 'test_role',
        type: RoleType.ADMIN,
        name: 'Test Role',
        description: 'A test role',
        permissions: [Permission.MANAGE_USERS],
        level: 1,
      };

      const validation = validator.validateRole(role);
      expect(validation.valid).toBe(true);
    });

    it('should detect invalid permissions', () => {
      const permissions = [Permission.MANAGE_USERS, 'INVALID_PERMISSION' as Permission];
      const validation = validator.validatePermissionList(permissions);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate permission assignments', () => {
      const validation = validator.validatePermissionAssignment(RoleType.ADMIN, Permission.MANAGE_USERS);
      expect(validation.valid).toBe(true);
    });

    it('should prevent circular role references', () => {
      const rolesMap = new Map(roleHierarchy.getRoleHierarchy());
      const isCircular = validator.checkCircularRoleReference(RoleType.ADMIN, RoleType.ADMIN, rolesMap);

      expect(isCircular).toBe(false);
    });
  });

  describe('Security', () => {
    it('should track user permissions', () => {
      accessControl.registerUser('user1', RoleType.ADMIN);
      permissionMatrix.grantPermission(RoleType.ADMIN, Permission.MANAGE_USERS);

      const permissions = accessControl.getUserPermissions('user1');
      expect(permissions).toContain(Permission.MANAGE_USERS);
    });

    it('should maintain audit trail', () => {
      auditLogger.logAction('user1', 'access_check', 'resource', 'resource1', 'success');
      auditLogger.logAction('user1', 'permission_grant', 'permission', 'READ', 'success');

      const userLogs = auditLogger.getLogsByUser('user1');
      expect(userLogs.length).toBe(2);
    });

    it('should prevent unauthorized role assignment', () => {
      accessControl.registerUser('user1', RoleType.USER);
      accessControl.registerUser('user2', RoleType.ADMIN);

      const canAssign = accessControl.canAssignRole('user1', RoleType.SUPER_ADMIN);
      expect(canAssign).toBe(false);
    });
  });
});
