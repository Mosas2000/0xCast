import { RoleAssignment, Role } from '@/types/rbac';
import { AuditLogger } from '@/services/AuditLogger';
import { RoleHierarchyManager } from '@/services/RoleHierarchyManager';
import { AccessControlService } from '@/services/AccessControlService';

export class RoleAssignmentService {
  private assignments: Map<string, RoleAssignment>;
  private auditLogger: AuditLogger;
  private roleHierarchy: RoleHierarchyManager;
  private accessControl: AccessControlService;

  constructor(
    auditLogger: AuditLogger,
    roleHierarchy: RoleHierarchyManager,
    accessControl: AccessControlService
  ) {
    this.assignments = new Map();
    this.auditLogger = auditLogger;
    this.roleHierarchy = roleHierarchy;
    this.accessControl = accessControl;
  }

  assignRole(
    userId: string,
    roleId: string,
    assignedBy: string,
    options?: {
      expiresAt?: number;
      reason?: string;
      ipAddress?: string;
    }
  ): RoleAssignment | null {
    if (!this.roleHierarchy.getRole(roleId)) {
      return null;
    }

    if (!this.accessControl.preventPrivilegeEscalation(assignedBy, roleId)) {
      this.auditLogger.logAccessDenied(
        assignedBy,
        'ASSIGN_ROLE',
        'role',
        roleId,
        options?.ipAddress
      );
      return null;
    }

    const assignmentId = `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const assignment: RoleAssignment = {
      id: assignmentId,
      userId,
      roleId,
      assignedBy,
      assignedAt: Date.now(),
      expiresAt: options?.expiresAt,
      reason: options?.reason,
      status: 'active',
    };

    this.assignments.set(assignmentId, assignment);

    this.accessControl.addRole(userId, roleId);

    this.auditLogger.logRoleAssignment(userId, assignedBy, roleId, options?.ipAddress);

    return assignment;
  }

  revokeRole(
    userId: string,
    roleId: string,
    revokedBy: string,
    ipAddress?: string
  ): boolean {
    const assignment = this.getAssignmentByUserAndRole(userId, roleId);

    if (!assignment) {
      return false;
    }

    assignment.status = 'revoked';
    this.accessControl.removeRole(userId, roleId);

    this.auditLogger.logRoleRevocation(userId, revokedBy, roleId, ipAddress);

    return true;
  }

  getAssignment(assignmentId: string): RoleAssignment | undefined {
    return this.assignments.get(assignmentId);
  }

  getAssignmentByUserAndRole(userId: string, roleId: string): RoleAssignment | undefined {
    for (const assignment of this.assignments.values()) {
      if (assignment.userId === userId && assignment.roleId === roleId && assignment.status === 'active') {
        return assignment;
      }
    }
    return undefined;
  }

  getUserAssignments(userId: string): RoleAssignment[] {
    return Array.from(this.assignments.values()).filter(
      a => a.userId === userId && a.status === 'active'
    );
  }

  getRoleAssignments(roleId: string): RoleAssignment[] {
    return Array.from(this.assignments.values()).filter(
      a => a.roleId === roleId && a.status === 'active'
    );
  }

  getAllAssignments(): RoleAssignment[] {
    return Array.from(this.assignments.values()).filter(a => a.status === 'active');
  }

  isRoleAssigned(userId: string, roleId: string): boolean {
    return this.getAssignmentByUserAndRole(userId, roleId) !== undefined;
  }

  hasExpired(assignment: RoleAssignment): boolean {
    if (!assignment.expiresAt) return false;
    return Date.now() > assignment.expiresAt;
  }

  cleanupExpiredAssignments(): RoleAssignment[] {
    const expired: RoleAssignment[] = [];

    this.assignments.forEach((assignment, _) => {
      if (assignment.status === 'active' && this.hasExpired(assignment)) {
        assignment.status = 'expired';
        expired.push(assignment);

        this.accessControl.removeRole(assignment.userId, assignment.roleId);
      }
    });

    return expired;
  }

  extendExpiration(assignmentId: string, newExpirationTime: number, extendedBy: string): boolean {
    const assignment = this.assignments.get(assignmentId);

    if (!assignment) {
      return false;
    }

    assignment.expiresAt = newExpirationTime;

    this.auditLogger.logAction(
      extendedBy,
      'ROLE_EXPIRATION_EXTENDED',
      'role_assignment',
      assignmentId,
      'success',
      {
        oldValue: assignment.expiresAt,
        newValue: newExpirationTime,
      }
    );

    return true;
  }

  getAssignmentStats(): {
    totalAssignments: number;
    activeAssignments: number;
    expiredAssignments: number;
    pendingAssignments: number;
    revokedAssignments: number;
  } {
    let totalAssignments = 0;
    let activeAssignments = 0;
    let expiredAssignments = 0;
    let pendingAssignments = 0;
    let revokedAssignments = 0;

    this.assignments.forEach(assignment => {
      totalAssignments++;

      switch (assignment.status) {
        case 'active':
          activeAssignments++;
          break;
        case 'expired':
          expiredAssignments++;
          break;
        case 'pending':
          pendingAssignments++;
          break;
        case 'revoked':
          revokedAssignments++;
          break;
      }
    });

    return {
      totalAssignments,
      activeAssignments,
      expiredAssignments,
      pendingAssignments,
      revokedAssignments,
    };
  }

  transferRole(
    fromUserId: string,
    toUserId: string,
    roleId: string,
    transferredBy: string,
    ipAddress?: string
  ): boolean {
    const assignment = this.getAssignmentByUserAndRole(fromUserId, roleId);

    if (!assignment) {
      return false;
    }

    this.revokeRole(fromUserId, roleId, transferredBy, ipAddress);
    const newAssignment = this.assignRole(toUserId, roleId, transferredBy, { ipAddress });

    if (newAssignment) {
      this.auditLogger.logAction(
        transferredBy,
        'ROLE_TRANSFERRED',
        'role',
        roleId,
        'success',
        {
          oldValue: fromUserId,
          newValue: toUserId,
          ipAddress,
        }
      );
      return true;
    }

    return false;
  }

  bulkAssignRole(
    userIds: string[],
    roleId: string,
    assignedBy: string,
    ipAddress?: string
  ): { successful: string[]; failed: string[] } {
    const successful: string[] = [];
    const failed: string[] = [];

    userIds.forEach(userId => {
      const assignment = this.assignRole(userId, roleId, assignedBy, { ipAddress });
      if (assignment) {
        successful.push(userId);
      } else {
        failed.push(userId);
      }
    });

    return { successful, failed };
  }

  bulkRevokeRole(
    userIds: string[],
    roleId: string,
    revokedBy: string,
    ipAddress?: string
  ): { successful: string[]; failed: string[] } {
    const successful: string[] = [];
    const failed: string[] = [];

    userIds.forEach(userId => {
      const revoked = this.revokeRole(userId, roleId, revokedBy, ipAddress);
      if (revoked) {
        successful.push(userId);
      } else {
        failed.push(userId);
      }
    });

    return { successful, failed };
  }
}
