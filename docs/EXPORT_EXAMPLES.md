# Export Feature Examples

Complete code examples for using the export functionality.

## Table of Contents

- [Basic Exports](#basic-exports)
- [Advanced Filtering](#advanced-filtering)
- [Scheduled Exports](#scheduled-exports)
- [Error Handling](#error-handling)
- [Integration Examples](#integration-examples)
- [Testing](#testing)

---

## Basic Exports

### Export Transactions to CSV

```typescript
import { ExportService } from '@/services/ExportService';

const transactions = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'claim',
    marketId: 123,
    amount: 500,
    outcome: 'Yes',
    status: 'completed',
    txHash: '0xabc123',
  },
  {
    id: '2',
    date: '2024-01-20',
    type: 'stake',
    marketId: 124,
    amount: 100,
    outcome: 'No',
    status: 'pending',
    txHash: '0xdef456',
  },
];

const csv = await ExportService.generateTransactionExport(transactions, 'csv');
ExportService.downloadExport(csv, 'transactions-2024.csv', 'csv');
```

### Export Portfolio to JSON

```typescript
import { ExportService } from '@/services/ExportService';

const portfolio = {
  totalValue: 5000,
  totalInvested: 4000,
  totalWinnings: 1500,
  positions: 5,
  markets: 3,
  exportDate: '2024-01-20',
  positions_data: [
    {
      marketId: 123,
      marketQuestion: 'Will Bitcoin reach $100k?',
      yesStake: 500,
      noStake: 200,
      currentValue: 750,
      status: 'open',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-20',
    },
  ],
};

const json = await ExportService.generatePortfolioExport(portfolio, 'json');
ExportService.downloadExport(json, 'portfolio-2024-01-20.json', 'json');
```

### Export Rewards History

```typescript
import { ExportService } from '@/services/ExportService';

const rewards = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'referral_bonus',
    amount: 100,
    source: 'referral',
    description: 'Referral reward for user signup',
  },
  {
    id: '2',
    date: '2024-01-18',
    type: 'trading_reward',
    amount: 50,
    source: 'trading',
    description: 'Trading incentive reward',
  },
];

const csv = await ExportService.generateRewardsExport(rewards, 'csv');
ExportService.downloadExport(csv, 'rewards-2024.csv', 'csv');
```

---

## Advanced Filtering

### Export Transactions with Date Range

```typescript
import { useExport } from '@/hooks/useExport';

export function ExportByDateRange() {
  const { exportTransactions, progress, error } = useExport();
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-12-31');

  const handleExport = async () => {
    const transactions = await fetchTransactions(dateFrom, dateTo);

    await exportTransactions(transactions, {
      format: 'csv',
      dateFrom,
      dateTo,
    });
  };

  return (
    <div>
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
      />
      <input
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
      />
      <button onClick={handleExport} disabled={progress.status === 'processing'}>
        Export {progress.progress}%
      </button>
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
```

### Export Positions by Status

```typescript
import { ExportService } from '@/services/ExportService';

export async function exportOpenPositions(allPositions) {
  const openPositions = allPositions.filter(p => p.status === 'open');

  const csv = await ExportService.generatePositionsExport(
    openPositions,
    'csv'
  );

  ExportService.downloadExport(
    csv,
    `open-positions-${new Date().toISOString().split('T')[0]}.csv`,
    'csv'
  );
}
```

### Export High-Value Transactions

```typescript
import { ExportService } from '@/services/ExportService';

export async function exportHighValueTransactions(transactions, minAmount = 1000) {
  const filtered = transactions.filter(t => t.amount >= minAmount);

  const json = await ExportService.generateTransactionExport(filtered, 'json');

  ExportService.downloadExport(
    json,
    `high-value-transactions-${minAmount}.json`,
    'json'
  );
}
```

---

## Scheduled Exports

### Create Daily Export Schedule

```typescript
import { useScheduledExports } from '@/hooks/useScheduledExports';

export function SetupDailyExport() {
  const { addScheduledExport } = useScheduledExports();

  const handleAddDailyExport = async () => {
    await addScheduledExport({
      id: '',
      exportType: 'transactions',
      format: 'csv',
      schedule: {
        frequency: 'daily',
        time: { hours: 9, minutes: 0 },
      },
      createdAt: '',
      lastRunAt: null,
      nextRunAt: '',
      isActive: true,
    });
  };

  return (
    <button onClick={handleAddDailyExport}>
      Schedule Daily Export at 9:00 AM
    </button>
  );
}
```

### Create Weekly Tax Report Export

```typescript
import { useScheduledExports } from '@/hooks/useScheduledExports';

export function SetupWeeklyTaxExport() {
  const { addScheduledExport } = useScheduledExports();

  const handleAddWeeklyTaxExport = async () => {
    await addScheduledExport({
      id: '',
      exportType: 'tax_report',
      format: 'json',
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 5, // Friday
        time: { hours: 17, minutes: 0 }, // 5 PM
      },
      createdAt: '',
      lastRunAt: null,
      nextRunAt: '',
      isActive: true,
    });
  };

  return (
    <button onClick={handleAddWeeklyTaxExport}>
      Schedule Weekly Tax Report (Friday 5 PM)
    </button>
  );
}
```

### Create Monthly Portfolio Export

```typescript
import { useScheduledExports } from '@/hooks/useScheduledExports';

export function SetupMonthlyPortfolioExport() {
  const { addScheduledExport } = useScheduledExports();

  const handleAddMonthlyExport = async () => {
    await addScheduledExport({
      id: '',
      exportType: 'portfolio',
      format: 'json',
      schedule: {
        frequency: 'monthly',
        dayOfMonth: 1, // First day of month
        time: { hours: 8, minutes: 0 },
      },
      createdAt: '',
      lastRunAt: null,
      nextRunAt: '',
      isActive: true,
    });
  };

  return (
    <button onClick={handleAddMonthlyExport}>
      Schedule Monthly Portfolio Snapshot
    </button>
  );
}
```

### Manage Scheduled Exports

```typescript
import { useScheduledExports } from '@/hooks/useScheduledExports';

export function ExportScheduleManager() {
  const {
    exports,
    pauseExport,
    resumeExport,
    removeScheduledExport,
    getNextRunTime,
  } = useScheduledExports();

  return (
    <div className="space-y-4">
      {exports.map(exp => (
        <div key={exp.id} className="border rounded-lg p-4">
          <h3 className="font-semibold">{exp.exportType}</h3>
          <p className="text-sm text-gray-600">
            Next run: {getNextRunTime(exp.schedule).toLocaleString()}
          </p>
          <div className="flex gap-2 mt-2">
            {exp.isActive ? (
              <button onClick={() => pauseExport(exp.id)}>Pause</button>
            ) : (
              <button onClick={() => resumeExport(exp.id)}>Resume</button>
            )}
            <button onClick={() => removeScheduledExport(exp.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Error Handling

### Graceful Error Handling

```typescript
import { useExport } from '@/hooks/useExport';

export function SafeExportComponent() {
  const {
    isExporting,
    progress,
    error,
    exportTransactions,
    reset,
  } = useExport();

  const handleExport = async () => {
    try {
      await exportTransactions(transactions, { format: 'csv' });
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
          Export failed: {error}
          <button onClick={reset} className="ml-4">
            Try Again
          </button>
        </div>
      )}

      {progress.status === 'processing' && (
        <div>
          <p>Exporting... {progress.progress}%</p>
          <div className="w-full bg-gray-200 rounded">
            <div
              className="bg-blue-600 h-2"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}

      {progress.status === 'completed' && (
        <div className="text-green-600">
          Export completed successfully!
        </div>
      )}

      <button
        onClick={handleExport}
        disabled={isExporting}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {isExporting ? 'Exporting...' : 'Export Data'}
      </button>
    </div>
  );
}
```

### Error Retry Logic

```typescript
import { useExport } from '@/hooks/useExport';

export function ExportWithRetry() {
  const { exportTransactions, error, reset } = useExport();
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleExportWithRetry = async () => {
    try {
      await exportTransactions(transactions, { format: 'csv' });
      setRetryCount(0);
    } catch (err) {
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        setRetryCount(retryCount + 1);
        handleExportWithRetry();
      } else {
        console.error('Export failed after retries:', err);
      }
    }
  };

  return (
    <button onClick={handleExportWithRetry}>
      Export {retryCount > 0 && `(Retry ${retryCount}/${MAX_RETRIES})`}
    </button>
  );
}
```

---

## Integration Examples

### Dashboard Integration

```typescript
import { useState } from 'react';
import ExportDialog from '@/components/ExportDialog';
import { useTransactions } from '@/hooks/useTransactions';
import { usePortfolio } from '@/hooks/usePortfolio';

export function Dashboard() {
  const [showExport, setShowExport] = useState(false);
  const transactions = useTransactions();
  const portfolio = usePortfolio();

  return (
    <div>
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={() => setShowExport(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Export Data
        </button>
      </header>

      {/* Dashboard content */}

      <ExportDialog
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={{
          transactions: transactions.data,
          portfolio: portfolio.data,
        }}
      />
    </div>
  );
}
```

### Settings Page Integration

```typescript
import ScheduledExportManager from '@/components/ScheduledExportManager';

export function Settings() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <section>
        <h2 className="text-2xl font-bold mb-4">Data Export Settings</h2>
        <ScheduledExportManager />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-4">Export History</h3>
        {/* Show past exports */}
      </section>
    </div>
  );
}
```

---

## Testing

### Test Export Functionality

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ExportDialog from '@/components/ExportDialog';

describe('Export Functionality', () => {
  it('should export transactions successfully', async () => {
    const mockData = {
      transactions: [
        {
          id: '1',
          date: '2024-01-15',
          type: 'claim',
          marketId: 123,
          amount: 500,
          outcome: 'Yes',
          status: 'completed',
        },
      ],
    };

    render(
      <ExportDialog
        isOpen={true}
        onClose={vi.fn()}
        data={mockData}
        defaultType="transactions"
      />
    );

    const transactionButton = screen.getByText('Transaction History');
    fireEvent.click(transactionButton);

    await waitFor(() => {
      expect(screen.getByText('File Format')).toBeInTheDocument();
    });
  });

  it('should handle export errors', async () => {
    const mockData = { transactions: [] };

    render(
      <ExportDialog
        isOpen={true}
        onClose={vi.fn()}
        data={mockData}
      />
    );

    // Error state testing
  });
});
```

### Test Hook Usage

```typescript
import { renderHook, act } from '@testing-library/react';
import { useExport } from '@/hooks/useExport';

describe('useExport Hook', () => {
  it('should track export progress', async () => {
    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportTransactions(
        Array(100).fill({ id: '1' }),
        { format: 'csv' }
      );
    });

    expect(result.current.progress.totalRecords).toBe(100);
  });

  it('should handle export errors', async () => {
    const { result } = renderHook(() => useExport());

    await act(async () => {
      try {
        await result.current.exportTransactions([], { format: 'invalid' as any });
      } catch (err) {
        // Expected error
      }
    });

    expect(result.current.error).not.toBeNull();
  });
});
```

---

## Complete Workflow Example

```typescript
import { useState } from 'react';
import ExportDialog from '@/components/ExportDialog';
import ScheduledExportManager from '@/components/ScheduledExportManager';
import { useExport } from '@/hooks/useExport';
import { useScheduledExports } from '@/hooks/useScheduledExports';

export function CompleteExportWorkflow() {
  const [showExport, setShowExport] = useState(false);
  const {
    isExporting,
    progress,
    error,
    exportTransactions,
    exportPortfolio,
    reset,
  } = useExport();
  const { exports: scheduledExports } = useScheduledExports();

  const mockData = {
    transactions: [],
    portfolio: {},
    positions: [],
    rewards: [],
  };

  return (
    <div className="space-y-8">
      {/* Manual Export Section */}
      <section className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-2xl font-bold mb-4">Manual Export</h2>
        <button
          onClick={() => setShowExport(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Export Data Now
        </button>

        <ExportDialog
          isOpen={showExport}
          onClose={() => setShowExport(false)}
          data={mockData}
        />
      </section>

      {/* Scheduled Exports Section */}
      <section className="bg-white rounded-lg p-6 shadow">
        <h2 className="text-2xl font-bold mb-4">Scheduled Exports</h2>
        <p className="text-gray-600 mb-4">
          You have {scheduledExports.length} scheduled export(s)
        </p>
        <ScheduledExportManager />
      </section>

      {/* Export Status Section */}
      {(isExporting || error || progress.status === 'completed') && (
        <section className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-2xl font-bold mb-4">Export Status</h2>
          {isExporting && (
            <div>
              <p>Exporting... {progress.progress}%</p>
              <div className="w-full bg-gray-200 rounded h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}
          {error && (
            <div className="text-red-600 mb-4">{error}</div>
          )}
          {progress.status === 'completed' && (
            <div className="text-green-600">Export completed!</div>
          )}
          {(error || progress.status === 'completed') && (
            <button
              onClick={reset}
              className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
            >
              Reset
            </button>
          )}
        </section>
      )}
    </div>
  );
}
```
