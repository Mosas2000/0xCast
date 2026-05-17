import { SecureStorageV2Service } from '../services/SecureStorageV2Service';
import { StorageMigrationService } from '../services/StorageMigrationService';
import { PIIDetectionService } from '../services/PIIDetectionService';

export interface AuditFinding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  key: string;
  issue: string;
  recommendation: string;
}

export interface StorageAuditReport {
  timestamp: number;
  findings: AuditFinding[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    totalFindings: number;
    unencryptedPIIKeys: string[];
    expiredKeys: string[];
  };
  migration: ReturnType<typeof StorageMigrationService.getMigrationStatus>;
  storageStats: Awaited<ReturnType<typeof SecureStorageV2Service.getStorageReport>>;
}

export class StorageAudit {
  static async run(): Promise<StorageAuditReport> {
    const findings: AuditFinding[] = [];
    const unencryptedPIIKeys: string[] = [];
    const expiredKeys: string[] = [];

    await this.auditLocalStorage(findings, unencryptedPIIKeys);
    await this.auditIndexedDB(findings, expiredKeys);

    const summary = {
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
      totalFindings: findings.length,
      unencryptedPIIKeys,
      expiredKeys,
    };

    return {
      timestamp: Date.now(),
      findings,
      summary,
      migration: StorageMigrationService.getMigrationStatus(),
      storageStats: await SecureStorageV2Service.getStorageReport(),
    };
  }

  private static async auditLocalStorage(
    findings: AuditFinding[],
    unencryptedPIIKeys: string[]
  ): Promise<void> {
    if (typeof localStorage === 'undefined') return;

    const sensitivePatterns = [
      'wallet',
      'address',
      'referral',
      'tracking',
      'consent',
      'notification',
      'error_log',
      'liquidity',
      'stake',
      'transaction',
      'rate_limit',
    ];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const value = localStorage.getItem(key);
      if (!value) continue;

      const isSensitiveKey = sensitivePatterns.some(pattern =>
        key.toLowerCase().includes(pattern)
      );

      if (isSensitiveKey) {
        let parsedValue: any;
        try {
          parsedValue = JSON.parse(value);
        } catch {
          parsedValue = value;
        }

        const detection = PIIDetectionService.detectPII(
          typeof parsedValue === 'object' ? parsedValue : { value: parsedValue }
        );

        if (detection.hasPII) {
          findings.push({
            severity: 'critical',
            key,
            issue: `PII data stored unencrypted in localStorage`,
            recommendation: `Migrate ${key} to encrypted IndexedDB using SecureStorageV2Service`,
          });
          unencryptedPIIKeys.push(key);
        } else if (isSensitiveKey) {
          findings.push({
            severity: 'high',
            key,
            issue: `Sensitive data stored in plaintext localStorage`,
            recommendation: `Migrate ${key} to encrypted IndexedDB`,
          });
        }
      }

      if (value.length > 50000) {
        findings.push({
          severity: 'medium',
          key,
          issue: `Large data stored in localStorage (${Math.round(value.length / 1024)}KB)`,
          recommendation: `Move large data to IndexedDB for better performance`,
        });
      }
    }
  }

  private static async auditIndexedDB(
    findings: AuditFinding[],
    expiredKeys: string[]
  ): Promise<void> {
    try {
      const report = await SecureStorageV2Service.getStorageReport();

      if (report.expiredItems > 0) {
        findings.push({
          severity: 'low',
          key: 'indexeddb',
          issue: `${report.expiredItems} expired items found in IndexedDB`,
          recommendation: `Run SecureStorageV2Service.cleanupExpired() to remove stale data`,
        });
      }

      const unencryptedRatio =
        report.totalItems > 0
          ? (report.totalItems - report.encryptedItems) / report.totalItems
          : 0;

      if (unencryptedRatio > 0.2) {
        findings.push({
          severity: 'medium',
          key: 'indexeddb',
          issue: `${Math.round(unencryptedRatio * 100)}% of IndexedDB items are not encrypted`,
          recommendation: `Ensure all sensitive data is stored with encrypt: true option`,
        });
      }
    } catch (error) {
      findings.push({
        severity: 'low',
        key: 'indexeddb',
        issue: `Could not audit IndexedDB: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendation: `Ensure IndexedDB is available and initialized`,
      });
    }
  }

  static formatReport(report: StorageAuditReport): string {
    const lines: string[] = [
      `Storage Security Audit Report`,
      `Generated: ${new Date(report.timestamp).toISOString()}`,
      ``,
      `Summary:`,
      `  Critical: ${report.summary.critical}`,
      `  High:     ${report.summary.high}`,
      `  Medium:   ${report.summary.medium}`,
      `  Low:      ${report.summary.low}`,
      `  Total:    ${report.summary.totalFindings}`,
      ``,
      `Migration Status:`,
      `  Completed: ${report.migration.completed}`,
      `  Version:   ${report.migration.version ?? 'N/A'}`,
      ``,
      `Storage Stats:`,
      `  Total items:     ${report.storageStats.totalItems}`,
      `  Encrypted items: ${report.storageStats.encryptedItems}`,
      `  PII items:       ${report.storageStats.piiItems}`,
      `  Expired items:   ${report.storageStats.expiredItems}`,
    ];

    if (report.findings.length > 0) {
      lines.push(``, `Findings:`);
      for (const finding of report.findings) {
        lines.push(
          ``,
          `  [${finding.severity.toUpperCase()}] ${finding.key}`,
          `  Issue: ${finding.issue}`,
          `  Fix:   ${finding.recommendation}`
        );
      }
    } else {
      lines.push(``, `No findings. Storage security looks good.`);
    }

    return lines.join('\n');
  }
}
