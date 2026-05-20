import React, { useState, useEffect } from 'react';
import { rateLimitMonitoringService } from '@/services/RateLimitMonitoringService';
import { RateLimitAlert } from '@/services/RateLimitMonitoringService';
import { RateLimitAction } from '@/types/rateLimit';
import { getActionDisplayName } from '@/utils/rateLimitHelpers';

interface TopActionItem {
  action: RateLimitAction;
  count: number;
}

interface TopUserItem {
  userId: string;
  violations: number;
}

export const RateLimitMonitoringDashboard: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [alerts, setAlerts] = useState<RateLimitAlert[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [selectedSeverity]);

  const refreshData = () => {
    const newReport = rateLimitMonitoringService.generateReport();
    setReport(newReport);

    const newAlerts =
      selectedSeverity === 'all'
        ? rateLimitMonitoringService.getActiveAlerts()
        : rateLimitMonitoringService.getActiveAlerts(
            selectedSeverity as any
          );
    setAlerts(newAlerts);
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (!report) {
    return <div className="p-4">Loading monitoring data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rate Limit Monitoring</h1>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Violations</div>
          <div className="text-3xl font-bold">{report.totalViolations}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Unique Users</div>
          <div className="text-3xl font-bold">{report.uniqueUsers}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Critical Alerts</div>
          <div className="text-3xl font-bold text-red-600">
            {report.alertsBySeverity.critical}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">High Alerts</div>
          <div className="text-3xl font-bold text-orange-600">
            {report.alertsBySeverity.high}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-4">Top Violating Actions</h2>
          <div className="space-y-2">
            {report.topActions.map((item: any) => (
              <div
                key={item.action}
                className="flex justify-between items-center p-2 border rounded"
              >
                <span className="font-medium">
                  {getActionDisplayName(item.action)}
                </span>
                <span className="text-gray-600">{item.count} violations</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-4">Top Violators</h2>
          <div className="space-y-2">
            {report.topUsers.map((user: any, index: number) => (
              <div
                key={user.userId}
                className="flex justify-between items-center p-2 border rounded"
              >
                <span className="font-medium">
                  {index + 1}. {user.userId.slice(0, 10)}...
                </span>
                <span className="text-gray-600">{user.violations} violations</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Active Alerts</h2>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1 border rounded"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="space-y-2">
          {alerts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No active alerts</div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 border rounded ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {getActionDisplayName(alert.action)} - {alert.userId.slice(0, 10)}...
                    </div>
                    <div className="text-sm">
                      {alert.violationCount} violations detected
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold">
                      {alert.severity}
                    </span>
                    <button
                      onClick={() => {
                        rateLimitMonitoringService.dismissAlert(alert.id);
                        refreshData();
                      }}
                      className="text-sm hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
