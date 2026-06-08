import React, { useEffect, useState } from 'react';
import { OracleNetworkService } from '@/services/OracleNetworkService';
import { PriceFormatter } from '@/utils/oraclePriceFormatter';

interface NetworkStatus {
  totalProviders: number;
  activeProviders: number;
  networkHealth: number;
  lastUpdate: number;
  averageLatency: number;
  successRate: number;
}

const StatusIndicator: React.FC<{ health: number }> = ({ health }) => {
  const getColor = (): string => {
    if (health >= 0.95) return 'bg-green-500';
    if (health >= 0.75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLabel = (): string => {
    if (health >= 0.95) return 'Excellent';
    if (health >= 0.75) return 'Good';
    if (health >= 0.5) return 'Degraded';
    return 'Critical';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${getColor()} animate-pulse`}></div>
      <span className="text-sm font-medium text-gray-700">{getLabel()}</span>
    </div>
  );
};

const StatBox: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
}> = ({ label, value, unit, trend }) => {
  const trendIcon =
    trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {unit && <p className="text-xs text-gray-500">{unit}</p>}
      </div>
      {trend && (
        <p className="text-xs text-gray-500 mt-1">
          {trendIcon} {trend}
        </p>
      )}
    </div>
  );
};

export const OracleNetworkStatus: React.FC<{
  refreshInterval?: number;
}> = ({ refreshInterval = 10000 }) => {
  const [status, setStatus] = useState<NetworkStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const stats = await OracleNetworkService.getNetworkStats();
        const providers = await OracleNetworkService.getProviderStats();

        const activeProviders = providers.filter((p) => p.successRate > 0).length;
        const avgLatency =
          providers.reduce((sum, p) => sum + p.averageLatency, 0) / providers.length;
        const avgSuccess =
          providers.reduce((sum, p) => sum + p.successRate, 0) / providers.length;

        setStatus({
          totalProviders: providers.length,
          activeProviders,
          networkHealth: stats.networkHealth,
          lastUpdate: Date.now(),
          averageLatency: avgLatency,
          successRate: avgSuccess,
        });
      } catch (error) {
        console.error('Failed to fetch network status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading || !status) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading network status...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Oracle Network Status</h2>
          <StatusIndicator health={status.networkHealth} />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Last updated {PriceFormatter.formatTimestamp(status.lastUpdate, 'relative')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatBox
          label="Total Providers"
          value={status.totalProviders}
          trend={status.activeProviders === status.totalProviders ? 'stable' : 'down'}
        />
        <StatBox
          label="Active Providers"
          value={status.activeProviders}
          unit={`/ ${status.totalProviders}`}
        />
        <StatBox
          label="Network Health"
          value={PriceFormatter.formatPercentage(status.networkHealth, 1)}
          trend={status.networkHealth >= 0.9 ? 'up' : status.networkHealth >= 0.7 ? 'stable' : 'down'}
        />
        <StatBox
          label="Avg Latency"
          value={PriceFormatter.formatDuration(status.averageLatency)}
          trend={status.averageLatency < 1000 ? 'good' : 'warning'}
        />
        <StatBox
          label="Success Rate"
          value={PriceFormatter.formatPercentage(status.successRate, 1)}
          trend={status.successRate > 0.95 ? 'up' : 'stable'}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Oracle network is operating with {status.activeProviders} of {status.totalProviders} providers
          at {PriceFormatter.formatPercentage(status.networkHealth, 0)} health.
        </p>
      </div>
    </div>
  );
};

export default OracleNetworkStatus;
