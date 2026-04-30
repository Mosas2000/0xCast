# Liquidity Mining Rewards Calculator Guide

## Overview

The Liquidity Mining Rewards Calculator provides users with tools to calculate potential rewards, track historical performance, and make informed decisions about liquidity provision.

## Features

### 1. Rewards Calculator

Calculate potential rewards based on liquidity amount and market conditions.

**Features:**
- Real-time APY calculation
- Daily, weekly, monthly, and yearly reward projections
- Estimated value after 1 year
- Adjustable liquidity amount input

**Usage:**
```typescript
import { LiquidityRewardsCalculator } from './components/LiquidityRewardsCalculator';

<LiquidityRewardsCalculator
  marketId={1}
  totalLiquidity={100000}
  dailyVolume={50000}
  onCalculate={(apy) => console.log('APY:', apy)}
/>
```

### 2. Reward History Chart

Visual representation of historical rewards earned.

**Features:**
- 30-day reward history
- Daily aggregated rewards
- Total earned display
- Average daily rewards
- Best day highlight

**Usage:**
```typescript
import { RewardHistoryChart } from './components/RewardHistoryChart';

<RewardHistoryChart marketId={1} />
```

### 3. APY Comparison

Compare APY estimates based on different volume periods.

**Features:**
- 24-hour volume APY
- 7-day average APY
- 30-day average APY
- Historical APY (7d and 30d)
- Visual comparison bars

**Usage:**
```typescript
import { APYComparison } from './components/APYComparison';

<APYComparison
  liquidityAmount={1000}
  totalLiquidity={100000}
  volume={volumeData}
  marketId={1}
/>
```

### 4. Reward Notifications

Real-time notifications when rewards are earned.

**Features:**
- Auto-hide after 5 seconds
- Manual dismiss option
- Multiple notification support
- Animated entrance

**Usage:**
```typescript
import { emitRewardNotification } from './components/RewardNotification';

emitRewardNotification(10.5);
```

## Calculation Methods

### Daily Reward Calculation

```
Daily Reward = (User Liquidity / Total Liquidity) × Daily Volume × Fee Rate
```

Where:
- Fee Rate = 0.3% (0.003)
- User Liquidity = Amount provided by user
- Total Liquidity = Total pool liquidity
- Daily Volume = Trading volume per day

### APY Calculation

```
APY = (Yearly Reward / Liquidity Amount) × 100
```

Where:
- Yearly Reward = Daily Reward × 365

### Impermanent Loss

```
IL = |2 × √(Price Ratio) / (1 + Price Ratio) - 1| × 100
```

Where:
- Price Ratio = Current Price / Initial Price

### Net Return

```
Net Return = Total Rewards - Impermanent Loss Amount
```

## API Reference

### useLiquidityRewards Hook

```typescript
const {
  calculateRewards,
  calculateAPYEstimate,
  getHistoricalRewards,
  getTotalRewards,
  getHistoricalAPY,
  estimateByVolume,
  isLoading,
  error,
} = useLiquidityRewards(marketId);
```

**Methods:**

- `calculateRewards(amount, totalLiquidity, dailyVolume)` - Calculate reward projections
- `calculateAPYEstimate(amount, totalLiquidity, dailyVolume)` - Calculate APY
- `getHistoricalRewards()` - Get 30-day reward history
- `getTotalRewards()` - Get total rewards earned
- `getHistoricalAPY(periodDays)` - Calculate historical APY
- `estimateByVolume(amount, totalLiquidity, volume)` - Estimate by different volume periods

### LiquidityRewardsService

```typescript
import { liquidityRewardsService } from './services/LiquidityRewardsService';

liquidityRewardsService.addPosition(position);
liquidityRewardsService.addReward(reward);
liquidityRewardsService.updateMarketVolume(marketId, volume);
```

**Methods:**

- `addPosition(position)` - Add liquidity position
- `getPositions(userAddress)` - Get user positions
- `addReward(reward)` - Add reward entry
- `getRewards(userAddress)` - Get user rewards
- `updateMarketVolume(marketId, volume)` - Update market volume data
- `getRewardHistory(userAddress, days)` - Get reward history

## Mobile Responsiveness

The calculator is fully responsive across all device sizes:

- **Mobile (< 640px)**: Single column layout
- **Tablet (641px - 1024px)**: Two column grid
- **Desktop (> 1024px)**: Three column grid

Responsive features:
- Touch-friendly inputs
- Scrollable tabs
- Optimized chart heights
- Readable font sizes

## Testing

Run tests:
```bash
npm test
```

Test files:
- `liquidityRewardsCalculator.test.ts` - Calculator utility tests
- `LiquidityRewardsService.test.ts` - Service tests

## Best Practices

1. **Regular Updates**: Update market volume data regularly for accurate estimates
2. **Historical Data**: Track rewards over time for better APY calculations
3. **Multiple Periods**: Compare APY across different time periods
4. **Impermanent Loss**: Consider impermanent loss when evaluating returns
5. **Risk Assessment**: Higher APY may indicate higher risk

## Example Integration

```typescript
import { LiquidityMiningPage } from './components/LiquidityMiningPage';

function App() {
  const volume: MarketVolume = {
    marketId: 1,
    volume24h: 50000,
    volume7d: 300000,
    volume30d: 1200000,
    totalVolume: 5000000,
  };

  return (
    <LiquidityMiningPage
      marketId={1}
      totalLiquidity={100000}
      dailyVolume={50000}
      volume={volume}
    />
  );
}
```

## Troubleshooting

### Calculator shows 0% APY
- Check that totalLiquidity > 0
- Verify dailyVolume > 0
- Ensure liquidityAmount > 0

### No historical data displayed
- Add reward entries using liquidityRewardsService
- Check that user has connected wallet
- Verify rewards are within 30-day window

### Notifications not appearing
- Ensure RewardNotificationManager is mounted
- Check that emitRewardNotification is called correctly
- Verify no console errors

## Future Enhancements

- Real-time volume data integration
- Advanced charting with zoom
- Export reward history
- Tax reporting tools
- Multi-market comparison
- Reward forecasting with ML
