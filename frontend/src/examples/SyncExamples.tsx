import React, { useState, useEffect } from 'react';
import { useSyncContext } from '@/context/SyncContext';
import {
  useSyncState,
  useActionQueue,
  useSynchronization,
  useConflictManagement,
  useSyncHealth,
  useLocalStorage,
} from '@/hooks/useSyncHooks';
import {
  SyncStatusIndicator,
  SyncProgressBar,
  SyncMetricsDisplay,
  ConflictResolver,
  PendingActionsPanel,
  SyncControlPanel,
  OfflineIndicator,
} from '@/components/SyncComponents';
import type { Order } from '@/types/transactions';
import type { SyncConflict } from '@/types/sync';

/**
 * Example 1: Basic Synchronization
 * Simple component that syncs entity when updated
 */
export function BasicSyncExample() {
  const { synchronize } = useSyncContext();
  const { addAction } = useActionQueue();
  const [data, setData] = useState({ name: '', email: '' });

  const handleUpdate = async (field: string, value: string) => {
    const updated = { ...data, [field]: value };
    setData(updated);

    // Queue the update
    addAction('user_1', 'user', 'update', updated);

    // Sync immediately
    await synchronize();
  };

  return (
    <div className="basic-sync-example">
      <input
        value={data.name}
        onChange={(e) => handleUpdate('name', e.target.value)}
        placeholder="Name"
      />
      <input
        value={data.email}
        onChange={(e) => handleUpdate('email', e.target.value)}
        placeholder="Email"
      />
      <SyncStatusIndicator />
    </div>
  );
}

/**
 * Example 2: Offline-First Pattern
 * Handles offline scenarios gracefully
 */
export function OfflineFirstExample() {
  const { stateManager } = useSyncContext();
  const { pendingCount } = useActionQueue();
  const status = stateManager.getStatus();

  return (
    <div className="offline-first-example">
      {status.isOffline && (
        <div className="offline-banner">
          <OfflineIndicator />
          <p>You are offline. {pendingCount} pending actions will sync when online.</p>
        </div>
      )}

      {!status.isOffline && (
        <div className="online-indicator">
          <p>Connection restored. Syncing...</p>
          <SyncProgressBar />
        </div>
      )}
    </div>
  );
}

/**
 * Example 3: Conflict Management
 * Handles detected conflicts with user interaction
 */
export function ConflictManagementExample() {
  const { conflicts, resolveConflict } = useConflictManagement();
  const [strategy, setStrategy] = useState<'merge' | 'local' | 'remote'>('merge');

  const handleResolveAll = () => {
    conflicts.forEach((conflict) => {
      resolveConflict(conflict.id, strategy);
    });
  };

  return (
    <div className="conflict-management-example">
      {conflicts.length > 0 && (
        <div className="conflict-section">
          <h3>Conflicts Detected ({conflicts.length})</h3>

          <div className="strategy-selector">
            <label>
              <input
                type="radio"
                value="merge"
                checked={strategy === 'merge'}
                onChange={(e) => setStrategy(e.target.value as any)}
              />
              Merge (Smart combine)
            </label>
            <label>
              <input
                type="radio"
                value="local"
                checked={strategy === 'local'}
                onChange={(e) => setStrategy(e.target.value as any)}
              />
              Keep Local
            </label>
            <label>
              <input
                type="radio"
                value="remote"
                checked={strategy === 'remote'}
                onChange={(e) => setStrategy(e.target.value as any)}
              />
              Use Blockchain
            </label>
          </div>

          <ConflictResolver
            conflicts={conflicts}
            onResolve={(id, s) => resolveConflict(id, s)}
          />

          <button onClick={handleResolveAll}>Resolve All with {strategy}</button>
        </div>
      )}
    </div>
  );
}

/**
 * Example 4: Batch Operations
 * Sync multiple entities in single operation
 */
export function BatchOperationsExample() {
  const { synchronize, stateManager } = useSyncContext();
  const { isSyncing } = useSynchronization();
  const [items, setItems] = useState<any[]>([]);

  const handleBatchUpdate = async () => {
    const updates = items.map((item) => ({
      ...item,
      updated: new Date().toISOString(),
    }));

    // Update all items
    updates.forEach((item) => {
      stateManager.updateEntity({
        id: item.id,
        type: 'item',
        data: item,
        localVersion: 1,
        remoteVersion: 0,
        hash: '',
        lastModified: Date.now(),
        isSynced: false,
        conflictCount: 0,
      });
    });

    // Single sync for all
    await synchronize();
  };

  return (
    <div className="batch-operations-example">
      <div className="items-list">
        {items.map((item) => (
          <div key={item.id} className="item">
            {item.name}
          </div>
        ))}
      </div>

      <button onClick={handleBatchUpdate} disabled={isSyncing}>
        {isSyncing ? 'Syncing...' : 'Sync All Items'}
      </button>
    </div>
  );
}

