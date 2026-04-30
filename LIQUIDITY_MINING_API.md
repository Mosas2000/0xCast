# Liquidity Mining API Reference

## Calculator Functions

### calculateDailyReward

Calculates daily reward based on liquidity share and volume.

```typescript
function calculateDailyReward(
  liquidityAmount: number,
  totalLiquidity: number,
  dailyVolume: number
): number
```

**Parameters:**
- `liquidityAmount` - User's liquidity amount
- `totalLiquidity` - Total pool liquidity
- `dailyVolume` - Daily trading volume

**Returns:** Daily reward amount

**Example:**
```typescript
const daily = calculateDailyReward(1000, 10000, 50000);
// Returns: 15
```

---

### calculateAPY

Calculates Annual Percentage Yield.

```typescript
function calculateAPY(
  liquidityAmount: number,
  totalLiquidity: number,
  dailyVolume: number
): number
```

**Parameters:**
- `liquidityAmount` - User's liquidity amount
- `totalLiquidity` - Total pool liquidity
- `dailyVolume` - Daily trading volume

**Returns:** APY percentage

**Example:**
```typescript
const apy = calculateAPY(1000, 10000, 50000);
// Returns: 547.5
```

---

### calculateRewardProjection

Calculates reward projections for multiple time periods.

```typescript
function calculateRewardProjection(
  liquidityAmount: number,
  totalLiquidity: number,
  dailyVolume: number
): RewardCalculation
```

**Parameters:**
- `liquidityAmount` - User's liquidity amount
- `totalLiquidity` - Total pool liquidity
- `dailyVolume` - Daily trading volume

**Returns:** RewardCalculation object

```typescript
interface RewardCalculation {
  dailyReward: number;
  weeklyReward: number;
  monthlyReward: number;
  yearlyReward: number;
  apy: number;
  estimatedValue: number;
}
```

**Example:**
```typescript
const projection = calculateRewardProjection(1000, 10000, 50000);
// Returns: {
//   dailyReward: 15,
//   weeklyReward: 105,
//   monthlyReward: 450,
//   yearlyReward: 5475,
//   apy: 547.5,
//   estimatedValue: 6475
// }
```

---

### calculateHistoricalAPY

Calculates APY based on historical rewards.

```typescript
function calculateHistoricalAPY(
  historicalRewards: HistoricalReward[],
  liquidityAmount: number,
  periodDays: number
): number
```

**Parameters:**
- `historicalRewards` - Array of historical rewards
- `liquidityAmount` - User's liquidity amount
- `periodDays` - Number of days to analyze

**Returns:** Historical APY percentage

---

### estimateRewardsByVolume

Estimates rewards based on different volume periods.

```typescript
function estimateRewardsByVolume(
  liquidityAmount: number,
  totalLiquidity: number,
  volume: MarketVolume
): {
  based24h: RewardCalculation;
  based7d: RewardCalculation;
  based30d: RewardCalculation;
}
```

**Parameters:**
- `liquidityAmount` - User's liquidity amount
- `totalLiquidity` - Total pool liquidity
- `volume` - Market volume data

**Returns:** Reward estimates for different periods

---

### calculateOptimalLiquidityAmount

Calculates optimal liquidity amount for target APY.

```typescript
function calculateOptimalLiquidityAmount(
  targetAPY: number,
  totalLiquidity: number,
  dailyVolume: number
): number
```

**Parameters:**
- `targetAPY` - Target APY percentage
- `totalLiquidity` - Total pool liquidity
- `dailyVolume` - Daily trading volume

**Returns:** Optimal liquidity amount

---

### calculateImpermanentLoss

Calculates impermanent loss percentage.

```typescript
function calculateImpermanentLoss(
  initialPrice: number,
  currentPrice: number
): number
```

**Parameters:**
- `initialPrice` - Initial asset price
- `currentPrice` - Current asset price

**Returns:** Impermanent loss percentage

---

### calculateNetReturn

Calculates net return including impermanent loss.

```typescript
function calculateNetReturn(
  liquidityAmount: number,
  totalLiquidity: number,
  dailyVolume: number,
  initialPrice: number,
  currentPrice: number,
  daysHeld: number
): number
```

**Parameters:**
- `liquidityAmount` - User's liquidity amount
- `totalLiquidity` - Total pool liquidity
- `dailyVolume` - Daily trading volume
- `initialPrice` - Initial asset price
- `currentPrice` - Current asset price
- `daysHeld` - Days liquidity was held

**Returns:** Net return amount

---

## Formatting Functions

### formatRewardAmount

Formats reward amount with appropriate suffix.

```typescript
function formatRewardAmount(amount: number): string
```

**Examples:**
```typescript
formatRewardAmount(1500000);  // "1.50M"
formatRewardAmount(1500);     // "1.50K"
formatRewardAmount(123.456);  // "123.46"
formatRewardAmount(0.123456); // "0.123456"
```

---

### formatAPY

Formats APY percentage with appropriate suffix.

```typescript
function formatAPY(apy: number): string
```

**Examples:**
```typescript
formatAPY(1500);   // "1.50K%"
formatAPY(150);    // "150%"
formatAPY(15.5);   // "15.50%"
formatAPY(0.1234); // "0.1234%"
```

---

## Service Methods

### LiquidityRewardsService

#### addPosition

Adds a liquidity position.

```typescript
addPosition(position: LiquidityPosition): void
```

**Parameters:**
```typescript
interface LiquidityPosition {
  amount: number;
  marketId: number;
  timestamp: number;
  userAddress: string;
}
```

