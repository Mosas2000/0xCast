import React, { useState, useEffect } from 'react';
import { errorLoggingService } from '@/services/ErrorLoggingService';
import type { ErrorLog } from '@/services/ErrorLoggingService';

interface ErrorStats {
  total: number;
  byCode: Record<string, number>;
  bySeverity: Record<string, number>;
  byComponent: Record<string, number>;
  recentErrors: ErrorLog[];
}

export const ErrorMonitoringDashboard: React.FC = () => {
  const [stats, setStats] = useState<ErrorStats>({
    total: 0,
    byCode: {},
    bySeverity: {},
    byComponent: {},
    recentErrors: [],
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      const logs = errorLoggingService.getErrorLogs();
      const statistics = errorLoggingService.getStatistics();

      const byCode: Record<string, number> = {};
      const bySeverity: Record<string, number> = {};
      const byComponent: Record<string, number> = {};

      logs.forEach((log) => {
        const code = log.code || 'UNKNOWN';
        byCode[code] = (byCode[code] || 0) + 1;

        const severity = log.severity || 'error';
        bySeverity[severity] = (bySeverity[severity] || 0) + 1;

        const component = log.context?.component || 'Unknown';
        byComponent[component] = (byComponent[component] || 0) + 1;
      });

      setStats({
        total: statistics.totalErrors,
        byCode,
        bySeverity,
        byComponent,
        recentErrors: logs.slice(0, 10),
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = () => {
    errorLoggingService.clearLogs();
    setStats({
      total: 0,
      byCode: {},
      bySeverity: {},
      byComponent: {},
      recentErrors: [],
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              {stats.total} Error{stats.total !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="ml-4 text-blue-600 hover:text-blue-700 text-sm"
          >
            View Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 w-96 max-h-[600px] overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Error Monitoring</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Errors</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-2xl font-bold">
              {Object.keys(stats.byComponent).length}
            </div>
            <div className="text-sm text-gray-600">Components</div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">By Severity</h4>
          <div className="space-y-1">
            {Object.entries(stats.bySeverity).map(([severity, count]) => (
              <div key={severity} className="flex justify-between text-sm">
                <span className={getSeverityColor(severity)}>
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">By Component</h4>
          <div className="space-y-1">
            {Object.entries(stats.byComponent)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([component, count]) => (
                <div key={component} className="flex justify-between text-sm">
                  <span className="text-gray-700">{component}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Recent Errors</h4>
          <div className="space-y-2">
            {stats.recentErrors.map((error, index) => (
              <div
                key={index}
                className="bg-gray-50 p-2 rounded text-xs space-y-1"
              >
                <div className="flex justify-between items-start">
                  <span className={`font-medium ${getSeverityColor(error.severity)}`}>
                    {error.code || 'UNKNOWN'}
                  </span>
                  <span className="text-gray-500">
                    {formatTimestamp(error.timestamp)}
                  </span>
                </div>
                <div className="text-gray-700 truncate">{error.message}</div>
                {error.context?.component && (
                  <div className="text-gray-500">
                    Component: {error.context.component}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleClearLogs}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
        >
          Clear All Logs
        </button>
      </div>
    </div>
  );
};
