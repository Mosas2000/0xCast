# Portfolio Rebalancing Recommendations System

Comprehensive AI-powered portfolio analysis and rebalancing recommendation system for 0xCast.

## Overview

The portfolio rebalancing system analyzes user portfolios, calculates risk metrics, and provides actionable recommendations for portfolio optimization, diversification, and risk management.

## Architecture

### Services

#### PortfolioAnalysisService
Core service for portfolio metric calculations and analysis.

**Key Methods:**
- `analyzePortfolio(portfolio)` - Comprehensive portfolio analysis
- `calculateRiskMetrics(portfolio)` - Calculate volatility, Sharpe ratio, beta, etc.
- `analyzeDiversification(portfolio)` - Analyze portfolio diversification
- `generateHistoricalPerformance(portfolio, period)` - Historical performance data
- `calculateDiversificationScore(positions)` - Diversification score 0-100
- `calculateConcentration(positions)` - Calculate concentration risk
- `calculateMaxDrawdown(positions)` - Calculate maximum drawdown

**Output:**
- Comprehensive portfolio metrics
- Risk assessment
- Diversification analysis
- Historical performance data

#### RecommendationEngineService
Engine for generating portfolio recommendations.

**Key Methods:**
- `generateRecommendations(portfolio)` - Generate all recommendations
- `generateRebalancingRecommendations(portfolio)` - Weight rebalancing
- `generateDiversificationRecommendations(portfolio)` - Diversification suggestions
- `generateRiskManagementRecommendations(portfolio)` - Risk mitigation
- `generateOpportunityRecommendations(portfolio)` - Growth opportunities
- `optimizePortfolio(portfolio)` - Full portfolio optimization

**Recommendation Types:**
- **Rebalancing**: Adjust position weights to target allocation
- **Diversification**: Reduce concentration and add new positions
- **Risk Management**: Mitigate high-risk positions and losses
- **Opportunity**: Increase winning positions with momentum

#### PerformanceComparisonService
Service for comparing portfolio performance against benchmarks.

**Key Methods:**
- `compareWithBenchmark(return, benchmark)` - Compare with benchmark
- `calculateAlpha(portfolioReturn, benchmarkReturn, beta)` - Calculate alpha
- `calculateSharpeRatio(returns)` - Sharpe ratio calculation
- `calculateSortinoRatio(returns)` - Downside-adjusted return
- `generatePerformanceMetrics(dailyReturns, benchmarkReturns)` - Full metrics
- `calculateMaxDrawdown(returns)` - Maximum drawdown
- `calculateCumulativeReturn(dailyReturns)` - Cumulative return

**Features:**
- Multiple benchmark comparisons
- Risk-adjusted performance metrics
- Drawdown analysis
- Win rate calculations
- Consecutive win/loss tracking

### React Hooks

#### usePortfolioAnalysis
Hook for portfolio analysis state management.

```typescript
const {
  portfolio,
  metrics,
  loading,
  error,
  analyzePortfolio,
  updateMetrics,
  calculateRiskMetrics,
  calculateDiversification,
  calculateHistoricalPerformance,
} = usePortfolioAnalysis(userId);
```

#### usePortfolioRecommendations
Hook for managing recommendations.

```typescript
const {
  recommendations,
  loading,
  error,
  generateRecommendations,
  acceptRecommendation,
  rejectRecommendation,
  snoozeRecommendation,
  refreshRecommendations,
} = usePortfolioRecommendations(userId);
```

#### usePortfolioOptimization
Hook for portfolio optimization.

```typescript
const {
  optimizationResult,
  loading,
  error,
  optimizePortfolio,
  applyOptimization,
} = usePortfolioOptimization(userId);
```

#### usePerformanceComparison
Hook for performance comparison.

```typescript
const {
  comparison,
  loading,
  error,
  compareWithBenchmark,
  getPerformanceMetrics,
} = usePerformanceComparison(userId);
```

#### usePortfolioRecommendationResponse
Hook for comprehensive recommendation response.

