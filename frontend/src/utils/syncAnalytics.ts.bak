/**
 * Sync analytics and reporting for synchronization system
 */

export type SyncEventData = Record<string, string | number | boolean | null | undefined>;

export interface SyncAnalyticsEvent {
  type: string;
  timestamp: number;
  data: SyncEventData;
}

export interface SyncAnalyticsReport {
  period: { start: number; end: number };
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  totalConflicts: number;
  resolvedConflicts: number;
  avgSyncDuration: number;
  totalActionsProcessed: number;
  failureReason: Record<string, number>;
  conflictsByType: Record<string, number>;
  peakHours: Array<{ hour: number; count: number }>;
}

export class SyncAnalyticsService {
  private events: SyncAnalyticsEvent[] = [];
  private maxEvents: number = 10000;

  recordEvent(type: string, data: SyncEventData = {}): void {
    const event: SyncAnalyticsEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    this.events.push(event);

    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  recordSyncStart(): void {
    this.recordEvent('sync:start', {});
  }

  recordSyncSuccess(duration: number, entityCount: number): void {
    this.recordEvent('sync:success', { duration, entityCount });
  }

  recordSyncFailure(error: string, duration: number): void {
    this.recordEvent('sync:failure', { error, duration });
  }

  recordConflict(
    entityType: string,
    conflictType: string,
    resolution: string
  ): void {
    this.recordEvent('conflict:detected', {
      entityType,
      conflictType,
      resolution,
    });
  }

  recordActionQueued(entityType: string): void {
    this.recordEvent('action:queued', { entityType });
  }

  recordActionProcessed(entityType: string, duration: number): void {
    this.recordEvent('action:processed', { entityType, duration });
  }

  recordActionFailed(entityType: string, reason: string): void {
    this.recordEvent('action:failed', { entityType, reason });
  }

  generateReport(
    startTime?: number,
    endTime?: number
  ): SyncAnalyticsReport {
    const start = startTime || Date.now() - 24 * 60 * 60 * 1000;
    const end = endTime || Date.now();

    const periodEvents = this.events.filter(
      (e) => e.timestamp >= start && e.timestamp <= end
    );

    const syncs = periodEvents.filter((e) => e.type.startsWith('sync:'));
    const conflicts = periodEvents.filter((e) =>
      e.type.startsWith('conflict:')
    );
    const actions = periodEvents.filter((e) => e.type.startsWith('action:'));

    const successfulSyncs = syncs.filter(
      (e) => e.type === 'sync:success'
    ).length;
    const failedSyncs = syncs.filter((e) => e.type === 'sync:failure').length;

    const avgSyncDuration =
      syncs.length > 0
        ? syncs.reduce((sum, e) => sum + (e.data.duration || 0), 0) /
          syncs.length
        : 0;

    const resolvedConflicts = conflicts.filter(
      (e) => e.data.resolution
    ).length;

    const actionProcessed = actions.filter(
      (e) => e.type === 'action:processed'
    ).length;

    const failureReasons: Record<string, number> = {};
    syncs
      .filter((e) => e.type === 'sync:failure')
      .forEach((e) => {
        const reason = e.data.error || 'unknown';
        failureReasons[reason] = (failureReasons[reason] || 0) + 1;
      });

    const conflictsByType: Record<string, number> = {};
    conflicts.forEach((e) => {
      const type = e.data.conflictType || 'unknown';
      conflictsByType[type] = (conflictsByType[type] || 0) + 1;
    });

    const peakHours = this.calculatePeakHours(periodEvents);

    return {
      period: { start, end },
      totalSyncs: syncs.length,
      successfulSyncs,
      failedSyncs,
      totalConflicts: conflicts.length,
      resolvedConflicts,
      avgSyncDuration,
      totalActionsProcessed: actionProcessed,
      failureReason: failureReasons,
      conflictsByType,
      peakHours,
    };
  }

  private calculatePeakHours(events: SyncAnalyticsEvent[]): Array<{
    hour: number;
    count: number;
  }> {
    const hourly: Record<number, number> = {};

    events.forEach((e) => {
      const hour = new Date(e.timestamp).getHours();
      hourly[hour] = (hourly[hour] || 0) + 1;
    });

    return Object.entries(hourly)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  getRecentEvents(count: number = 10): SyncAnalyticsEvent[] {
    return this.events.slice(-count);
  }

  getEventsByType(type: string): SyncAnalyticsEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  clearOldEvents(olderThan: number = 7 * 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - olderThan;
    const before = this.events.length;

    this.events = this.events.filter((e) => e.timestamp > cutoff);

    return before - this.events.length;
  }

  exportData(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        eventCount: this.events.length,
        events: this.events,
      },
      null,
      2
    );
  }

