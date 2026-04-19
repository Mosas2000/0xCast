# Export User Data and History

This feature allows users to export their data from 0xCast in multiple formats (CSV and JSON) for analysis, record-keeping, and compliance purposes.

## Overview

The export system provides users with the ability to export:

- **Transaction History**: All trades and market interactions
- **Portfolio Snapshots**: Current portfolio state and value
- **Market Positions**: Detailed position information across markets
- **Reward History**: All earned rewards and bonuses
- **Tax Reports**: Automatically calculated tax information by year

## Features

### Multiple Export Formats

- **CSV**: Spreadsheet-compatible format for use in Excel, Google Sheets, or other tools
- **JSON**: Structured format for programmatic access and integration

### Flexible Date Filtering

For transaction and position exports, users can optionally filter by date range to export only relevant periods.

### Tax Report Generation

Automatic tax report generation for specific years with:
- Income calculation from claims and withdrawals
- Loss calculation from stakes and investments
- Net gain/loss computation
- Transaction-level detail

### Scheduled Exports

Users can set up recurring exports on:
- Daily schedule
- Weekly schedule (specific day of week)
- Monthly schedule (specific day of month)
- Quarterly schedule
- Yearly schedule

### Progress Tracking

Real-time progress indicators for large exports show:
- Current progress percentage
- Records processed vs total
- Processing status
- Error handling

## Usage

### Basic Export

1. Click the "Export Data" button in the dashboard
2. Select the export type (transactions, portfolio, positions, rewards, or tax report)
3. Choose the file format (CSV or JSON)
4. For date-based exports, optionally set date range
5. Click "Export" to download the file

### Tax Report Export

1. Select "Tax Report" as export type
2. Choose the desired tax year
3. Select file format
4. Click "Export" to download

### Scheduled Exports

1. Navigate to "Scheduled Exports" section
2. Click "Add Schedule"
3. Configure:
   - Export type
   - File format
   - Frequency (daily, weekly, monthly, quarterly, yearly)
   - Time and day preferences
4. Click "Create Schedule"

To manage scheduled exports:
- **Pause**: Temporarily disable a schedule
- **Resume**: Re-enable a paused schedule
- **Delete**: Permanently remove a schedule

## File Formats

### CSV Format

CSV files are formatted with:
- Header row containing column names
- Proper escaping of special characters
- One record per line
- Compatible with all spreadsheet applications

Example transaction export:
```
Date,Type,Market ID,Amount,Outcome,Status,Transaction Hash
2024-01-15,claim,123,500.00,Yes,completed,0xabc123
2024-01-20,stake,124,100.00,No,pending,0xdef456
```

### JSON Format

JSON files include:
- Export metadata (date, type, record count)
- Complete data objects
- Pretty-printed for readability
- Structured for programmatic access

Example transaction export:
```json
{
  "exportDate": "2024-01-20T15:30:00.000Z",
  "type": "transactions",
  "count": 2,
  "data": [
    {
      "id": "1",
      "date": "2024-01-15",
      "type": "claim",
      "marketId": 123,
      "amount": 500,
      "outcome": "Yes",
      "status": "completed",
      "txHash": "0xabc123"
    }
  ]
}
```

## Technical Details

### Architecture

The export system is built with:

- **ExportService**: Core logic for generating export files
- **useExport Hook**: React hook for managing export operations
- **useScheduledExports Hook**: State management for scheduled exports
- **Export Components**: UI components for user interaction

### Data Processing

All exports are processed client-side:
- No server-side file storage
- Direct browser downloads via Blob/URL API
- Memory-efficient streaming for large datasets

### CSV Handling

CSV generation includes proper handling of:
- Special characters (commas, quotes, newlines)
- Data escaping
- Column alignment
- UTF-8 encoding

### Tax Calculation Logic

Tax reports differentiate transactions:
- **Income Sources**: Claims, withdrawals
- **Costs**: Stakes, investments
- **Net Calculation**: Income - Costs

## API Reference

### ExportService

The main service for generating exports.

**Methods:**

- `generateTransactionExport(transactions, format)`: Generate transaction export
- `generatePortfolioExport(portfolio, format)`: Generate portfolio snapshot
- `generatePositionsExport(positions, format)`: Generate position details
- `generateRewardsExport(rewards, format)`: Generate reward history
- `generateTaxReport(transactions, year, format)`: Generate tax report
- `downloadExport(content, fileName, format)`: Download export file

### useExport Hook

React hook for managing export operations.

**Returns:**

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

### useScheduledExports Hook

React hook for managing scheduled exports.

**Returns:**

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

## Components

### ExportDialog

Main modal component for initiating exports.

**Props:**
- `isOpen`: Boolean to control dialog visibility
- `onClose`: Callback when dialog closes
- `defaultType`: Default export type to select
- `data`: Object containing transaction, position, portfolio, and reward data

### ExportOptions

Component for selecting export format and date range.

**Props:**
- `exportType`: Type of export being configured
- `onConfirm`: Callback with selected options
- `onBack`: Callback to go back
- `onTaxYearChange`: Callback for tax year selection
- `currentYear`: Current selected tax year

### ExportProgress

Component displaying export progress.

**Props:**
- `progress`: ExportProgress object with status and metrics
- `isExporting`: Boolean indicating active export

### ScheduledExportManager

Component for managing scheduled exports.

Full self-contained component with UI for creating and managing recurring exports.

## Compliance and Data Privacy

All export operations:
- Process data locally in the browser
- Do not send data to external servers
- Generate files directly from local state
- Never store exported files on servers
- Respect user privacy by avoiding third-party services

## Error Handling

The system handles:
- Large file downloads
- Network interruptions
- Missing or invalid data
- Format conversion errors
- Schedule calculation failures

User-friendly error messages guide users to resolve issues.

## Performance Considerations

For large datasets:
- Progress indicators show processing status
- Memory-efficient CSV generation
- Streaming download support
- Non-blocking UI operations

## Limitations

Current version limitations:
- Maximum recommended export size: 100,000 records
- CSV and JSON formats only
- Client-side processing only (no server batching)
- Scheduled exports stored in browser localStorage

## Future Enhancements

Planned improvements:
- PDF export format support
- Server-side scheduled export with email delivery
- Advanced filtering options
- Data aggregation and summary reports
- Excel file format with formatting
- Automatic backup scheduling
