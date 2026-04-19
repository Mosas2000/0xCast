# Export API Reference

Complete API documentation for the export system.

## Table of Contents

- [ExportService](#exportservice)
- [useExport Hook](#useexport-hook)
- [useScheduledExports Hook](#usescheduledexports-hook)
- [Components](#components)
- [Types](#types)

---

## ExportService

The core service for generating and downloading export files.

### Methods

#### `generateTransactionExport(transactions, format)`

Generate an export of transaction history.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `transactions` | `ExportTransaction[]` | Array of transaction objects |
| `format` | `ExportFormat` | Output format: 'csv' or 'json' |

**Returns:** `Promise<string>` - Formatted export content

**Example:**

```typescript
const csv = await ExportService.generateTransactionExport(transactions, 'csv');
const json = await ExportService.generateTransactionExport(transactions, 'json');
```

---

#### `generatePortfolioExport(portfolio, format)`

Generate an export of portfolio snapshot.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `portfolio` | `ExportPortfolio` | Portfolio object with summary and positions |
| `format` | `ExportFormat` | Output format: 'csv' or 'json' |

**Returns:** `Promise<string>` - Formatted export content

**Example:**

```typescript
const portfolio = {
  totalValue: 5000,
  totalInvested: 4000,
  totalWinnings: 1500,
  positions: 5,
  markets: 3,
  exportDate: '2024-01-20',
  positions_data: [],
};

const json = await ExportService.generatePortfolioExport(portfolio, 'json');
```

---

#### `generatePositionsExport(positions, format)`

Generate an export of market positions.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `positions` | `ExportPosition[]` | Array of position objects |
| `format` | `ExportFormat` | Output format: 'csv' or 'json' |

**Returns:** `Promise<string>` - Formatted export content

**Example:**

```typescript
const positions = [
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
];

const csv = await ExportService.generatePositionsExport(positions, 'csv');
```

---

#### `generateRewardsExport(rewards, format)`

Generate an export of reward history.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `rewards` | `ExportReward[]` | Array of reward objects |
| `format` | `ExportFormat` | Output format: 'csv' or 'json' |

**Returns:** `Promise<string>` - Formatted export content

**Example:**

```typescript
const rewards = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'referral_bonus',
    amount: 100,
    source: 'referral',
    description: 'Referral reward for user signup',
  },
];

const json = await ExportService.generateRewardsExport(rewards, 'json');
```

---

#### `generateTaxReport(transactions, year, format)`

Generate a tax report for a specific year.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `transactions` | `ExportTransaction[]` | Array of transaction objects |
| `year` | `number` | Tax year (e.g., 2024) |
| `format` | `ExportFormat` | Output format: 'csv' or 'json' |

**Returns:** `Promise<string>` - Formatted tax report

**Calculation Logic:**

- Income: Claims + Withdrawals
- Losses: Stakes + Investments
- Net Gain/Loss: Income - Losses

**Example:**

```typescript
const report = await ExportService.generateTaxReport(transactions, 2024, 'json');
```

---

#### `downloadExport(content, fileName, format)`

Trigger a browser download of export content.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `content` | `string` | Export content (CSV or JSON string) |
| `fileName` | `string` | Name for downloaded file |
| `format` | `ExportFormat` | Format type for MIME type detection |

**Returns:** `void`

**Example:**

```typescript
ExportService.downloadExport(csvContent, 'transactions-2024.csv', 'csv');
```

---

## useExport Hook

React hook for managing export operations and state.

### Returns

```typescript
{
  isExporting: boolean;
  progress: ExportProgress;
  error: string | null;
  exportTransactions: (transactions, options) => Promise<void>;
  exportPortfolio: (portfolio, options) => Promise<void>;
  exportPositions: (positions, options) => Promise<void>;
  exportRewards: (rewards, options) => Promise<void>;
  exportTaxReport: (transactions, year, options) => Promise<void>;
  reset: () => void;
}
```

### Properties

#### `isExporting: boolean`

Indicates if an export is currently in progress.

#### `progress: ExportProgress`

Current export progress state:

```typescript
{
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  totalRecords: number;
  processedRecords: number;
  downloadUrl?: string;
  error?: string;
}
```

#### `error: string | null`

Error message if export failed, null if successful.

### Methods

#### `exportTransactions(transactions, options)`

Export transaction history.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `transactions` | `any[]` | Transaction data array |
| `options` | `ExportOptions` | Export configuration |

**Example:**

```typescript
const { exportTransactions } = useExport();

await exportTransactions(myTransactions, {
  format: 'csv',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
});
```

---

#### `exportPortfolio(portfolio, options)`

Export portfolio snapshot.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `portfolio` | `any` | Portfolio object |
| `options` | `ExportOptions` | Export configuration |

**Example:**

```typescript
const { exportPortfolio } = useExport();

await exportPortfolio(myPortfolio, {
  format: 'json',
});
```

---

#### `exportPositions(positions, options)`

Export market positions.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `positions` | `any[]` | Position data array |
| `options` | `ExportOptions` | Export configuration |

---

#### `exportRewards(rewards, options)`

Export reward history.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `rewards` | `any[]` | Reward data array |
| `options` | `ExportOptions` | Export configuration |

---

#### `exportTaxReport(transactions, year, options)`

Export tax report for a specific year.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `transactions` | `any[]` | Transaction data array |
| `year` | `number` | Tax year |
| `options` | `ExportOptions` | Export configuration |

---

#### `reset()`

Reset export state to initial values.

**Example:**

```typescript
const { reset } = useExport();

// After handling export or error
reset();
```

---

## useScheduledExports Hook

React hook for managing scheduled recurring exports.

### Returns

```typescript
{
  exports: ScheduledExport[];
  isLoading: boolean;
  error: string | null;
  addScheduledExport: (config) => Promise<void>;
  removeScheduledExport: (exportId) => Promise<void>;
  updateScheduledExport: (exportId, config) => Promise<void>;
  getNextRunTime: (schedule) => Date;
  pauseExport: (exportId) => Promise<void>;
  resumeExport: (exportId) => Promise<void>;
}
```

### Properties

#### `exports: ScheduledExport[]`

Array of scheduled exports.

#### `isLoading: boolean`

Loading state for initial fetch.

#### `error: string | null`

Error message if operation failed.

### Methods

#### `addScheduledExport(config)`

Create a new scheduled export.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `config` | `ScheduledExport` | Export configuration |

**Example:**

```typescript
const { addScheduledExport } = useScheduledExports();

await addScheduledExport({
  id: '',
  exportType: 'transactions',
  format: 'csv',
  schedule: {
    frequency: 'weekly',
    dayOfWeek: 1,
    time: { hours: 9, minutes: 0 },
  },
  createdAt: '',
  lastRunAt: null,
  nextRunAt: '',
  isActive: true,
});
```

---

#### `removeScheduledExport(exportId)`

Delete a scheduled export.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `exportId` | `string` | ID of export to remove |

---

#### `updateScheduledExport(exportId, config)`

Update a scheduled export configuration.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `exportId` | `string` | ID of export to update |
| `config` | `Partial<ScheduledExport>` | Partial configuration |

---

#### `getNextRunTime(schedule)`

Calculate next scheduled run time.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `schedule` | `ExportSchedule` | Schedule configuration |

**Returns:** `Date` - Next scheduled run time

---

#### `pauseExport(exportId)`

Temporarily disable a scheduled export.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `exportId` | `string` | ID of export to pause |

---

#### `resumeExport(exportId)`

Re-enable a paused scheduled export.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `exportId` | `string` | ID of export to resume |

---

## Components

### ExportDialog

Modal dialog for initiating exports.

**Props:**

```typescript
interface ExportDialogProps {
  onClose: () => void;
  isOpen: boolean;
  defaultType?: ExportType;
  data: {
    transactions?: any[];
    positions?: any[];
    portfolio?: any;
    rewards?: any[];
  };
}
```

**Usage:**

```tsx
<ExportDialog
  isOpen={showDialog}
  onClose={() => setShowDialog(false)}
  defaultType="transactions"
  data={{ transactions, positions, portfolio, rewards }}
/>
```

---

### ExportOptions

Component for configuring export parameters.

**Props:**

```typescript
interface ExportOptionsProps {
  exportType: ExportType;
  onConfirm: (options: ExportOptions) => void;
  onBack: () => void;
  onTaxYearChange?: (year: number) => void;
  currentYear?: number;
}
```

---

### ExportProgress

Component displaying export progress.

**Props:**

```typescript
interface ExportProgressProps {
  progress: ExportProgress;
  isExporting: boolean;
}
```

---

### ScheduledExportManager

Self-contained component for managing scheduled exports.

**Usage:**

```tsx
<ScheduledExportManager />
```

---

## Types

### ExportFormat

```typescript
type ExportFormat = 'csv' | 'json';
```

### ExportType

```typescript
type ExportType = 'transactions' | 'positions' | 'portfolio' | 'rewards' | 'tax_report';
```

### ExportOptions

```typescript
interface ExportOptions {
  format: ExportFormat;
  dateFrom?: string;
  dateTo?: string;
}
```

### ExportProgress

```typescript
interface ExportProgress {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  downloadUrl?: string;
  error?: string;
}
```

### ExportTransaction

```typescript
interface ExportTransaction {
  id: string;
  date: string;
  type: string;
  marketId: number;
  amount: number;
  outcome: string;
  status: string;
  txHash?: string;
}
```

### ExportPosition

```typescript
interface ExportPosition {
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

### ExportPortfolio

```typescript
interface ExportPortfolio {
  totalValue: number;
  totalInvested: number;
  totalWinnings: number;
  positions: number;
  markets: number;
  exportDate: string;
  positions_data: ExportPosition[];
}
```

### ExportReward

```typescript
interface ExportReward {
  id: string;
  date: string;
  type: string;
  amount: number;
  source: string;
  description: string;
}
```

### TaxReport

```typescript
interface TaxReport {
  year: number;
  totalIncome: number;
  totalLosses: number;
  netGainLoss: number;
  transactions: Array<{
    date: string;
    type: string;
    proceeds: number;
    cost: number;
    gain: number;
  }>;
  generatedAt: string;
}
```

### ScheduledExport

```typescript
interface ScheduledExport {
  id: string;
  exportType: ExportType;
  format: ExportFormat;
  schedule: ExportSchedule;
  createdAt: string;
  lastRunAt: string | null;
  nextRunAt: string;
  isActive: boolean;
}
```

### ExportSchedule

```typescript
interface ExportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly/quarterly/yearly
  month?: number; // 0-11 for yearly
  time?: { hours: number; minutes: number };
}
```
