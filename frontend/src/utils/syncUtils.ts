import { SyncEntity, SyncConflict, QueuedAction, SyncMetrics } from '@/types/sync';

/**
 * Synchronization System Utilities
 * Helper functions for logging, monitoring, and debugging sync operations
 */

export class SyncLogger {
  private enabled: boolean;
  private logs: Array<{ timestamp: number; level: string; message: string; data?: any }> = [];
  private maxLogs: number = 1000;

  constructor(enabled: boolean = false) {
    this.enabled = enabled;
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('WARN', message, data);
  }

  error(message: string, data?: any): void {
    this.log('ERROR', message, data);
  }

  debug(message: string, data?: any): void {
    this.log('DEBUG', message, data);
  }

  private log(level: string, message: string, data?: any): void {
    const entry = {
      timestamp: Date.now(),
      level,
      message,
      data,
    };

    if (this.enabled) {
      console.log(`[${level}] [${new Date().toISOString()}] ${message}`, data);
    }

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  getLogs(): typeof this.logs {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

/**
 * Monitoring service for tracking sync health and performance
 */
export class SyncMonitor {
  private metrics: SyncMetrics = {
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0,
    totalConflicts: 0,
    resolvedConflicts: 0,
    pendingConflicts: 0,
    totalActions: 0,
    processedActions: 0,
    failedActions: 0,
    avgSyncTime: 0,
    lastSyncTime: Date.now(),
    successRate: 1,
  };

  private syncTimes: number[] = [];
  private maxTimeSamples: number = 100;

  recordSyncStart(): number {
    return Date.now();
  }

  recordSyncSuccess(startTime: number): void {
    const duration = Date.now() - startTime;
    this.metrics.successfulSyncs++;
    this.metrics.totalSyncs++;
    this.metrics.lastSyncTime = Date.now();

    this.syncTimes.push(duration);
    if (this.syncTimes.length > this.maxTimeSamples) {
      this.syncTimes = this.syncTimes.slice(-this.maxTimeSamples);
    }

    this.updateAvgSyncTime();
    this.updateSuccessRate();
  }

  recordSyncFailure(): void {
    this.metrics.failedSyncs++;
    this.metrics.totalSyncs++;
    this.metrics.lastErrorTime = Date.now();
    this.updateSuccessRate();
  }

  recordConflict(): void {
    this.metrics.totalConflicts++;
    this.metrics.pendingConflicts++;
  }

  recordConflictResolved(): void {
    this.metrics.resolvedConflicts++;
    this.metrics.pendingConflicts = Math.max(0, this.metrics.pendingConflicts - 1);
  }

  recordActionQueued(): void {
    this.metrics.totalActions++;
  }

  recordActionProcessed(): void {
    this.metrics.processedActions++;
  }

  recordActionFailed(): void {
    this.metrics.failedActions++;
  }

  private updateAvgSyncTime(): void {
    if (this.syncTimes.length === 0) return;
    const sum = this.syncTimes.reduce((a, b) => a + b, 0);
    this.metrics.avgSyncTime = sum / this.syncTimes.length;
  }

  private updateSuccessRate(): void {
    if (this.metrics.totalSyncs === 0) {
      this.metrics.successRate = 1;
    } else {
      this.metrics.successRate =
        this.metrics.successfulSyncs / this.metrics.totalSyncs;
    }
  }

  getMetrics(): SyncMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      totalConflicts: 0,
      resolvedConflicts: 0,
      pendingConflicts: 0,
      totalActions: 0,
      processedActions: 0,
      failedActions: 0,
      avgSyncTime: 0,
      lastSyncTime: Date.now(),
      successRate: 1,
    };
    this.syncTimes = [];
  }

  getHealthStatus(): {
    isHealthy: boolean;
    status: string;
    issues: string[];
  } {
    const issues: string[] = [];

    if (this.metrics.successRate < 0.8) {
      issues.push('Low success rate');
    }

    if (this.metrics.totalConflicts > this.metrics.resolvedConflicts * 2) {
      issues.push('High unresolved conflicts');
    }

    if (this.metrics.failedActions > this.metrics.processedActions * 0.1) {
      issues.push('High action failure rate');
    }

    return {
      isHealthy: issues.length === 0,
      status: issues.length === 0 ? 'healthy' : 'degraded',
      issues,
    };
  }
}

/**
 * Data migration utilities for bringing existing data into sync system
 */
export class DataMigrationService {
  static prepareForMigration<T extends Record<string, any>>(
    data: T,
    entityType: string,
    entityId: string
  ): SyncEntity {
    return {
      id: entityId,
      type: entityType,
      data,
      localVersion: 1,
      remoteVersion: 0,
      hash: this.calculateHash(data),
      lastModified: Date.now(),
      isSynced: false,
      conflictCount: 0,
    };
  }

  static calculateHash(data: any): string {
    const str = JSON.stringify(data);
    return str.length.toString();
  }

