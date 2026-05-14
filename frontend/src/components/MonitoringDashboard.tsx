import React, { useReducer, useEffect } from 'react';
import { monitoringService } from '../services/MonitoringService';

interface MonitoringDashboardProps {
  refreshInterval?: number;
}

interface MonitoringState {
  performanceStats: {
    total: number;
    byName: Record<string, number>;
    avgByName: Record<string, number>;
  };
  errorStats: {
    total: number;
    byType: Record<string, number>;
    byMessage: Record<string, number>;
  };
  userActions: number;
}

type MonitoringAction =
  | { type: 'UPDATE_STATS'; payload: MonitoringState }
  | { type: 'CLEAR_ALL' };

const initialState: MonitoringState = {
  performanceStats: {
    total: 0,
    byName: {},
    avgByName: {},
  },
  errorStats: {
    total: 0,
    byType: {},
    byMessage: {},
  },
  userActions: 0,
};

function monitoringReducer(state: MonitoringState, action: MonitoringAction): MonitoringState {
  switch (action.type) {
    case 'UPDATE_STATS':
      return action.payload;
    case 'CLEAR_ALL':
      return initialState;
    default:
      return state;
  }
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  refreshInterval = 5000,
}) => {
  const [state, dispatch] = useReducer(monitoringReducer, initialState);

  useEffect(() => {
    const updateStats = () => {
      const perfStats = monitoringService.getPerformanceStats();
      const errStats = monitoringService.getErrorStats();
      const actions = monitoringService.getUserActions().length;

      dispatch({
        type: 'UPDATE_STATS',
        payload: {
          performanceStats: perfStats,
          errorStats: errStats,
          userActions: actions,
        },
      });
    };

    updateStats();
    const interval = setInterval(updateStats, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleClearAll = () => {
    monitoringService.clearAllMetrics();
    dispatch({ type: 'CLEAR_ALL' });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Monitoring Dashboard</h2>
        <button
          onClick={handleClearAll}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Performance Metrics</div>
          <div className="text-3xl font-bold text-blue-600">
            {formatNumber(state.performanceStats.total)}
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total Errors</div>
          <div className="text-3xl font-bold text-red-600">
            {formatNumber(state.errorStats.total)}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">User Actions Tracked</div>
          <div className="text-3xl font-bold text-green-600">
            {formatNumber(state.userActions)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Performance Metrics by Name</h3>
          <div className="space-y-2">
            {Object.entries(state.performanceStats.byName)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([name, count]) => (
                <div key={name} className="flex justify-between text-sm">
                  <span className="truncate max-w-[200px]" title={name}>
                    {name}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            {Object.keys(state.performanceStats.byName).length === 0 && (
              <div className="text-gray-500 text-center py-4">No performance data</div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Errors by Type</h3>
          <div className="space-y-2">
            {Object.entries(state.errorStats.byType)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="truncate max-w-[200px]" title={type}>
                    {type}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            {Object.keys(state.errorStats.byType).length === 0 && (
              <div className="text-gray-500 text-center py-4">No errors</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-3">Recent User Actions</h3>
        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
          {monitoringService.getRecentUserActions(10).map((action, index) => (
            <div key={index} className="text-sm py-1 border-b border-gray-200 last:border-0">
              <span className="font-medium">{action.action}</span>
              {action.context && (
                <span className="text-gray-600 ml-2">
                  {JSON.stringify(action.context)}
                </span>
              )}
            </div>
          ))}
          {monitoringService.getUserActions().length === 0 && (
            <div className="text-gray-500 text-center py-4">No user actions tracked</div>
          )}
        </div>
      </div>
    </div>
  );
};