---

#### getPositions

Gets all positions for a user.

```typescript
getPositions(userAddress: string): LiquidityPosition[]
```

---

#### getPositionsByMarket

Gets positions for a specific market.

```typescript
getPositionsByMarket(
  userAddress: string,
  marketId: number
): LiquidityPosition[]
```

---

#### getTotalLiquidity

Gets total liquidity for a user.

```typescript
getTotalLiquidity(userAddress: string): number
```

---

#### addReward

Adds a reward entry.

```typescript
addReward(reward: HistoricalReward): void
```

**Parameters:**
```typescript
interface HistoricalReward {
  timestamp: number;
  amount: number;
  marketId: number;
  userAddress: string;
}
```

---

#### getRewards

Gets all rewards for a user.

```typescript
getRewards(userAddress: string): HistoricalReward[]
```

---

#### getRewardsByMarket

Gets rewards for a specific market.

```typescript
getRewardsByMarket(
  userAddress: string,
  marketId: number
): HistoricalReward[]
```

---

#### getRewardsByTimeRange

Gets rewards within a time range.

```typescript
getRewardsByTimeRange(
  userAddress: string,
  startTime: number,
  endTime: number
): HistoricalReward[]
```

---

#### getTotalRewards

Gets total rewards for a user.

```typescript
getTotalRewards(userAddress: string): number
```

---

#### updateMarketVolume

Updates market volume data.

```typescript
updateMarketVolume(marketId: number, volume: MarketVolume): void
```

**Parameters:**
```typescript
interface MarketVolume {
  marketId: number;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  totalVolume: number;
}
```

---

#### getMarketVolume

Gets volume data for a market.

```typescript
getMarketVolume(marketId: number): MarketVolume | undefined
```

---

#### getAllMarketVolumes

Gets all market volumes.

```typescript
getAllMarketVolumes(): MarketVolume[]
```

---

#### getRewardHistory

Gets daily aggregated reward history.

```typescript
getRewardHistory(
  userAddress: string,
  days: number
): { date: string; amount: number }[]
```

---

#### clearUserData

Clears all data for a user.

```typescript
clearUserData(userAddress: string): void
```

---

#### clearAllData

Clears all stored data.

```typescript
clearAllData(): void
```

---

## React Hook

### useLiquidityRewards

React hook for liquidity rewards functionality.

```typescript
function useLiquidityRewards(
  marketId?: number
): UseLiquidityRewardsReturn
```

**Returns:**
```typescript
interface UseLiquidityRewardsReturn {
  calculateRewards: (
    liquidityAmount: number,
    totalLiquidity: number,
    dailyVolume: number
  ) => RewardCalculation;
  
  calculateAPYEstimate: (
    liquidityAmount: number,
    totalLiquidity: number,
    dailyVolume: number
  ) => number;
  
  getHistoricalRewards: () => { date: string; amount: number }[];
  
  getTotalRewards: () => number;
  
  getHistoricalAPY: (periodDays: number) => number;
  
  estimateByVolume: (
    liquidityAmount: number,
    totalLiquidity: number,
    volume: MarketVolume
  ) => {
    based24h: RewardCalculation;
    based7d: RewardCalculation;
    based30d: RewardCalculation;
  };
  
  isLoading: boolean;
  error: string | null;
}
```

**Example:**
```typescript
function MyComponent() {
  const {
    calculateRewards,
    calculateAPYEstimate,
    getHistoricalRewards,
  } = useLiquidityRewards(1);

  const rewards = calculateRewards(1000, 10000, 50000);
  const apy = calculateAPYEstimate(1000, 10000, 50000);
  const history = getHistoricalRewards();

  return <div>APY: {apy}%</div>;
}
```

---

## Components

### LiquidityRewardsCalculator

Main calculator component.

```typescript
interface LiquidityRewardsCalculatorProps {
  marketId?: number;
  totalLiquidity: number;
  dailyVolume: number;
  onCalculate?: (apy: number) => void;
}
```

---

### RewardHistoryChart

Historical rewards chart component.

```typescript
interface RewardHistoryChartProps {
  marketId?: number;
}
```

---

### APYComparison

APY comparison component.

```typescript
interface APYComparisonProps {
  liquidityAmount: number;
  totalLiquidity: number;
  volume: MarketVolume;
  marketId?: number;
}
```

---

### RewardNotification

Reward notification component.

```typescript
interface RewardNotificationProps {
  amount: number;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}
```

---

### LiquidityMiningPage

Complete liquidity mining page.

```typescript
interface LiquidityMiningPageProps {
  marketId?: number;
  totalLiquidity: number;
  dailyVolume: number;
  volume: MarketVolume;
}
```

---

## Constants

```typescript
const REWARD_RATE_BASE = 0.003;        // 0.3% fee rate
const SECONDS_PER_DAY = 86400;         // Seconds in a day
const DAYS_PER_YEAR = 365;             // Days in a year
```

---

## Type Definitions

```typescript
interface LiquidityPosition {
  amount: number;
  marketId: number;
  timestamp: number;
  userAddress: string;
}

interface RewardCalculation {
  dailyReward: number;
  weeklyReward: number;
  monthlyReward: number;
  yearlyReward: number;
  apy: number;
  estimatedValue: number;
}

interface HistoricalReward {
  timestamp: number;
  amount: number;
  marketId: number;
  userAddress: string;
}

interface MarketVolume {
  marketId: number;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  totalVolume: number;
}
```
