# Analytics Dashboard

The Analytics Dashboard provides insights into platform performance, market statistics, and user activity.

## Features

### Platform Overview
- **Total Markets**: Count of all markets created on the platform
- **Total Volume**: Sum of all STX traded across markets
- **Total Predictions**: Number of predictions made by users
- **Fees Collected**: Protocol fees (2% of volume)

### Charts

#### Volume Trend (Area Chart)
Shows trading volume over the selected time period. Uses recharts AreaChart with gradient fill.

```tsx
import { VolumeChart } from './components/charts';

<VolumeChart 
  data={volumeHistory} 
  height={300} 
  showGrid={true}
  gradient={true}
/>
```

#### Category Distribution (Pie Chart)
Displays market distribution by category (Crypto, Sports, Politics, etc.).

```tsx
import { CategoryPieChart } from './components/charts';

<CategoryPieChart 
  data={categoryDistribution}
  height={300}
  showLegend={true}
/>
```

#### User Activity (Bar Chart)
Shows daily active users and transaction counts.

```tsx
import { ActivityChart } from './components/charts';

<ActivityChart 
  data={userActivity}
  height={300}
  showLegend={true}
/>
```

### Top Markets Table
Lists top markets ranked by pool size with Yes/No distribution bars.

```tsx
import { TopMarketsTable } from './components/TopMarketsTable';

<TopMarketsTable 
  markets={topMarkets}
  maxRows={10}
  showRank={true}
/>
```

### Personal Stats
When wallet is connected, shows:
- Net P&L (profit/loss)
- Total staked, winnings, losses
- Win rate with visual progress bar
- Pending positions count

## Hook Usage

```tsx
import { useAnalytics } from './hooks/useAnalytics';

function MyComponent() {
  const {
    platformStats,
    topMarkets,
    volumeHistory,
    categoryDistribution,
    userActivity,
    personalStats,
    isLoading,
    timeRange,
    setTimeRange,
    refresh,
  } = useAnalytics();
}
```

## Time Range Options
- `24h` - Last 24 hours
- `7d` - Last 7 days
- `30d` - Last 30 days (default)
- `90d` - Last 90 days
- `all` - All time

## Components

| Component | Description |
|-----------|-------------|
| `StatsCard` | Single statistic display with icon |
| `StatsGrid` | Grid layout for multiple stats |
| `VolumeChart` | Area chart for volume trends |
| `CategoryPieChart` | Donut chart for categories |
| `ActivityChart` | Bar chart for user activity |
| `MarketDistributionChart` | Stacked bars for Yes/No |
| `MarketBar` | Simple progress bar |
| `TopMarketsTable` | Table of top markets |
| `TopMarketCard` | Card variant for mobile |
| `TimeRangeSelector` | Button group for time range |
| `PersonalStatsCard` | User performance card |

## Data Sources

Currently uses:
- **On-chain data**: Market contracts via `useMarkets` hook
- **Derived metrics**: Calculated from market data
- **Mock data**: Volume history and user activity (placeholder)

Future enhancements:
- Historical data from Hiro API
- Real transaction history
- User-specific position tracking

## Styling

Charts use consistent color scheme defined in `types/analytics.ts`:

```typescript
export const CHART_COLORS = {
  primary: '#3B82F6',   // Blue
  secondary: '#10B981', // Green
  tertiary: '#F59E0B',  // Amber
  quaternary: '#EF4444', // Red
  purple: '#8B5CF6',
  pink: '#EC4899',
  cyan: '#06B6D4',
  gray: '#6B7280',
};
```
