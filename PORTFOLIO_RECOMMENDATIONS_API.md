# Portfolio Recommendations API Reference

Complete API reference for portfolio analysis and recommendation services.

## Services

### PortfolioAnalysisService

Service for comprehensive portfolio metric calculations.

#### analyzePortfolio(portfolio: Portfolio): PortfolioAnalysis

Perform comprehensive portfolio analysis.

**Parameters:**
- `portfolio` (Portfolio): Portfolio to analyze

**Returns:**
- `PortfolioAnalysis`: Complete portfolio analysis with metrics and insights

**Example:**
```typescript
const analysis = PortfolioAnalysisService.analyzePortfolio(portfolio);
console.log(analysis.totalValue);
console.log(analysis.riskMetrics.sharpeRatio);
```

#### calculateRiskMetrics(portfolio: Portfolio): RiskMetrics

Calculate risk metrics for portfolio.

**Parameters:**
- `portfolio` (Portfolio): Portfolio to analyze

**Returns:**
- `RiskMetrics`: Volatility, Sharpe ratio, beta, max drawdown, etc.

**Risk Metrics:**
- `volatility` (number): Annual volatility (0-1)
- `sharpeRatio` (number): Risk-adjusted return
- `maxDrawdown` (number): Maximum decline (-1 to 0)
- `beta` (number): Market sensitivity
- `concentration` (number): Portfolio concentration (0-1)
- `diversificationScore` (number): Diversification score (0-100)
- `riskLevel` (string): Risk classification (low/medium/high)

#### analyzeDiversification(portfolio: Portfolio): DiversificationAnalysis

Analyze portfolio diversification.

**Parameters:**
- `portfolio` (Portfolio): Portfolio to analyze

**Returns:**
- `DiversificationAnalysis`: Diversification metrics and analysis

**Diversification Analysis Fields:**
- `herfindahlIndex` (number): Herfindahl concentration measure
- `diversificationScore` (number): 0-100 score
- `concentrationRisk` (string): Risk level
- `largestPosition` (number): Largest position weight
- `topThreePositions` (number): Sum of top 3 position weights
- `recommendations` (string[]): Diversification suggestions

#### generateHistoricalPerformance(portfolio: Portfolio, period: string): PerformanceData[]

Generate historical performance data.

**Parameters:**
- `portfolio` (Portfolio): Portfolio to analyze
- `period` (string): Period ('1w', '1m', '3m', '6m', '1y')

**Returns:**
- `PerformanceData[]`: Array of historical performance points

**PerformanceData Fields:**
- `date` (Date): Data point date
- `value` (number): Portfolio value
- `return` (number): Daily return
- `cumulativeReturn` (number): Cumulative return from start
- `drawdown` (number): Current drawdown

#### calculateVolatility(positions: PortfolioPosition[]): number

Calculate portfolio volatility.

**Parameters:**
- `positions` (PortfolioPosition[]): Portfolio positions

**Returns:**
- `number`: Annual volatility (0-1)

#### calculateSharpeRatio(positions: PortfolioPosition[], riskFreeRate?: number): number

Calculate Sharpe ratio.

**Parameters:**
- `positions` (PortfolioPosition[]): Portfolio positions
- `riskFreeRate` (number, optional): Risk-free rate (default: 0.02)

**Returns:**
- `number`: Sharpe ratio

#### calculateBeta(positions: PortfolioPosition[]): number

Calculate portfolio beta.

**Parameters:**
- `positions` (PortfolioPosition[]): Portfolio positions

**Returns:**
- `number`: Beta coefficient

#### calculateDiversificationScore(positions: PortfolioPosition[]): number

Calculate diversification score.

**Parameters:**
- `positions` (PortfolioPosition[]): Portfolio positions

**Returns:**
- `number`: Diversification score (0-100)

#### calculateConcentration(positions: PortfolioPosition[]): number

Calculate concentration risk.

**Parameters:**
- `positions` (PortfolioPosition[]): Portfolio positions

**Returns:**
- `number`: Concentration measure (0-1)

#### calculateMaxDrawdown(positions: PortfolioPosition[]): number

Calculate maximum drawdown.

**Parameters:**
- `positions` (PortfolioPosition[]): Portfolio positions

**Returns:**
- `number`: Maximum drawdown (-1 to 0)

---

### RecommendationEngineService

Service for generating portfolio recommendations.

#### generateRecommendations(portfolio: Portfolio): PortfolioRecommendation[]

Generate all recommendations.

**Parameters:**
- `portfolio` (Portfolio): Portfolio to analyze

**Returns:**
- `PortfolioRecommendation[]`: Array of recommendations

**Recommendation Fields:**
- `id` (string): Unique recommendation ID
- `type` (string): Type (rebalancing/diversification/risk_management/opportunity)
- `title` (string): Recommendation title
- `description` (string): Full description
- `actionItems` (RebalancingRecommendation[]): Specific actions
- `expectedBenefit` (string): Expected benefit description
- `priority` (string): Priority (high/medium/low)
- `confidenceScore` (number): Confidence 0-1
- `expiresAt` (Date): When recommendation expires

