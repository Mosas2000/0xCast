import React, { useState, useEffect } from 'react';
import { monitoringService } from '../services/MonitoringService';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    byName: {} as Record<string, number>,
    avgByName: {} as Record<string, number>,
  });

  useEffect(() => {
    const updateMetrics = () => {
      const allMetrics = monitoringService.getPerformanceMetrics();
      setMetrics(allMetrics.slice(-50));
      setStats(monitoringService.getPerformanceStats());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatValue = (value: number, unit: string): string => {
    if (unit === 'ms') {
      if (value >= 1000) {
        return `${(value / 1000).toFixed(2)}s`;
      }
      return `${value.toFixed(0)}ms`;
    } else if (unit === 'bytes') {
      if (value >= 1024 * 1024) {
        return `${(value / (1024 * 1024)).toFixed(2)}MB`;
      } else if (value >= 1024) {
        return `${(value / 1024).toFixed(2)}KB`;
      }
      return `${value}B`;
    }
    return value.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Performance Monitor</h2>
        <div className="text-sm text-gray-600">
          Total metrics: <span className="font-bold">{stats.total}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Performance Metrics</div>
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Unique Metrics</div>
          <div className="text-3xl font-bold text-green-600">
            {Object.keys(stats.byName).length}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Recent Performance Metrics</h3>
        <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
          {metrics.length === 0 ? (
            <div className="text-gray-500 text-center py-8">No performance data</div>
          ) : (
            <div className="space-y-2">
              {metrics.slice().reverse().map((metric, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                  <div className="flex-1">
                    <div className="font-medium">{metric.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {formatValue(metric.value, metric.unit)}
                    </div>
                    <div className="text-xs text-gray-500">{metric.unit}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-3">Performance by Metric Name</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          {Object.entries(stats.avgByName)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([name, avg]) => (
              <div key={name} className="py-2 border-b border-gray-200 last:border-0">
                <div className="flex justify-between mb-1">
                  <span className="truncate max-w-[200px]" title={name}>
                    {name}
                  </span>
                  <span className="font-medium">
                    {avg >= 1000 ? `${(avg / 1000).toFixed(2)}s` : `${avg.toFixed(0)}ms`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min((avg / 5000) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          {Object.keys(stats.avgByName).length === 0 && (
            <div className="text-gray-500 text-center py-4">No performance data</div>
          )}
        </div>
      </div>
    </div>
  );
};