  static validateMigrationData(entities: SyncEntity[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    entities.forEach((entity, index) => {
      if (!entity.id) {
        errors.push(`Entity ${index}: Missing id`);
      }
      if (!entity.type) {
        errors.push(`Entity ${index}: Missing type`);
      }
      if (!entity.data || typeof entity.data !== 'object') {
        errors.push(`Entity ${index}: Invalid data`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static batchMigrationEntities(
    entities: SyncEntity[],
    batchSize: number = 100
  ): SyncEntity[][] {
    const batches: SyncEntity[][] = [];
    for (let i = 0; i < entities.length; i += batchSize) {
      batches.push(entities.slice(i, i + batchSize));
    }
    return batches;
  }
}

/**
 * Debug utilities for troubleshooting sync issues
 */
export class SyncDebugger {
  static analyzeEntity(entity: SyncEntity): {
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    if (entity.localVersion < entity.remoteVersion) {
      warnings.push('Local version behind remote');
    }

    if (entity.conflictCount > 0) {
      warnings.push(`${entity.conflictCount} unresolved conflicts`);
    }

    if (!entity.isSynced) {
      warnings.push('Entity not yet synced');
    }

    if (!entity.lastSyncTime && entity.isSynced) {
      issues.push('Synced but no sync time recorded');
    }

    const dataSize = JSON.stringify(entity.data).length;
    if (dataSize > 1048576) {
      warnings.push('Large entity (>1MB)');
    }

    return { issues, warnings };
  }

  static analyzeConflict(conflict: SyncConflict): {
    severity: 'low' | 'medium' | 'high';
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let severity: 'low' | 'medium' | 'high' = 'low';

    const localStr = JSON.stringify(conflict.localData);
    const remoteStr = JSON.stringify(conflict.remoteData);
    const similarity = this.calculateSimilarity(localStr, remoteStr);

    if (similarity < 0.3) {
      severity = 'high';
      suggestions.push('Consider manual resolution - data significantly different');
    } else if (similarity < 0.7) {
      severity = 'medium';
      suggestions.push('Consider merge strategy');
    } else {
      severity = 'low';
      suggestions.push('Merge strategy should work well');
    }

    if (conflict.type === 'version_mismatch') {
      suggestions.push('Version numbers differ - likely concurrent modifications');
    }

    return { severity, suggestions };
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private static levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];

    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) {
        costs[s2.length] = lastValue;
      }
    }

    return costs[s2.length];
  }

  static exportDiagnostics(
    entities: SyncEntity[],
    conflicts: SyncConflict[],
    metrics: SyncMetrics
  ): string {
    const diagnostics = {
      exportedAt: new Date().toISOString(),
      metrics,
      entityAnalysis: {
        total: entities.length,
        synced: entities.filter((e) => e.isSynced).length,
        unsynced: entities.filter((e) => !e.isSynced).length,
        withConflicts: entities.filter((e) => e.conflictCount > 0).length,
      },
      conflictAnalysis: {
        total: conflicts.length,
        byType: {
          dataMismatch: conflicts.filter((c) => c.type === 'data_mismatch').length,
          versionMismatch: conflicts.filter((c) => c.type === 'version_mismatch')
            .length,
          both: conflicts.filter((c) => c.type === 'both').length,
        },
      },
      entityProblems: entities
        .filter((e) => {
          const analysis = this.analyzeEntity(e);
          return analysis.issues.length > 0;
        })
        .map((e) => ({
          id: e.id,
          issues: this.analyzeEntity(e).issues,
        })),
    };

    return JSON.stringify(diagnostics, null, 2);
  }
}

/**
 * Performance utilities for optimizing sync operations
 */
export class SyncPerformance {
  static calculateEntitySize(entity: SyncEntity): number {
    return JSON.stringify(entity).length;
  }

  static estimateSyncDuration(
    entityCount: number,
    avgEntitySize: number,
    networkSpeed: number = 1000000
  ): number {
    const totalBytes = entityCount * avgEntitySize;
    const secondsNeeded = totalBytes / networkSpeed;
    return secondsNeeded * 1000;
  }

  static suggestBatchSize(
    totalEntities: number,
    targetSyncTime: number = 5000
  ): number {
    const avgSize = 1024;
    const avgNetwork = 1000000;
    const timePerEntity = (avgSize / avgNetwork) * 1000;
    const batchSize = Math.floor(targetSyncTime / timePerEntity);
    return Math.max(1, Math.min(batchSize, Math.floor(totalEntities / 10)));
  }

  static identifyLargeEntities(
    entities: SyncEntity[],
    threshold: number = 102400
  ): Array<{ id: string; size: number }> {
    return entities
      .map((e) => ({
        id: e.id,
        size: this.calculateEntitySize(e),
      }))
      .filter((e) => e.size > threshold)
      .sort((a, b) => b.size - a.size);
  }
}
