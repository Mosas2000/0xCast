import React, { useState, useEffect } from 'react';
import { OracleNetworkCoordinator } from '@/services/OracleNetworkCoordinator';
import { OracleProvider } from '@/types/oracle';

interface OracleNetworkDashboardProps {
  coordinator: OracleNetworkCoordinator;
}

export const OracleNetworkDashboard: React.FC<OracleNetworkDashboardProps> = ({ coordinator }) => {
  const [networkStatus, setNetworkStatus] = useState<any>(null);
  const [providers, setProviders] = useState<OracleProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [providerDetails, setProviderDetails] = useState<any>(null);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  useEffect(() => {
    const fetchStatus = () => {
      const status = coordinator.getNetworkStatus();
      setNetworkStatus(status);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, refreshInterval);

    return () => clearInterval(interval);
  }, [coordinator, refreshInterval]);

  useEffect(() => {
    if (selectedProvider) {
      const details = coordinator.getProviderStatus(selectedProvider);
      setProviderDetails(details);
    }
  }, [selectedProvider, coordinator]);

  const getHealthColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (!networkStatus) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Oracle Network Dashboard</h2>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Refresh:</label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={1000}>1s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Providers</div>
          <div className="text-3xl font-bold">{networkStatus.totalProviders}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Providers</div>
          <div className="text-3xl font-bold text-green-600">{networkStatus.activeProviders}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Network Health</div>
          <div className={`text-3xl font-bold ${getHealthColor(networkStatus.averageHealth)}`}>
            {networkStatus.averageHealth}%
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Active Alerts</div>
          <div className="text-3xl font-bold text-red-600">{networkStatus.activeAlerts}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Network Resilience</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Resilience Score</div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${networkStatus.resilience.score}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{networkStatus.resilience.score}%</span>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Redundancy</div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${networkStatus.resilience.redundancy}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{networkStatus.resilience.redundancy}%</span>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Diversification</div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${networkStatus.resilience.diversification}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{networkStatus.resilience.diversification}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Provider Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Health</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {providers.map((provider) => (
                <tr key={provider.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                    <div className="text-xs text-gray-500">{provider.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        provider.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {provider.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-16 h-2 rounded-full ${getHealthBgColor(provider.healthScore)}`}>
                        <div
                          className={`h-2 rounded-full ${getHealthColor(provider.healthScore).replace('text-', 'bg-')}`}
                          style={{ width: `${provider.healthScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{provider.healthScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {provider.successCount > 0
                        ? `${((provider.successCount / (provider.successCount + provider.errorCount)) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{provider.lastUpdate ? `${Date.now() - provider.lastUpdate}ms` : 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedProvider(provider.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProvider && providerDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Provider Details</h3>
              <button
                onClick={() => setSelectedProvider(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close provider details"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Provider Information</h4>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-gray-600">ID:</dt>
                  <dd className="font-mono">{providerDetails.provider?.id}</dd>
                  <dt className="text-gray-600">Name:</dt>
                  <dd>{providerDetails.provider?.name}</dd>
                  <dt className="text-gray-600">URL:</dt>
                  <dd className="truncate">{providerDetails.provider?.url}</dd>
                  <dt className="text-gray-600">Priority:</dt>
                  <dd>{providerDetails.provider?.priority}</dd>
                </dl>
              </div>

              {providerDetails.metrics && (
                <div>
                  <h4 className="font-medium mb-2">Health Metrics</h4>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-gray-600">Health Score:</dt>
                    <dd>{providerDetails.metrics.healthScore}%</dd>
                    <dt className="text-gray-600">Uptime:</dt>
                    <dd>{providerDetails.metrics.uptime.toFixed(2)}%</dd>
                    <dt className="text-gray-600">Average Latency:</dt>
                    <dd>{providerDetails.metrics.averageLatency.toFixed(0)}ms</dd>
                    <dt className="text-gray-600">Error Rate:</dt>
                    <dd>{providerDetails.metrics.errorRate.toFixed(2)}%</dd>
                  </dl>
                </div>
              )}

              {providerDetails.performance && (
                <div>
                  <h4 className="font-medium mb-2">Performance Stats</h4>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-gray-600">Total Requests:</dt>
                    <dd>{providerDetails.performance.totalRequests}</dd>
                    <dt className="text-gray-600">Successful:</dt>
                    <dd className="text-green-600">{providerDetails.performance.successfulRequests}</dd>
                    <dt className="text-gray-600">Failed:</dt>
                    <dd className="text-red-600">{providerDetails.performance.failedRequests}</dd>
                    <dt className="text-gray-600">Reliability:</dt>
                    <dd>{providerDetails.performance.reliability}%</dd>
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
