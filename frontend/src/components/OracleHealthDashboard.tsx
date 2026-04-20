import React, { useEffect, useState } from 'react';
import { ProviderHealth } from '@/types/oracle';
import { OracleNetworkService } from '@/services/OracleNetworkService';
import { PriceFormatter } from '@/utils/oraclePriceFormatter';

interface HealthDashboardProps {
  refreshInterval?: number;
  showChart?: boolean;
  onHealthChange?: (health: ProviderHealth[]) => void;
}

interface HealthStats {
  provider: string;
  successRate: number;
  uptime: number;
  latency: number;
  health: ProviderHealth;
}

const HealthStatusBadge: React.FC<{ status: string; confidence: number }> = ({
  status,
  confidence,
}) => {
  const statusColors: Record<string, string> = {
    healthy: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    unhealthy: 'bg-red-100 text-red-800',
  };

  const color = statusColors[status] || statusColors.degraded;
  const formatted = PriceFormatter.formatConfidence(confidence);

  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)} - {formatted}
    </div>
  );
};

const HealthMetric: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  status?: 'good' | 'warning' | 'critical';
}> = ({ label, value, unit, status }) => {
  const statusStyles: Record<string, string> = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    critical: 'text-red-600',
  };

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-200">
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold ${statusStyles[status || 'good']}`}>
        {value}
        {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
      </span>
    </div>
  );
};

export const OracleHealthDashboard: React.FC<HealthDashboardProps> = ({
  refreshInterval = 5000,
  showChart = false,
  onHealthChange,
}) => {
  const [stats, setStats] = useState<HealthStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const providers = await OracleNetworkService.getProviderStats();

        const newStats: HealthStats[] = providers.map((provider) => ({
          provider: provider.id,
          successRate: provider.successRate,
          uptime: provider.uptime,
          latency: provider.averageLatency,
          health: provider,
        }));

        setStats(newStats);

        if (onHealthChange) {
          onHealthChange(newStats.map((s) => s.health));
        }
      } catch (error) {
        console.error('Failed to fetch health stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, onHealthChange]);

  const getStatusColor = (stat: HealthStats): string => {
    if (stat.successRate >= 0.95 && stat.uptime >= 0.99) {
      return 'bg-green-50 border-green-200';
    }
    if (stat.successRate >= 0.8 && stat.uptime >= 0.9) {
      return 'bg-yellow-50 border-yellow-200';
    }
    return 'bg-red-50 border-red-200';
  };

  const getStatusLabel = (stat: HealthStats): string => {
    if (stat.successRate >= 0.95 && stat.uptime >= 0.99) {
      return 'Healthy';
    }
    if (stat.successRate >= 0.8 && stat.uptime >= 0.9) {
      return 'Degraded';
    }
    return 'Unhealthy';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading oracle health...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Oracle Network Health</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.provider}
            className={`border p-4 rounded-lg cursor-pointer transition ${getStatusColor(stat)}`}
            onClick={() => setSelectedProvider(stat.provider)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{stat.provider}</h3>
              <HealthStatusBadge
                status={getStatusLabel(stat)}
                confidence={stat.health.healthScore}
              />
            </div>

            <div className="space-y-2">
              <HealthMetric
                label="Success Rate"
                value={PriceFormatter.formatPercentage(stat.successRate, 1)}
                status={stat.successRate >= 0.95 ? 'good' : stat.successRate >= 0.8 ? 'warning' : 'critical'}
              />
              <HealthMetric
                label="Uptime"
                value={PriceFormatter.formatPercentage(stat.uptime, 1)}
                status={stat.uptime >= 0.99 ? 'good' : stat.uptime >= 0.9 ? 'warning' : 'critical'}
              />
              <HealthMetric
                label="Avg Latency"
                value={PriceFormatter.formatDuration(stat.latency)}
                status={stat.latency < 1000 ? 'good' : stat.latency < 3000 ? 'warning' : 'critical'}
              />
            </div>
          </div>
        ))}
      </div>

      {selectedProvider && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detailed Stats - {selectedProvider}
          </h3>

          {stats
            .filter((s) => s.provider === selectedProvider)
            .map((stat) => (
              <div key={stat.provider} className="space-y-4">
                <HealthMetric
                  label="Response Count"
                  value={stat.health.responseCount}
                />
                <HealthMetric
                  label="Error Count"
                  value={stat.health.errorCount}
                />
                <HealthMetric
                  label="Health Score"
                  value={PriceFormatter.formatPercentage(stat.health.healthScore, 2)}
                />
                <HealthMetric
                  label="Last Response"
                  value={PriceFormatter.formatTimestamp(stat.health.lastResponseTime, 'relative')}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default OracleHealthDashboard;