#### generateRebalancingRecommendations(portfolio: Portfolio): PortfolioRecommendation

Generate rebalancing recommendations.

**Parameters:**
- `portfolio` (Portfolio): Portfolio to analyze

**Returns:**
- `PortfolioRecommendation`: Rebalancing recommendations

**Logic:**
Suggests rebalancing when position weight deviates > 10% from equal weight target.

#### generateDiversificationRecommendations(portfolio: Portfolio): PortfolioRecommendation

Generate diversification recommendations.

**Parameters:**
- `portfolio` (Portfolio): Portfolio to analyze

**Returns:**
- `PortfolioRecommendation`: Diversification recommendations

**Logic:**
Flags concentration risk when top 3 positions > 60% of portfolio.

#### generateRiskManagementRecommendations(portfolio: Portfolio): PortfolioRecommendation

Generate risk management recommendations.

**Parameters:**
- `portfolio` (Portfolio): Portfolio to analyze

**Returns:**
- `PortfolioRecommendation`: Risk management recommendations

**Logic:**
Suggests reducing positions with > -10% loss and high volatility.

#### generateOpportunityRecommendations(portfolio: Portfolio): PortfolioRecommendation

Generate opportunity recommendations.

**Parameters:**
- `portfolio` (Portfolio): Portfolio to analyze

**Returns:**
- `PortfolioRecommendation`: Opportunity recommendations

**Logic:**
Suggests increasing positions with > 15% positive return and momentum.

#### optimizePortfolio(portfolio: Portfolio): OptimizationResult

Perform full portfolio optimization.

**Parameters:**
- `portfolio` (Portfolio): Portfolio to optimize

**Returns:**
- `OptimizationResult`: Optimization results and suggested trades

**OptimizationResult Fields:**
- `suggestedAllocations` (number[]): Target position allocations
- `trades` (Trade[]): Suggested trades
- `expectedReturn` (number): Expected return with new allocation
- `expectedRisk` (number): Expected risk with new allocation
- `expectedImprovement` (number): Expected Sharpe ratio improvement
- `totalTransactionCost` (number): Estimated transaction costs

#### getRiskLevel(volatility: number): string

Get risk level classification.

**Parameters:**
- `volatility` (number): Annual volatility

**Returns:**
- `string`: Risk level (low/medium/high)

#### getConfidenceScore(data: any, metricsCount: number): number

Calculate confidence score.

**Parameters:**
- `data` (any): Analysis data
- `metricsCount` (number): Number of metrics

**Returns:**
- `number`: Confidence score (0-1)

---

### PerformanceComparisonService

Service for benchmark comparison and performance analysis.

#### compareWithBenchmark(portfolio: Portfolio, benchmark: BenchmarkType): BenchmarkComparison

Compare portfolio with benchmark.

**Parameters:**
- `portfolio` (Portfolio): Portfolio to analyze
- `benchmark` (BenchmarkType): Benchmark type (SP500, NASDAQ, etc.)

**Returns:**
- `BenchmarkComparison`: Comparison results

**BenchmarkComparison Fields:**
- `portfolio` (PerformanceMetrics): Portfolio metrics
- `benchmark` (PerformanceMetrics): Benchmark metrics
- `alpha` (number): Excess return vs benchmark
- `beta` (number): Sensitivity to benchmark
- `correlation` (number): Correlation with benchmark
- `tracking_error` (number): Deviation from benchmark
- `information_ratio` (number): Return per unit of tracking error
- `out_performance` (number): Percentage outperformance

#### calculateAlpha(portfolioReturn: number, benchmarkReturn: number, beta: number): number

Calculate alpha.

**Parameters:**
- `portfolioReturn` (number): Portfolio return
- `benchmarkReturn` (number): Benchmark return
- `beta` (number): Portfolio beta

**Returns:**
- `number`: Alpha value

#### calculateSharpeRatio(returns: number[], riskFreeRate?: number): number

Calculate Sharpe ratio.

**Parameters:**
- `returns` (number[]): Array of period returns
- `riskFreeRate` (number, optional): Risk-free rate (default: 0.02)

**Returns:**
- `number`: Sharpe ratio

#### calculateSortinoRatio(returns: number[], riskFreeRate?: number): number

Calculate Sortino ratio (downside risk adjusted).

**Parameters:**
- `returns` (number[]): Array of period returns
- `riskFreeRate` (number, optional): Risk-free rate (default: 0.02)

**Returns:**
- `number`: Sortino ratio

#### generatePerformanceMetrics(dailyReturns: number[], benchmarkReturns: number[]): PerformanceMetrics

Generate comprehensive performance metrics.

**Parameters:**
- `dailyReturns` (number[]): Array of daily returns
- `benchmarkReturns` (number[]): Array of benchmark returns

**Returns:**
- `PerformanceMetrics`: Complete metrics