/**
 * Example 5: Health Monitoring
 * Monitor sync system health and performance
 */
export function HealthMonitoringExample() {
  const { metrics } = useSyncHealth();
  const { metrics: syncMetrics } = useSynchronization();

  return (
    <div className="health-monitoring-example">
      <div className="metrics-grid">
        <div className="metric">
          <label>Success Rate</label>
          <div className="value">
            {(metrics.successRate * 100).toFixed(1)}%
          </div>
        </div>

        <div className="metric">
          <label>Total Syncs</label>
          <div className="value">{syncMetrics.totalSyncs}</div>
        </div>

        <div className="metric">
          <label>Failures</label>
          <div className="value">{syncMetrics.failedSyncs}</div>
        </div>

        <div className="metric">
          <label>Conflicts</label>
          <div className="value">{syncMetrics.totalConflicts}</div>
        </div>

        <div className="metric">
          <label>Avg Sync Time</label>
          <div className="value">{syncMetrics.avgSyncTime.toFixed(0)}ms</div>
        </div>

        <div className="metric">
          <label>Last Sync</label>
          <div className="value">
            {new Date(syncMetrics.lastSyncTime).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <SyncMetricsDisplay refreshInterval={5000} />
    </div>
  );
}

/**
 * Example 6: Storage Management
 * Monitor and manage localStorage usage
 */
export function StorageManagementExample() {
  const { getStatistics } = useLocalStorage();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getStatistics());
    }, 5000);

    return () => clearInterval(interval);
  }, [getStatistics]);

  const percentUsed = stats
    ? ((stats.usedSpace / stats.totalSpace) * 100).toFixed(1)
    : 0;

  return (
    <div className="storage-management-example">
      <h3>Storage Usage</h3>

      {stats && (
        <>
          <div className="storage-info">
            <p>Used: {(stats.usedSpace / 1024 / 1024).toFixed(2)} MB</p>
            <p>Available: {(stats.totalSpace / 1024 / 1024).toFixed(2)} MB</p>
            <p>Usage: {percentUsed}%</p>
          </div>

          <div className="storage-bar">
            <div className="used" style={{ width: `${percentUsed}%` }}></div>
          </div>

          {Number(percentUsed) > 80 && (
            <p className="warning">Storage usage is high. Consider cleanup.</p>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Example 7: Dashboard
 * Complete synchronization dashboard
 */
export function SyncDashboard() {
  const { isSyncing } = useSynchronization();
  const { conflicts } = useConflictManagement();
  const { pendingCount } = useActionQueue();
  const { getStatistics } = useLocalStorage();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setStats(getStatistics());
  }, [getStatistics]);

  return (
    <div className="sync-dashboard">
      <div className="dashboard-header">
        <h2>Synchronization Dashboard</h2>
        <SyncStatusIndicator showDetails={true} />
      </div>

      {isSyncing && (
        <div className="sync-progress">
          <SyncProgressBar height={4} />
        </div>
      )}

      <div className="dashboard-grid">
        <div className="section">
          <h3>Status</h3>
          <SyncControlPanel />
        </div>

        <div className="section">
          <h3>Queue</h3>
          {pendingCount > 0 ? (
            <PendingActionsPanel compact={true} />
          ) : (
            <p>No pending actions</p>
          )}
        </div>

        <div className="section">
          <h3>Conflicts</h3>
          {conflicts.length > 0 ? (
            <div>
              <p>{conflicts.length} conflicts detected</p>
              <ConflictResolver
                conflicts={conflicts}
                onResolve={() => {}}
              />
            </div>
          ) : (
            <p>No conflicts</p>
          )}
        </div>

        <div className="section">
          <h3>Metrics</h3>
          <SyncMetricsDisplay refreshInterval={10000} />
        </div>

        <div className="section">
          <h3>Storage</h3>
          {stats && (
            <div>
              <p>Used: {(stats.usedSpace / 1024 / 1024).toFixed(2)} MB / {(stats.totalSpace / 1024 / 1024).toFixed(2)} MB</p>
              <p>Entities: {stats.entityCount || 0}</p>
              <p>Queued Actions: {stats.queueCount || 0}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Example 8: Market Trading with Conflict Handling
 * Real-world use case: Market trading with price conflict resolution
 */
export function MarketTradingExample() {
  const { synchronize } = useSyncContext();
  const { addAction } = useActionQueue();
  const { conflicts, resolveConflict } = useConflictManagement();
  const [orders, setOrders] = useState<Order[]>([]);

  const handlePlaceOrder = async (marketId: string, order: Order) => {
    // Add order action
    addAction(marketId, 'market', 'place_order', order);

    // Sync immediately for trading
    await synchronize();
  };

  const handlePriceConflict = (conflict: SyncConflict) => {
    // For trading: always use blockchain price (most recent)
    if (conflict.fieldName === 'currentPrice') {
      resolveConflict(conflict, 'remote');
    } else {
      resolveConflict(conflict, 'merge');
    }
  };

  return (
    <div className="market-trading-example">
      <h2>Market Trading</h2>

      {conflicts.length > 0 && (
        <div className="conflict-alert">
          <h3>Resolve Conflicts</h3>
          {conflicts.map((conflict) => (
            <div key={conflict.id} className="conflict-item">
              <p>
                {conflict.fieldName}: Local ${conflict.localData} vs Remote ${conflict.remoteData}
              </p>
              <button onClick={() => handlePriceConflict(conflict)}>
                Use Blockchain Price
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="orders">
        {orders.map((order) => (
          <div key={order.id} className="order">
            <p>{order.market}: {order.type} {order.amount} @ ${order.price}</p>
          </div>
        ))}
      </div>

      <SyncStatusIndicator />
    </div>
  );
}

/**
 * Example 9: Portfolio Rebalancing with Sync
 * Real-world use case: Portfolio rebalancing with state sync
 */
export function PortfolioRebalancingExample() {
  const { synchronize, stateManager } = useSyncContext();
  const { isSyncing } = useSynchronization();
  const [portfolio, setPortfolio] = useState<any>(null);

  const handleRebalance = async (allocations: Record<string, number>) => {
    if (!portfolio) return;

    const rebalanced = {
      ...portfolio,
      allocations,
      rebalancedAt: new Date().toISOString(),
    };

    // Update state
    setPortfolio(rebalanced);

    // Queue sync
    stateManager.updateEntity({
      id: portfolio.id,
      type: 'portfolio',
      data: rebalanced,
      localVersion: portfolio.localVersion + 1,
      remoteVersion: portfolio.remoteVersion,
      hash: '',
      lastModified: Date.now(),
      isSynced: false,
      conflictCount: 0,
    });

    // Sync to blockchain
    await synchronize();
  };

  return (
    <div className="portfolio-rebalancing-example">
      <h2>Portfolio Rebalancing</h2>

      {portfolio && (
        <div>
          <div className="portfolio-current">
            <h3>Current Allocation</h3>
            {Object.entries(portfolio.allocations).map(([asset, pct]) => (
              <div key={asset} className="allocation">
                <span>{asset}</span>
                <span>{pct}%</span>
              </div>
            ))}
          </div>

          <button
            onClick={() =>
              handleRebalance({
                BTC: 40,
                ETH: 35,
                STX: 25,
              })
            }
            disabled={isSyncing}
          >
            {isSyncing ? 'Syncing...' : 'Rebalance to 40/35/25'}
          </button>

          {isSyncing && <SyncProgressBar />}
        </div>
      )}
    </div>
  );
}

/**
 * Example 10: Data Export with Sync Verification
 * Real-world use case: Export data after verifying sync
 */
export function DataExportExample() {
  const { metrics } = useSynchronization();
  const { getAllEntities } = useLocalStorage();
  const [exportData, setExportData] = useState<string>('');

  const handleExport = async () => {
    const entities = getAllEntities();

    const data = {
      exportedAt: new Date().toISOString(),
      syncMetrics: {
        lastSyncTime: new Date(metrics.lastSyncTime).toISOString(),
        totalSyncs: metrics.totalSyncs,
        successRate: metrics.successRate,
      },
      entities: entities.map((e) => ({
        id: e.id,
        type: e.type,
        data: e.data,
        isSynced: e.isSynced,
      })),
    };

    const json = JSON.stringify(data, null, 2);
    setExportData(json);

    // Trigger download
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sync-export-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="data-export-example">
      <h2>Export Data</h2>

      <div className="export-info">
        <p>Synced at: {new Date(metrics.lastSyncTime).toLocaleString()}</p>
        <p>Success Rate: {(metrics.successRate * 100).toFixed(1)}%</p>
      </div>

      <button onClick={handleExport}>Export to JSON</button>

      {exportData && (
        <pre className="export-preview">{exportData.substring(0, 500)}...</pre>
      )}
    </div>
  );
}