```typescript
const {
  response,
  loading,
  error,
  generateFullResponse,
  refresh,
} = usePortfolioRecommendationResponse(userId);
```

### Utilities

#### PortfolioHelpers
Collection of utility functions for portfolio calculations.

**Formatting:**
- `formatCurrency(amount)` - Format as currency
- `formatPercentage(value)` - Format as percentage

**Calculations:**
- `calculateWeights(positions, totalValue)` - Position weights
- `calculateAllocationPercentage(value, total)` - Allocation percentage
- `calculatePortfolioTurnover(old, new, totalValue)` - Portfolio turnover
- `calculateTransactionCost(amount, feePercentage)` - Transaction cost
- `calculateExpectedPortfolioReturn(positions)` - Expected return

**Position Analysis:**
- `findLargestPosition(positions)` - Largest position
- `findSmallestPosition(positions)` - Smallest position
- `findBestPerformer(positions)` - Best performing position
- `findWorstPerformer(positions)` - Worst performing position
- `isPositionUnderwater(position)` - Check if underwater
- `isPositionOverweight(weight, target, threshold)` - Check overweight
- `isPositionUnderweight(weight, target, threshold)` - Check underweight

**Risk Management:**
- `calculateStopLossPrice(entryPrice, percentage)` - Stop loss price
- `calculateTakeProfitPrice(entryPrice, percentage)` - Take profit price
- `estimateBuyingPower(totalValue, cash, leverage)` - Available buying power
- `getRiskLevel(volatility)` - Risk level classification
- `getPositionRating(pnl)` - Position rating

**Sorting & Grouping:**
- `sortPositionsByValue(positions)` - Sort by value
- `sortPositionsByReturn(positions)` - Sort by return
- `groupPositionsByMarket(positions)` - Group by market

## Type Definitions

### Portfolio
```typescript
interface Portfolio {
  userId: string;
  totalValue: number;
  positions: PortfolioPosition[];
  cash: number;
  lastUpdated: Date;
  createdAt: Date;
}
```

### PortfolioPosition
```typescript
interface PortfolioPosition {
  marketId: string;
  marketName: string;
  outcome: string;
  quantity: number;
  currentPrice: number;
  entryPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
  weight: number;
}
```

### RiskMetrics
```typescript
interface RiskMetrics {
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  beta: number;
  concentration: number;
  diversificationScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}
```

### PortfolioRecommendation
```typescript
interface PortfolioRecommendation {
  id: string;
  type: 'rebalancing' | 'diversification' | 'risk_management' | 'opportunity';
  title: string;
  description: string;
  actionItems: RebalancingRecommendation[];
  expectedBenefit: string;
  priority: 'high' | 'medium' | 'low';
  confidenceScore: number;
  expiresAt: Date;
}
```

## Features

### Portfolio Analysis
- Total value and composition analysis
- Position-level profitability tracking
- Asset weight calculations
- Performance attribution

### Risk Metrics
- Volatility calculation
- Sharpe ratio (risk-adjusted return)
- Maximum drawdown analysis
- Beta calculation (market sensitivity)
- Concentration risk assessment
- Diversification scoring

### Recommendations
- **Rebalancing**: Suggest trades to align with target weights
- **Diversification**: Identify concentration risks and suggest diversification
- **Risk Management**: Flag high-risk positions and suggest risk mitigation
- **Opportunities**: Identify and amplify winning positions

### Performance Analysis
- Historical return tracking
- Benchmark comparison
- Alpha generation
- Sortino ratio (downside risk adjustment)
- Win rate and consecutive win/loss tracking
- Drawdown analysis

### Optimization
- Full portfolio optimization based on risk-return profile
- Trade recommendations with expected impact
- Transaction cost estimation
- Expected improvement metrics

## Usage Examples

### Basic Portfolio Analysis

