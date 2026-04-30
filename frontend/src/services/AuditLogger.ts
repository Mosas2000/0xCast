import { AuditLog } from '@/types/rbac';
import type { RecordValue } from '@/types/common';

export class AuditLogger {
  private logs: AuditLog[];
  private maxLogs: number;

  constructor(maxLogs: number = 10000) {
    this.logs = [];
    this.maxLogs = maxLogs;
  }

  logAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    status: 'success' | 'failure' = 'success',
    options?: {
      oldValue?: RecordValue;
      newValue?: RecordValue;
      ipAddress?: string;
      userAgent?: string;
    }
  ): AuditLog {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      resource,
      resourceId,
      oldValue: options?.oldValue,
      newValue: options?.newValue,
      status,
      timestamp: Date.now(),
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
    };

    this.logs.push(log);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    return log;
  }

  logAccessDenied(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    ipAddress?: string
  ): AuditLog {
    return this.logAction(userId, action, resource, resourceId, 'failure', {
      ipAddress,
    });
  }

  logRoleAssignment(
    userId: string,
    assignedBy: string,
    roleId: string,
    ipAddress?: string
  ): AuditLog {
    return this.logAction(userId, 'ROLE_ASSIGNMENT', 'role', roleId, 'success', {
      newValue: roleId,
      ipAddress,
    });
  }

  logRoleRevocation(
    userId: string,
    revokedBy: string,
    roleId: string,
    ipAddress?: string
  ): AuditLog {
    return this.logAction(userId, 'ROLE_REVOCATION', 'role', roleId, 'success', {
      oldValue: roleId,
      ipAddress,
    });
  }

  logPermissionChange(
    userId: string,
    changedBy: string,
    permission: string,
    action: 'GRANT' | 'REVOKE',
    ipAddress?: string
  ): AuditLog {
    return this.logAction(
      userId,
      `PERMISSION_${action}`,
      'permission',
      permission,
      'success',
      { ipAddress }
    );
  }

  logDataAccess(
    userId: string,
    resource: string,
    resourceId: string,
    ipAddress?: string
  ): AuditLog {
    return this.logAction(userId, 'DATA_ACCESS', resource, resourceId, 'success', {
      ipAddress,
    });
  }

  logDataModification(
    userId: string,
    resource: string,
    resourceId: string,
    oldValue: any,
    newValue: any,
    ipAddress?: string
  ): AuditLog {
    return this.logAction(userId, 'DATA_MODIFICATION', resource, resourceId, 'success', {
      oldValue,
      newValue,
      ipAddress,
    });
  }

  logDataDeletion(
    userId: string,
    resource: string,
    resourceId: string,
    deletedValue: any,
    ipAddress?: string
  ): AuditLog {
    return this.logAction(userId, 'DATA_DELETION', resource, resourceId, 'success', {
      oldValue: deletedValue,
      ipAddress,
    });
  }

  getLogs(
    options?: {
      userId?: string;
      action?: string;
      resource?: string;
      status?: 'success' | 'failure';
      startTime?: number;
      endTime?: number;
      limit?: number;
    }
  ): AuditLog[] {
    let filtered = [...this.logs];

    if (options?.userId) {
      filtered = filtered.filter(log => log.userId === options.userId);
    }

    if (options?.action) {
      filtered = filtered.filter(log => log.action === options.action);
    }

    if (options?.resource) {
      filtered = filtered.filter(log => log.resource === options.resource);
    }

    if (options?.status) {
      filtered = filtered.filter(log => log.status === options.status);
    }

    if (options?.startTime) {
      filtered = filtered.filter(log => log.timestamp >= options.startTime!);
    }

    if (options?.endTime) {
      filtered = filtered.filter(log => log.timestamp <= options.endTime!);
    }

    if (options?.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  }

  getLogsByUser(userId: string, limit?: number): AuditLog[] {
    return this.getLogs({ userId, limit });
  }

  getLogsByAction(action: string, limit?: number): AuditLog[] {
    return this.getLogs({ action, limit });
  }

  getLogsByResource(resource: string, limit?: number): AuditLog[] {
    return this.getLogs({ resource, limit });
  }

  getLogsByTimeRange(startTime: number, endTime: number): AuditLog[] {
    return this.getLogs({ startTime, endTime });
  }

  getFailedAccessAttempts(limit?: number): AuditLog[] {
    return this.getLogs({ status: 'failure', limit });
  }

  getAuditSummary(): {
    totalLogs: number;
    uniqueUsers: number;
    actions: { [key: string]: number };
    resources: { [key: string]: number };
    successCount: number;
    failureCount: number;
  } {
    const summary = {
      totalLogs: this.logs.length,
      uniqueUsers: new Set(this.logs.map(log => log.userId)).size,
      actions: {} as { [key: string]: number },
      resources: {} as { [key: string]: number },
      successCount: 0,
      failureCount: 0,
    };

    this.logs.forEach(log => {
      summary.actions[log.action] = (summary.actions[log.action] ?? 0) + 1;
      summary.resources[log.resource] = (summary.resources[log.resource] ?? 0) + 1;

      if (log.status === 'success') {
        summary.successCount++;
      } else {
        summary.failureCount++;
      }
    });

    return summary;
  }

  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    }

    const headers = [
      'ID',
      'User ID',
      'Action',
      'Resource',
      'Resource ID',
      'Status',
      'Timestamp',
    ];
    const rows = this.logs.map(log => [
      log.id,
      log.userId,
      log.action,
      log.resource,
      log.resourceId,
      log.status,
      new Date(log.timestamp).toISOString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csv;
  }

  clearLogs(olderThanDays?: number): number {
    if (!olderThanDays) {
      const count = this.logs.length;
      this.logs = [];
      return count;
    }

    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    const beforeCount = this.logs.length;
    this.logs = this.logs.filter(log => log.timestamp >= cutoffTime);
    return beforeCount - this.logs.length;
  }

  searchLogs(query: string): AuditLog[] {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter(
      log =>
        log.userId.toLowerCase().includes(lowerQuery) ||
        log.action.toLowerCase().includes(lowerQuery) ||
        log.resource.toLowerCase().includes(lowerQuery) ||
        log.resourceId.toLowerCase().includes(lowerQuery)
    );
  }

  getLogById(logId: string): AuditLog | undefined {
    return this.logs.find(log => log.id === logId);
  }
}