**PerformanceMetrics Fields:**
- `totalReturn` (number): Total return
- `averageReturn` (number): Average return
- `volatility` (number): Volatility
- `sharpeRatio` (number): Sharpe ratio
- `sortinoRatio` (number): Sortino ratio
- `maxDrawdown` (number): Maximum drawdown
- `winRate` (number): Win rate (0-1)
- `consecutiveWins` (number): Max consecutive wins
- `consecutiveLosses` (number): Max consecutive losses

#### calculateMaxDrawdown(returns: number[]): number

Calculate maximum drawdown.

**Parameters:**
- `returns` (number[]): Array of returns

**Returns:**
- `number`: Maximum drawdown

#### calculateCumulativeReturn(dailyReturns: number[]): number

Calculate cumulative return.

**Parameters:**
- `dailyReturns` (number[]): Array of daily returns

**Returns:**
- `number`: Cumulative return

---

## React Hooks

### usePortfolioAnalysis(userId: string)

Hook for portfolio analysis state management.

**Returns:**
```typescript
{
  portfolio: Portfolio;
  metrics: PortfolioAnalysis;
  loading: boolean;
  error: Error | null;
  analyzePortfolio: (portfolio: Portfolio) => Promise<void>;
  updateMetrics: (metrics: PortfolioAnalysis) => void;
  calculateRiskMetrics: () => Promise<RiskMetrics>;
  calculateDiversification: () => Promise<DiversificationAnalysis>;
  calculateHistoricalPerformance: (period: string) => Promise<PerformanceData[]>;
}
```

### usePortfolioRecommendations(userId: string)

Hook for recommendation management.

**Returns:**
```typescript
{
  recommendations: PortfolioRecommendation[];
  loading: boolean;
  error: Error | null;
  generateRecommendations: (portfolio: Portfolio) => Promise<void>;
  acceptRecommendation: (id: string) => Promise<void>;
  rejectRecommendation: (id: string) => Promise<void>;
  snoozeRecommendation: (id: string, days: number) => Promise<void>;
  refreshRecommendations: () => Promise<void>;
}
```

### usePortfolioOptimization(userId: string)

Hook for portfolio optimization.

**Returns:**
```typescript
{
  optimizationResult: OptimizationResult | null;
  loading: boolean;
  error: Error | null;
  optimizePortfolio: (portfolio: Portfolio) => Promise<OptimizationResult>;
  applyOptimization: (result: OptimizationResult) => Promise<void>;
}
```

### usePerformanceComparison(userId: string)

Hook for performance comparison.

**Returns:**
```typescript
{
  comparison: BenchmarkComparison | null;
  loading: boolean;
  error: Error | null;
  compareWithBenchmark: (portfolio: Portfolio, benchmark: string) => Promise<void>;
  getPerformanceMetrics: (period: string) => Promise<PerformanceMetrics>;
}
```

### usePortfolioRecommendationResponse(userId: string)

Hook for comprehensive recommendation response.

**Returns:**
```typescript
{
  response: PortfolioRecommendationResponse | null;
  loading: boolean;
  error: Error | null;
  generateFullResponse: (portfolio: Portfolio) => Promise<void>;
  refresh: () => Promise<void>;
}
```

---

## Utility Functions

See `portfolioHelpers.ts` for 45+ utility functions:

- `formatCurrency(amount)` - Format as currency
- `formatPercentage(value)` - Format as percentage
- `calculateWeights(positions)` - Calculate position weights
- `calculateExpectedPortfolioReturn(positions)` - Expected return
- `findLargestPosition(positions)` - Find largest position
- `findBestPerformer(positions)` - Find best performer
- `getRiskLevel(volatility)` - Get risk classification
- `calculateStopLossPrice(entryPrice, percentage)` - Stop loss price
- And 37+ more utility functions...

---

## Constants

All configuration in `portfolioConstants.ts`:

```typescript
PORTFOLIO_CONSTANTS = {
  DEFAULT_RISK_FREE_RATE: 0.02,
  DEFAULT_LEVERAGE_RATIO: 2,
  DEFAULT_REBALANCE_THRESHOLD: 0.1,
  DEFAULT_TRANSACTION_FEE: 0.001,
  // ... 10+ more
}

RISK_LEVELS = {
  VERY_LOW: 'very_low',
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  VERY_HIGH: 'very_high',
}
```

---

## Error Handling

All methods include proper error handling:

```typescript
try {
  const metrics = await analyzePortfolio(portfolio);
} catch (error) {
  console.error('Portfolio analysis failed:', error.message);
}
```

---

## Type Definitions

All types defined in `frontend/src/types/portfolio.ts`:

- `Portfolio`
- `PortfolioPosition`
- `RiskMetrics`
- `PortfolioRecommendation`
- `OptimizationResult`
- `BenchmarkComparison`
- `PerformanceMetrics`
- `DiversificationAnalysis`
- `PortfolioAnalysis`
- And 6+ more types...

---

**Version**: 1.0.0  
**Last Updated**: Current  
**Status**: Production Ready