```typescript
import { usePortfolioAnalysis } from '@/hooks/usePortfolioAnalysis';

function PortfolioDashboard({ userId }) {
  const { metrics, analyzePortfolio, loading } = usePortfolioAnalysis(userId);

  useEffect(() => {
    analyzePortfolio(portfolio);
  }, [portfolio]);

  return (
    <div>
      <h2>Portfolio Value: {metrics?.totalValue}</h2>
      <p>Risk Level: {metrics?.riskMetrics.riskLevel}</p>
      <p>Diversification: {metrics?.diversificationScore}</p>
    </div>
  );
}
```

### Getting Recommendations

```typescript
import { usePortfolioRecommendations } from '@/hooks/usePortfolioAnalysis';

function RecommendationPanel({ userId, portfolio }) {
  const { recommendations, generateRecommendations } = usePortfolioRecommendations(userId);

  useEffect(() => {
    generateRecommendations(portfolio);
  }, [portfolio]);

  return (
    <div>
      {recommendations.map((rec) => (
        <RecommendationCard key={rec.id} recommendation={rec} />
      ))}
    </div>
  );
}
```

### Portfolio Optimization

```typescript
import { usePortfolioOptimization } from '@/hooks/usePortfolioAnalysis';

function OptimizationView({ userId, portfolio }) {
  const { optimizationResult, optimizePortfolio } = usePortfolioOptimization(userId);

  const handleOptimize = async () => {
    const result = await optimizePortfolio(portfolio);
    console.log('Expected return:', result.expectedReturn);
    console.log('Trades needed:', result.trades);
  };

  return <button onClick={handleOptimize}>Optimize Portfolio</button>;
}
```

## Calculations

### Volatility
Standard deviation of returns, annualized with 252 trading days.

### Sharpe Ratio
(Annualized Return - Risk Free Rate) / Annualized Volatility

### Beta
Covariance between portfolio returns and market returns divided by market variance.

### Diversification Score
Herfindahl index-based score from 0-100, where 100 is perfectly diversified.

### Maximum Drawdown
Largest peak-to-trough decline during the period.

### Alpha
Expected return vs. actual return based on market performance and beta.

## Configuration

All configuration values in `portfolioConstants.ts`:

```typescript
export const PORTFOLIO_CONSTANTS = {
  DEFAULT_RISK_FREE_RATE: 0.02,
  DEFAULT_LEVERAGE_RATIO: 2,
  DEFAULT_MAX_POSITION_SIZE: 0.3,
  DEFAULT_MIN_POSITION_SIZE: 0.01,
  DEFAULT_REBALANCE_THRESHOLD: 0.1,
  DEFAULT_TRANSACTION_FEE: 0.001,
  // ... more constants
};
```

## Testing

All services include comprehensive unit tests:

```bash
npm run test -- portfolio
```

Test coverage:
- PortfolioAnalysisService.test.ts (200+ lines)
- RecommendationEngineService.test.ts (200+ lines)
- PerformanceComparisonService.test.ts (200+ lines)

## Performance

- Portfolio analysis: < 100ms for 100+ positions
- Recommendation generation: < 500ms
- Full optimization: < 2 seconds
- Historical performance: < 500ms

## Browser Compatibility

- Chrome/Edge: v88+
- Firefox: v78+
- Safari: v14+

## Future Enhancements

- Machine learning for recommendation ranking
- Scenario analysis (what-if simulations)
- Tax-loss harvesting suggestions
- Options strategies recommendations
- Multi-currency portfolio support
- Real-time market data integration
- Automated rebalancing execution

## Troubleshooting

### Recommendations not generating
- Ensure portfolio has at least 2 positions
- Check that portfolio value is defined
- Verify position weights sum to 100%

### Inaccurate metrics
- Verify historical price data is complete
- Check that entry prices are realistic
- Ensure position quantities are positive

### Performance issues
- Consider pagination for large portfolios
- Use period='1m' instead of '1y' for faster calculation
- Cache analysis results when possible

---

**Version**: 1.0.0  
**Status**: Production Ready
