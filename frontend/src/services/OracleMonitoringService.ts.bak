import {
  OracleProvider,
  OracleMetrics,
  MonitoringAlert,
  OracleNetworkState,
} from '@/types/oracle';

export class OracleMonitoringService {
  private static metrics: Map<string, OracleMetrics> = new Map();
  private static alerts: MonitoringAlert[] = [];
  private static alertCallbacks: ((alert: MonitoringAlert) => void)[] = [];

  static recordUpdate(
    providerId: string,
    success: boolean,
    latency: number,
    error?: string
  ): void {
    let metric = this.metrics.get(providerId);

    if (!metric) {
      metric = {
        providerId,
        uptime: 100,
        averageLatency: 0,
        successRate: 100,
        errorRate: 0,
        responseCount: 0,
        failureCount: 0,
        lastUpdate: Date.now(),
      };
      this.metrics.set(providerId, metric);
    }

    metric.lastUpdate = Date.now();

    if (success) {
      metric.responseCount++;
      const totalRequests = metric.responseCount + metric.failureCount;
      metric.averageLatency = (metric.averageLatency * (totalRequests - 1) + latency) / totalRequests;
      metric.successRate = (metric.responseCount / totalRequests) * 100;
      metric.errorRate = (metric.failureCount / totalRequests) * 100;
    } else {
      metric.failureCount++;
      metric.errorRate = (metric.failureCount / (metric.responseCount + metric.failureCount)) * 100;
      metric.successRate = (metric.responseCount / (metric.responseCount + metric.failureCount)) * 100;

      if (error) {
        this.createAlert(providerId, 'error', error, 'warning');
      }
    }

    this.updateUptime(providerId, metric);
  }

  static getMetrics(providerId: string): OracleMetrics | null {
    return this.metrics.get(providerId) || null;
  }

  static getAllMetrics(): OracleMetrics[] {
    return Array.from(this.metrics.values());
  }

  static checkHealthThresholds(provider: OracleProvider): void {
    const metric = this.metrics.get(provider.id);
    if (!metric) return;

    if (metric.successRate < 50) {
      this.createAlert(
        provider.id,
        'low_success_rate',
        `Success rate dropped to ${metric.successRate.toFixed(1)}%`,
        'critical'
      );
    }

    if (metric.averageLatency > provider.timeout) {
      this.createAlert(
        provider.id,
        'high_latency',
        `Average latency ${metric.averageLatency.toFixed(0)}ms exceeds timeout ${provider.timeout}ms`,
        'warning'
      );
    }

    if (metric.uptime < 70) {
      this.createAlert(
        provider.id,
        'low_uptime',
        `Uptime ${metric.uptime.toFixed(1)}% is below safe threshold`,
        'critical'
      );
    }

    if (metric.errorRate > 30) {
      this.createAlert(
        provider.id,
        'high_error_rate',
        `Error rate ${metric.errorRate.toFixed(1)}% is elevated`,
        'warning'
      );
    }
  }

  static getAlerts(resolved: boolean = false): MonitoringAlert[] {
    return this.alerts.filter((a) => a.resolved === resolved);
  }

  static getActiveAlerts(): MonitoringAlert[] {
    return this.getAlerts(false);
  }

  static resolveAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  static clearResolvedAlerts(): void {
    this.alerts = this.alerts.filter((a) => !a.resolved);
  }

