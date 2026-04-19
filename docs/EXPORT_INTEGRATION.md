# Export Feature Integration Guide

This guide explains how to integrate the export functionality into existing components and workflows in the 0xCast application.

## Quick Start

### 1. Add Export Button to Dashboard

Add an export button to your main dashboard component:

```tsx
import { useState } from 'react';
import ExportDialog from '@/components/ExportDialog';

export function Dashboard() {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const transactions = useTransactions(); // Your existing hook
  const positions = usePositions(); // Your existing hook
  const portfolio = usePortfolio(); // Your existing hook
  const rewards = useRewards(); // Your existing hook

  return (
    <div>
      <button
        onClick={() => setIsExportDialogOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Export Data
      </button>

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        data={{
          transactions,
          positions,
          portfolio,
          rewards,
        }}
      />
    </div>
  );
}
```

### 2. Add Scheduled Exports Management

Add the scheduled exports manager to settings or dashboard:

```tsx
import ScheduledExportManager from '@/components/ScheduledExportManager';

export function Settings() {
  return (
    <div className="max-w-2xl mx-auto">
      <ScheduledExportManager />
    </div>
  );
}
```

### 3. Use Export Hook in Custom Components

For custom export workflows:

```tsx
import { useExport } from '@/hooks/useExport';

export function MyExportComponent() {
  const {
    isExporting,
    progress,
    error,
    exportTransactions,
    reset,
  } = useExport();

  const handleExport = async () => {
    const options = { format: 'csv' as const };
    await exportTransactions(myTransactionData, options);
  };

  return (
    <div>
      <button onClick={handleExport} disabled={isExporting}>
        {isExporting ? `Exporting... ${progress.progress}%` : 'Export'}
      </button>
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
```

## Integration Scenarios

### Scenario 1: Portfolio Page Export

Add export capability to portfolio page:

```tsx
import { useState } from 'react';
import ExportDialog from '@/components/ExportDialog';
import { usePortfolio } from '@/hooks/usePortfolio';
import { usePositions } from '@/hooks/usePositions';

export function PortfolioPage() {
  const [showExport, setShowExport] = useState(false);
  const portfolio = usePortfolio();
  const positions = usePositions();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <button
          onClick={() => setShowExport(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Export Portfolio
        </button>
      </div>

      {/* Portfolio content */}

      <ExportDialog
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        defaultType="portfolio"
        data={{
          portfolio: portfolio.data,
          positions: positions.data,
        }}
      />
    </div>
  );
}
```

### Scenario 2: Transaction History Page

Add export to transaction history:

```tsx
import { useState } from 'react';
import ExportDialog from '@/components/ExportDialog';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';

export function TransactionsPage() {
  const [showExport, setShowExport] = useState(false);
  const { transactions } = useTransactionHistory();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <button
          onClick={() => setShowExport(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          Export Transactions
        </button>
      </div>

      {/* Transaction list */}

      <ExportDialog
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        defaultType="transactions"
        data={{ transactions }}
      />
    </div>
  );
}
```

### Scenario 3: Rewards Dashboard

Add export to rewards section:

```tsx
import { useState } from 'react';
import ExportDialog from '@/components/ExportDialog';
import { useRewards } from '@/hooks/useRewards';

export function RewardsDashboard() {
  const [showExport, setShowExport] = useState(false);
  const { rewards, transactions } = useRewards();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rewards</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExport(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Rewards content */}

      <ExportDialog
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={{
          rewards,
          transactions,
        }}
      />
    </div>
  );
}
```

### Scenario 4: Tax Reporting Section

Add tax export functionality:

```tsx
import { useState } from 'react';
import ExportDialog from '@/components/ExportDialog';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';

export function TaxReporting() {
  const [showExport, setShowExport] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { transactions } = useTransactionHistory();

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tax Reports</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Year</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="px-4 py-2 border rounded-lg"
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowExport(true)}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Export Tax Report
        </button>
      </div>

      <ExportDialog
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        defaultType="tax_report"
        data={{ transactions }}
      />
    </div>
  );
}
```

## Data Requirements

### For Transaction Export

Required fields:
```typescript
{
  id: string;
  date: string; // ISO format
  type: 'stake' | 'claim' | 'withdrawal' | 'investment';
  marketId: number;
  amount: number;
  outcome: string;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
}
```

### For Position Export

Required fields:
```typescript
{
  marketId: number;
  marketQuestion: string;
  yesStake: number;
  noStake: number;
  currentValue: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}
```

### For Portfolio Export

Required fields:
```typescript
{
  totalValue: number;
  totalInvested: number;
  totalWinnings: number;
  positions: number;
  markets: number;
  exportDate: string;
  positions_data: ExportPosition[];
}
```

### For Reward Export

Required fields:
```typescript
{
  id: string;
  date: string;
  type: string;
  amount: number;
  source: string;
  description: string;
}
```

## Type Definitions

```typescript
// Core export types
type ExportFormat = 'csv' | 'json';
type ExportType = 'transactions' | 'positions' | 'portfolio' | 'rewards' | 'tax_report';

interface ExportOptions {
  format: ExportFormat;
  dateFrom?: string;
  dateTo?: string;
}

interface ExportProgress {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  totalRecords: number;
  processedRecords: number;
  downloadUrl?: string;
  error?: string;
}
```

## Error Handling

Handle export errors gracefully:

```tsx
const handleExport = async () => {
  try {
    await exportTransactions(data, options);
    // Success handling
  } catch (error) {
    if (error instanceof Error) {
      showErrorNotification(error.message);
    } else {
      showErrorNotification('An unexpected error occurred');
    }
  }
};
```

## Performance Tips

1. **Large Datasets**: For exports > 10,000 records, show progress indicator
2. **Memory Management**: Avoid storing all export data in state
3. **User Feedback**: Always show completion status
4. **Background Processing**: Consider server-side exports for very large datasets

## Testing Integration

Test export functionality:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import ExportDialog from '@/components/ExportDialog';

describe('Export Integration', () => {
  it('should export transactions', async () => {
    const mockData = {
      transactions: [{ id: '1', amount: 100 }],
    };

    render(
      <ExportDialog
        isOpen={true}
        onClose={vi.fn()}
        data={mockData}
        defaultType="transactions"
      />
    );

    // Verify component renders
    expect(screen.getByText('Export Data')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Issue: Export button not working

Check:
1. Data is properly passed to ExportDialog
2. Hook is properly imported
3. Dependencies are resolved

### Issue: Large export is slow

Solutions:
1. Increase initial_wait timeout for async operations
2. Consider implementing pagination
3. Use JSON format for large datasets

### Issue: Scheduled exports not saving

Check:
1. localStorage is enabled in browser
2. Browser allows localStorage writes
3. Privacy mode may affect persistence

## Support and Feedback

For issues or feedback on the export feature:
1. Check EXPORT_README.md for feature documentation
2. Review EXPORT_API.md for API details
3. Check EXPORT_EXAMPLES.md for code examples
