import React, { useEffect, useState } from 'react';
import { ProviderHealth } from '@/types/oracle';
import { OracleNetworkService } from '@/services/OracleNetworkService';
import { PriceFormatter } from '@/utils/oraclePriceFormatter';

interface ComparisonMetric {
  label: string;
  value: number;
  unit?: string;
  percentage?: boolean;
}

interface ProviderComparison extends ProviderHealth {
  metrics: ComparisonMetric[];
  rank: number;
}

export const ProviderComparisonView: React.FC<{
  refreshInterval?: number;
  sortBy?: 'health' | 'latency' | 'uptime' | 'success';
}> = ({ refreshInterval = 10000, sortBy = 'health' }) => {
  const [providers, setProviders] = useState<ProviderComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const stats = await OracleNetworkService.getProviderStats();

        const comparisons: ProviderComparison[] = stats.map((provider, idx) => ({
          ...provider,
          metrics: [
            {
              label: 'Success Rate',
              value: provider.successRate,
              unit: '%',
              percentage: true,
            },
            {
              label: 'Uptime',
              value: provider.uptime,
              unit: '%',
              percentage: true,
            },
            {
              label: 'Avg Latency',
              value: provider.averageLatency,
              unit: 'ms',
            },
            {
              label: 'Health Score',
              value: provider.healthScore,
              unit: '%',
              percentage: true,
            },
          ],
          rank: idx + 1,
        }));

        const sorted = sortProviders(comparisons, sortBy, sortOrder);
        setProviders(sorted.map((p, i) => ({ ...p, rank: i + 1 })));
      } catch (error) {
        console.error('Failed to fetch providers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
    const interval = setInterval(fetchProviders, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, sortBy, sortOrder]);

  const sortProviders = (
    items: ProviderComparison[],
    key: string,
    order: 'asc' | 'desc'
  ): ProviderComparison[] => {
    const sorted = [...items].sort((a, b) => {
      let aVal = 0;
      let bVal = 0;

      switch (key) {
        case 'health':
          aVal = a.healthScore;
          bVal = b.healthScore;
          break;
        case 'latency':
          aVal = a.averageLatency;
          bVal = b.averageLatency;
          break;
        case 'uptime':
          aVal = a.uptime;
          bVal = b.uptime;
          break;
        case 'success':
          aVal = a.successRate;
          bVal = b.successRate;
          break;
        default:
          aVal = a.healthScore;
          bVal = b.healthScore;
      }

      return order === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return sorted;
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const getHealthClass = (score: number): string => {
    if (score >= 0.95) return 'text-green-600 bg-green-50';
    if (score >= 0.8) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading providers...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Provider Comparison</h2>
        <div className="flex items-center gap-4 mt-4">
          <label className="text-sm text-gray-600">
            Sort by:
            <select
              className="ml-2 px-3 py-1 border border-gray-300 rounded-lg"
              onChange={(e) => console.log(e.target.value)}
            >
              <option value="health">Health Score</option>
              <option value="latency">Latency</option>
              <option value="uptime">Uptime</option>
              <option value="success">Success Rate</option>
            </select>
          </label>
          <button
            onClick={toggleSort}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            {sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="px-4 py-2 text-left font-semibold text-gray-900">Rank</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-900">Provider</th>
              <th className="px-4 py-2 text-right font-semibold text-gray-900">
                Success Rate
              </th>
              <th className="px-4 py-2 text-right font-semibold text-gray-900">Uptime</th>
              <th className="px-4 py-2 text-right font-semibold text-gray-900">Avg Latency</th>
              <th className="px-4 py-2 text-right font-semibold text-gray-900">Health Score</th>
              <th className="px-4 py-2 text-right font-semibold text-gray-900">Requests</th>
              <th className="px-4 py-2 text-right font-semibold text-gray-900">Errors</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => (
              <tr
                key={provider.id}
                className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                  provider.rank === 1 ? 'bg-green-50' : ''
                }`}
              >
                <td className="px-4 py-3 text-center font-bold text-gray-900">
                  #{provider.rank}
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{provider.id}</p>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-green-600 font-semibold">
                    {PriceFormatter.formatPercentage(provider.successRate, 1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-blue-600 font-semibold">
                    {PriceFormatter.formatPercentage(provider.uptime, 1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-semibold">
                    {PriceFormatter.formatDuration(provider.averageLatency)}
                  </span>
                </td>
                <td className={`px-4 py-3 text-right font-bold rounded ${getHealthClass(provider.healthScore)}`}>
                  {PriceFormatter.formatPercentage(provider.healthScore, 1)}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {provider.responseCount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-red-600 font-semibold">
                  {provider.errorCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {providers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No providers available</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Rankings</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>🥇 <span className="text-green-600 font-semibold">#{providers[0]?.rank || '-'}</span> - Best performing provider overall</li>
          {providers.length > 1 && (
            <>
              <li>🥈 <span className="text-gray-600 font-semibold">#{providers[1]?.rank || '-'}</span> - Second best provider</li>
              {providers.length > 2 && (
                <li>🥉 <span className="text-yellow-600 font-semibold">#{providers[2]?.rank || '-'}</span> - Third best provider</li>
              )}
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProviderComparisonView;
