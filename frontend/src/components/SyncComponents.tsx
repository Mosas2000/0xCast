import React, { useState, useEffect } from 'react';
import { useSyncContext } from '@/context/SyncContext';
import { SyncState, SyncConflict, SyncMetrics } from '@/types/sync';

export function SyncStatusIndicator() {
  const { stateManager } = useSyncContext();
  const [status, setStatus] = useState<SyncState>(stateManager.getStatus());

  useEffect(() => {
    const handleStatusChange = (newStatus: SyncState) => {
      setStatus(newStatus);
    };

    stateManager.subscribe('status_changed', handleStatusChange);

    return () => {
      stateManager.unsubscribe('status_changed', handleStatusChange);
    };
  }, [stateManager]);

  const getStatusColor = () => {
    switch (status.status) {
      case 'synced':
        return '#10b981';
      case 'syncing':
        return '#3b82f6';
      case 'error':
        return '#ef4444';
      case 'offline':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'synced':
        return 'Synced';
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Sync Error';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="sync-status-indicator">
      <div
        className="status-dot"
        style={{ backgroundColor: getStatusColor() }}
      />
      <span className="status-text">{getStatusText()}</span>
      {status.pendingActions > 0 && (
        <span className="pending-badge">{status.pendingActions}</span>
      )}
    </div>
  );
}

export function SyncProgressBar() {
  const { stateManager } = useSyncContext();
  const [progress, setProgress] = useState(stateManager.getStatus().syncProgress);

  useEffect(() => {
    const handleProgressUpdate = (newProgress: number) => {
      setProgress(newProgress);
    };

    stateManager.subscribe('sync_progress', handleProgressUpdate);

    return () => {
      stateManager.unsubscribe('sync_progress', handleProgressUpdate);
    };
  }, [stateManager]);

  return (
    <div className="sync-progress-bar">
      <div className="progress-container">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="progress-text">{Math.round(progress)}%</span>
    </div>
  );
}

export function SyncMetricsDisplay() {
  const { stateManager } = useSyncContext();
  const [metrics, setMetrics] = useState(stateManager.getMetrics());

  useEffect(() => {
    const handleMetricsUpdate = (newMetrics: SyncMetrics) => {
      setMetrics(newMetrics);
    };

    stateManager.subscribe('metrics_updated', handleMetricsUpdate);

    return () => {
      stateManager.unsubscribe('metrics_updated', handleMetricsUpdate);
    };
  }, [stateManager]);

  const health = stateManager.getSyncHealth();

  return (
    <div className="sync-metrics">
      <div className="metric-item">
        <span className="label">Success Rate:</span>
        <span className={`value ${health.isHealthy ? 'healthy' : 'warning'}`}>
          {health.successRate.toFixed(1)}%
        </span>
      </div>
      <div className="metric-item">
        <span className="label">Conflicts:</span>
        <span className="value">{metrics.conflictsDetected}</span>
      </div>
      <div className="metric-item">
        <span className="label">Last Sync:</span>
        <span className="value">
          {new Date(metrics.lastSyncTime).toLocaleTimeString()}
        </span>
      </div>
      <div className="metric-item">
        <span className="label">Avg Sync Time:</span>
        <span className="value">{metrics.averageSyncTime.toFixed(0)}ms</span>
      </div>
    </div>
  );
}

export function ConflictResolver({ conflict }: { conflict: SyncConflict }) {
  const { conflictService } = useSyncContext();
  const [selectedStrategy, setSelectedStrategy] = useState('merge');

  const handleResolve = () => {
    const resolved = conflictService.resolveConflict(conflict, selectedStrategy as any);
    conflict.resolvedData = resolved;
    conflict.resolution = selectedStrategy as any;
  };

  return (
    <div className="conflict-resolver">
      <h3>Resolve Conflict</h3>
      <div className="conflict-details">
        <div className="conflict-section">
          <h4>Local Data</h4>
          <pre>{JSON.stringify(conflict.localData, null, 2)}</pre>
        </div>
        <div className="conflict-section">
          <h4>Remote Data</h4>
          <pre>{JSON.stringify(conflict.remoteData, null, 2)}</pre>
        </div>
      </div>
      <div className="strategy-selector">
        <label>Resolution Strategy:</label>
        <select
          value={selectedStrategy}
          onChange={e => setSelectedStrategy(e.target.value)}
        >
          <option value="local">Use Local Version</option>
          <option value="remote">Use Remote Version</option>
          <option value="merge">Merge Versions</option>
        </select>
      </div>
      <button onClick={handleResolve} className="resolve-button">
        Resolve
      </button>
    </div>
  );
}

export function PendingActionsPanel() {
  const { queueService } = useSyncContext();
  const [actions, setActions] = useState(queueService.getPendingActions());

  useEffect(() => {
    const handleQueueUpdate = () => {
      setActions(queueService.getPendingActions());
    };

    queueService.subscribe('action_queued', handleQueueUpdate);
    queueService.subscribe('action_complete', handleQueueUpdate);

    return () => {
      queueService.unsubscribe('action_queued', handleQueueUpdate);
      queueService.unsubscribe('action_complete', handleQueueUpdate);
    };
  }, [queueService]);

  return (
    <div className="pending-actions-panel">
      <h3>Pending Actions ({actions.length})</h3>
      {actions.length === 0 ? (
        <p className="no-actions">No pending actions</p>
      ) : (
        <div className="actions-list">
          {actions.map(action => (
            <div key={action.id} className="action-item">
              <div className="action-type">{action.action}</div>
              <div className="action-entity">
                {action.entityType} - {action.entityId}
              </div>
              <div className="action-time">
                {new Date(action.timestamp).toLocaleTimeString()}
              </div>
              {action.retryCount > 0 && (
                <div className="action-retry">
                  Retries: {action.retryCount}/{action.maxRetries}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SyncControlPanel() {
  const { synchronize, startAutoSync, stopAutoSync, stateManager } =
    useSyncContext();
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(
    stateManager.getConfig().autoSync
  );

  const handleManualSync = async () => {
    await synchronize();
  };

  const handleAutoSyncToggle = (enabled: boolean) => {
    setIsAutoSyncEnabled(enabled);
    if (enabled) {
      startAutoSync();
    } else {
      stopAutoSync();
    }
  };

  return (
    <div className="sync-control-panel">
      <button
        onClick={handleManualSync}
        className="sync-button"
      >
        Sync Now
      </button>
      <label className="auto-sync-toggle">
        <input
          type="checkbox"
          checked={isAutoSyncEnabled}
          onChange={e => handleAutoSyncToggle(e.target.checked)}
        />
        Auto Sync
      </label>
    </div>
  );
}

export function OfflineIndicator() {
  const { stateManager } = useSyncContext();
  const [isOffline, setIsOffline] = useState(stateManager.getStatus().isOffline);

  useEffect(() => {
    const handleStatusChange = (status: SyncState) => {
      setIsOffline(status.isOffline);
    };

    stateManager.subscribe('status_changed', handleStatusChange);

    return () => {
      stateManager.unsubscribe('status_changed', handleStatusChange);
    };
  }, [stateManager]);

  if (!isOffline) return null;

  return (
    <div className="offline-indicator">
      <div className="offline-message">
        You are offline. Changes will be synced when connection is restored.
      </div>
    </div>
  );
}
