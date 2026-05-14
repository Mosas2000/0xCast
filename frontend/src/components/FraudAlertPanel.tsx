import { useEffect, useReducer } from 'react';
import { FraudAlert, SuspiciousActivity } from '../types/reputation';
import { reputationFraudIntegration } from '../services/ReputationFraudIntegrationService';

interface FraudAlertPanelProps {
  userId: string;
}

interface FraudState {
  alerts: FraudAlert[];
  activities: SuspiciousActivity[];
  riskScore: number;
}

type FraudAction =
  | { type: 'SET_ALERTS'; payload: FraudAlert[] }
  | { type: 'SET_ACTIVITIES'; payload: SuspiciousActivity[] }
  | { type: 'SET_RISK_SCORE'; payload: number }
  | { type: 'LOAD_ALL'; payload: FraudState };

const initialState: FraudState = {
  alerts: [],
  activities: [],
  riskScore: 0,
};

function fraudReducer(state: FraudState, action: FraudAction): FraudState {
  switch (action.type) {
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
    case 'SET_RISK_SCORE':
      return { ...state, riskScore: action.payload };
    case 'LOAD_ALL':
      return action.payload;
    default:
      return state;
  }
}

export function FraudAlertPanel({ userId }: FraudAlertPanelProps) {
  const [state, dispatch] = useReducer(fraudReducer, initialState);

  useEffect(() => {
    loadFraudData();
  }, [userId]);

  const loadFraudData = () => {
    const fraudService = reputationFraudIntegration.getFraudDetectionService();
    
    const userAlerts = fraudService.getAlerts(userId);
    const userActivities = fraudService.getSuspiciousActivities(userId);
    const risk = fraudService.getRiskScore(userId);

    dispatch({
      type: 'LOAD_ALL',
      payload: {
        alerts: userAlerts,
        activities: userActivities,
        riskScore: risk,
      },
    });
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    const fraudService = reputationFraudIntegration.getFraudDetectionService();
    fraudService.acknowledgeAlert(alertId);
    loadFraudData();
  };

  const handleResolveAlert = (alertId: string) => {
    const fraudService = reputationFraudIntegration.getFraudDetectionService();
    fraudService.resolveAlert(alertId);
    loadFraudData();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  const activeAlerts = state.alerts.filter(a => a.status === 'active');

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Fraud Risk Assessment
          </h2>
          <div className="text-right">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Risk Score
            </div>
            <div className={`text-3xl font-bold ${getRiskScoreColor(state.riskScore)}`}>
              {state.riskScore}/100
            </div>
          </div>
        </div>

        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              state.riskScore >= 80 ? 'bg-red-500' :
              state.riskScore >= 60 ? 'bg-orange-500' :
              state.riskScore >= 40 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${state.riskScore}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
          <span>Low Risk</span>
          <span>High Risk</span>
        </div>
      </div>

      {activeAlerts.length > 0 && (
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-800">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
            Active Alerts ({activeAlerts.length})
          </h3>
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.alertId}
                className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium capitalize">
                      {alert.type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm mt-1">
                      {alert.message}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-white dark:bg-neutral-800 capitalize">
                    {alert.severity}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs">
                    {new Date(alert.createdAt).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.alertId)}
                      className="text-xs px-3 py-1 rounded bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => handleResolveAlert(alert.alertId)}
                      className="text-xs px-3 py-1 rounded bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.activities.length > 0 && (
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-800">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
            Suspicious Activities
          </h3>
          <div className="space-y-3">
            {state.activities.slice(0, 5).map((activity) => (
              <div
                key={activity.activityId}
                className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium capitalize">
                      {activity.type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {activity.description}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded capitalize ${
                    activity.status === 'confirmed' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                    activity.status === 'investigating' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                    'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-400'
                  }`}>
                    {activity.status}
                  </span>
                </div>

                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  Detected: {new Date(activity.detectedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAlerts.length === 0 && state.activities.length === 0 && (
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-800 text-center">
          <div className="text-green-500 text-5xl mb-3">✓</div>
          <div className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
            No Fraud Detected
          </div>
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Your account shows no signs of fraudulent activity
          </div>
        </div>
      )}
    </div>
  );
}