  generateHTMLReport(report: SyncAnalyticsReport): string {
    const successRate =
      report.totalSyncs > 0
        ? (
            (report.successfulSyncs / report.totalSyncs) *
            100
          ).toFixed(2)
        : 'N/A';

    const conflictRate =
      report.totalSyncs > 0
        ? ((report.totalConflicts / report.totalSyncs) * 100).toFixed(2)
        : 'N/A';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Sync Analytics Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
    .metric { display: inline-block; margin: 10px 20px 10px 0; }
    .metric-label { font-weight: bold; color: #666; }
    .metric-value { font-size: 24px; color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #4CAF50; color: white; }
    .good { color: green; }
    .bad { color: red; }
  </style>
</head>
<body>
  <h1>Synchronization Analytics Report</h1>
  
  <div class="section">
    <h2>Report Period</h2>
    <p>${new Date(report.period.start).toLocaleString()} - ${new Date(report.period.end).toLocaleString()}</p>
  </div>

  <div class="section">
    <h2>Synchronization Summary</h2>
    <div class="metric">
      <div class="metric-label">Total Syncs</div>
      <div class="metric-value">${report.totalSyncs}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Successful</div>
      <div class="metric-value good">${report.successfulSyncs}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Failed</div>
      <div class="metric-value ${report.failedSyncs > 0 ? 'bad' : 'good'}">${report.failedSyncs}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Success Rate</div>
      <div class="metric-value">${successRate}%</div>
    </div>
    <div class="metric">
      <div class="metric-label">Avg Duration</div>
      <div class="metric-value">${report.avgSyncDuration.toFixed(2)}ms</div>
    </div>
  </div>

  <div class="section">
    <h2>Conflict Summary</h2>
    <div class="metric">
      <div class="metric-label">Total Conflicts</div>
      <div class="metric-value">${report.totalConflicts}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Resolved</div>
      <div class="metric-value">${report.resolvedConflicts}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Conflict Rate</div>
      <div class="metric-value">${conflictRate}%</div>
    </div>
  </div>
</body>
</html>
`;

    return html;
  }
}

/**
 * Health score calculator
 */
export class SyncHealthScoreCalculator {
  calculateScore(report: SyncAnalyticsReport): {
    score: number;
    grade: string;
    factors: Array<{ factor: string; weight: number; contribution: number }>;
  } {
    const factors: Array<{
      factor: string;
      weight: number;
      contribution: number;
    }> = [];

    const successRate =
      report.totalSyncs > 0
        ? report.successfulSyncs / report.totalSyncs
        : 1;
    const successContribution = successRate * 40;
    factors.push({
      factor: 'Success Rate',
      weight: 40,
      contribution: successContribution,
    });

    const conflictResolutionRate =
      report.totalConflicts > 0
        ? report.resolvedConflicts / report.totalConflicts
        : 1;
    const conflictContribution = conflictResolutionRate * 30;
    factors.push({
      factor: 'Conflict Resolution',
      weight: 30,
      contribution: conflictContribution,
    });

    const avgDuration = Math.min(report.avgSyncDuration / 1000, 1);
    const performanceContribution = (1 - avgDuration) * 20;
    factors.push({
      factor: 'Performance',
      weight: 20,
      contribution: performanceContribution,
    });

    const actionSuccessRate = report.totalActionsProcessed > 0 ? 1 : 0;
    const actionContribution = actionSuccessRate * 10;
    factors.push({
      factor: 'Action Processing',
      weight: 10,
      contribution: actionContribution,
    });

    const score = factors.reduce((sum, f) => sum + f.contribution, 0);

    let grade: string;
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    return { score, grade, factors };
  }

  isHealthy(report: SyncAnalyticsReport): boolean {
    const healthScore = this.calculateScore(report);
    return healthScore.score >= 80;
  }
}
