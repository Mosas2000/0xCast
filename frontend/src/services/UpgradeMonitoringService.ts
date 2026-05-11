export interface UpgradeMetrics {
  totalUpgrades: number;
  successfulUpgrades: number;
  failedUpgrades: number;
  averageUpgradeTime: number;
  lastUpgradeTime: number;
}

export interface MigrationMetrics {
  totalMigrations: number;
  executedMigrations: number;
  pendingMigrations: number;
  rolledBackMigrations: number;
}

export interface UpgradeEvent {
  type: 'proposed' | 'executed' | 'cancelled' | 'failed';
  timestamp: number;
  details: Record<string, unknown>;
}

export class UpgradeMonitoringService {
  private events: UpgradeEvent[] = [];
  private metrics: UpgradeMetrics = {
    totalUpgrades: 0,
    successfulUpgrades: 0,
    failedUpgrades: 0,
    averageUpgradeTime: 0,
    lastUpgradeTime: 0,
  };

  recordEvent(event: UpgradeEvent): void {
    this.events.push(event);
    this.updateMetrics(event);
  }

  private updateMetrics(event: UpgradeEvent): void {
    if (event.type === 'proposed') {
      this.metrics.totalUpgrades++;
    } else if (event.type === 'executed') {
      this.metrics.successfulUpgrades++;
      this.metrics.lastUpgradeTime = event.timestamp;
    } else if (event.type === 'failed') {
      this.metrics.failedUpgrades++;
    }
  }

  getMetrics(): UpgradeMetrics {
    return { ...this.metrics };
  }

  getEvents(limit?: number): UpgradeEvent[] {
    if (limit) {
      return this.events.slice(-limit);
    }
    return [...this.events];
  }

  getEventsByType(type: UpgradeEvent['type']): UpgradeEvent[] {
    return this.events.filter(e => e.type === type);
  }

  getRecentEvents(since: number): UpgradeEvent[] {
    return this.events.filter(e => e.timestamp >= since);
  }

  calculateSuccessRate(): number {
    if (this.metrics.totalUpgrades === 0) return 0;
    return this.metrics.successfulUpgrades / this.metrics.totalUpgrades;
  }

  getUpgradeFrequency(windowMs: number): number {
    const cutoff = Date.now() - windowMs;
    const recentUpgrades = this.events.filter(
      e => e.type === 'executed' && e.timestamp >= cutoff
    );
    return recentUpgrades.length;
  }

  detectAnomalies(): string[] {
    const anomalies: string[] = [];
    
    const successRate = this.calculateSuccessRate();
    if (successRate < 0.8) {
      anomalies.push(`Low success rate: ${(successRate * 100).toFixed(1)}%`);
    }
    
    const recentFailures = this.getEventsByType('failed').filter(
      e => e.timestamp > Date.now() - 86400000
    );
    if (recentFailures.length > 2) {
      anomalies.push(`Multiple recent failures: ${recentFailures.length}`);
    }
    
    return anomalies;
  }

  exportLogs(): string {
    return JSON.stringify({
      metrics: this.metrics,
      events: this.events,
      exportedAt: Date.now(),
    }, null, 2);
  }

  clearOldEvents(olderThan: number): number {
    const initialLength = this.events.length;
    this.events = this.events.filter(e => e.timestamp >= olderThan);
    return initialLength - this.events.length;
  }
}

export const upgradeMonitoringService = new UpgradeMonitoringService();