  static onAlert(callback: (alert: MonitoringAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  static getNetworkHealth(providers: OracleProvider[]): number {
    if (providers.length === 0) return 0;

    const activeMetrics = providers
      .map((p) => this.metrics.get(p.id))
      .filter((m) => m !== undefined) as OracleMetrics[];

    if (activeMetrics.length === 0) return 0;

    const avgSuccessRate = activeMetrics.reduce((sum, m) => sum + m.successRate, 0) / activeMetrics.length;
    const avgUptime = activeMetrics.reduce((sum, m) => sum + m.uptime, 0) / activeMetrics.length;
    const activeProviders = providers.filter((p) => {
      const metric = this.metrics.get(p.id);
      return metric && metric.uptime > 50;
    }).length;

    const providerDiversity = (activeProviders / providers.length) * 100;

    return (avgSuccessRate * 0.4 + avgUptime * 0.4 + providerDiversity * 0.2) / 100;
  }

  static getProviderComparison(providers: OracleProvider[]) {
    return providers.map((p) => {
      const metric = this.metrics.get(p.id);
      return {
        id: p.id,
        name: p.name,
        uptime: metric?.uptime || 0,
        successRate: metric?.successRate || 0,
        averageLatency: metric?.averageLatency || 0,
        errorRate: metric?.errorRate || 0,
        enabled: p.enabled,
        healthScore: p.healthScore,
      };
    });
  }

  static generateReport(providers: OracleProvider[]) {
    const metrics = this.getAllMetrics();
    const activeAlerts = this.getActiveAlerts();

    return {
      timestamp: Date.now(),
      networkHealth: this.getNetworkHealth(providers),
      providersCount: providers.length,
      activeProvidersCount: providers.filter((p) => p.enabled && p.healthScore > 50).length,
      totalRequests: metrics.reduce((sum, m) => sum + m.responseCount + m.failureCount, 0),
      successRate: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length : 0,
      averageLatency: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.averageLatency, 0) / metrics.length : 0,
      activeAlerts: activeAlerts.length,
      criticalAlerts: activeAlerts.filter((a) => a.severity === 'critical').length,
      providers: this.getProviderComparison(providers),
    };
  }

  static resetMetrics(providerId?: string): void {
    if (providerId) {
      this.metrics.delete(providerId);
    } else {
      this.metrics.clear();
    }
  }

  static trackConsensusFailure(marketId: string, reason: string): void {
    this.createAlert(
      'network',
      'consensus_failure',
      `Market ${marketId}: ${reason}`,
      'critical'
    );
  }

  static trackFallbackActivation(marketId: string, strategy: string): void {
    this.createAlert(
      'network',
      'fallback_activated',
      `Market ${marketId}: Fallback strategy '${strategy}' activated`,
      'warning'
    );
  }

  static trackProviderFailover(fromProvider: string, toProvider: string): void {
    this.createAlert(
      fromProvider,
      'provider_failover',
      `Failover from ${fromProvider} to ${toProvider}`,
      'info'
    );
  }

  static getNetworkResilience(providers: OracleProvider[]): {
    score: number;
    redundancy: number;
    diversification: number;
    reliability: number;
  } {
    const total = providers.length;
    if (total === 0) {
      return { score: 0, redundancy: 0, diversification: 0, reliability: 0 };
    }

    const active = providers.filter((p) => p.enabled && p.healthScore > 50).length;
    const redundancy = (active / total) * 100;

    const uniqueUrls = new Set(providers.map((p) => new URL(p.url).hostname)).size;
    const diversification = (uniqueUrls / total) * 100;

    const metrics = this.getAllMetrics();
    const avgReliability = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length
      : 0;

    const score = (redundancy * 0.4 + diversification * 0.3 + avgReliability * 0.3);

    return {
      score: Math.round(score),
      redundancy: Math.round(redundancy),
      diversification: Math.round(diversification),
      reliability: Math.round(avgReliability),
    };
  }

  private static updateUptime(providerId: string, metric: OracleMetrics): void {
    const total = metric.responseCount + metric.failureCount;
    if (total === 0) {
      metric.uptime = 100;
    } else {
      metric.uptime = (metric.responseCount / total) * 100;
    }
  }

  private static createAlert(
    providerId: string,
    type: string,
    message: string,
    severity: 'info' | 'warning' | 'critical'
  ): void {
    const alert: MonitoringAlert = {
      id: `${providerId}-${type}-${Date.now()}`,
      timestamp: Date.now(),
      severity,
      type,
      providerId,
      message,
      resolved: false,
    };

    this.alerts.push(alert);

    if (this.alerts.length > 1000) {
      this.alerts.shift();
    }

    this.alertCallbacks.forEach((cb) => cb(alert));
  }
}
