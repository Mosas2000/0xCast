# Portfolio Recommendations Integration Guide

Step-by-step guide for integrating the portfolio rebalancing recommendation system into your application.

## Overview

The portfolio recommendation system consists of three main services:
1. PortfolioAnalysisService - Metric calculations
2. RecommendationEngineService - Recommendation generation
3. PerformanceComparisonService - Benchmark comparison

And five React hooks for component integration.

## Installation

### 1. Ensure All Files Are Present

```
frontend/src/
├── types/
│   └── portfolio.ts                    (Type definitions)
├── services/
│   ├── PortfolioAnalysisService.ts
│   ├── RecommendationEngineService.ts
│   ├── PerformanceComparisonService.ts
│   ├── PortfolioAnalysisService.test.ts
│   ├── RecommendationEngineService.test.ts
│   └── PerformanceComparisonService.test.ts
├── hooks/
│   └── usePortfolioAnalysis.ts        (5 hooks)
└── utils/
    ├── portfolioHelpers.ts
    ├── portfolioConstants.ts
```

### 2. Install Dependencies

No additional dependencies required. Uses only existing project dependencies.

### 3. Run Tests

```bash
npm run test -- portfolio
```

All 600+ lines of tests should pass.

## Basic Integration

### Step 1: Import Hook in Component

```typescript
import { usePortfolioAnalysis } from '@/hooks/usePortfolioAnalysis';

function MyPortfolioComponent({ userId }) {
  const { metrics, analyzePortfolio, loading } = usePortfolioAnalysis(userId);
  
  return (
    <div>
      {loading && <p>Analyzing...</p>}
      {metrics && <p>Portfolio Value: {metrics.totalValue}</p>}
    </div>
  );
}
```

### Step 2: Trigger Analysis

```typescript
useEffect(() => {
  if (portfolio) {
    analyzePortfolio(portfolio);
  }
}, [portfolio, analyzePortfolio]);
```

### Step 3: Display Results

```typescript
{metrics && (
  <div>
    <h3>Portfolio Metrics</h3>
    <p>Risk Level: {metrics.riskMetrics.riskLevel}</p>
    <p>Sharpe Ratio: {metrics.riskMetrics.sharpeRatio.toFixed(2)}</p>
    <p>Diversification: {metrics.diversificationScore}%</p>
  </div>
)}
```

## Advanced Integration

### Portfolio Analysis Dashboard

```typescript
import { usePortfolioAnalysis } from '@/hooks/usePortfolioAnalysis';
import PortfolioMetricsCard from './PortfolioMetricsCard';
import RiskAssessmentCard from './RiskAssessmentCard';

function PortfolioDashboard({ userId, portfolio }) {
  const {
    metrics,
    analyzePortfolio,
    calculateRiskMetrics,
    calculateDiversification,
    calculateHistoricalPerformance,
    loading,
    error,
  } = usePortfolioAnalysis(userId);

  useEffect(() => {
    analyzePortfolio(portfolio);
  }, [portfolio]);

  if (loading) return <div>Loading analysis...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="portfolio-dashboard">
      <PortfolioMetricsCard metrics={metrics} />
      <RiskAssessmentCard riskMetrics={metrics.riskMetrics} />
      <DiversificationCard diversification={metrics.diversification} />
      <PerformanceChart performance={metrics.historicalPerformance} />
    </div>
  );
}
```

### Recommendation Panel

```typescript
import { usePortfolioRecommendations } from '@/hooks/usePortfolioAnalysis';
import RecommendationCard from './RecommendationCard';

function RecommendationPanel({ userId, portfolio }) {
  const {
    recommendations,
    generateRecommendations,
    acceptRecommendation,
    rejectRecommendation,
    loading,
  } = usePortfolioRecommendations(userId);

  useEffect(() => {
    generateRecommendations(portfolio);
  }, [portfolio]);

  return (
    <div>
      <h2>Portfolio Recommendations</h2>
      {recommendations.map((rec) => (
        <RecommendationCard
          key={rec.id}
          recommendation={rec}
          onAccept={() => acceptRecommendation(rec.id)}
          onReject={() => rejectRecommendation(rec.id)}
        />
      ))}
    </div>
  );
}
```

### Optimization Interface

```typescript
import { usePortfolioOptimization } from '@/hooks/usePortfolioAnalysis';

function OptimizationPanel({ userId, portfolio }) {
  const {
    optimizationResult,
    optimizePortfolio,
    applyOptimization,
    loading,
  } = usePortfolioOptimization(userId);

  const handleOptimize = async () => {
    const result = await optimizePortfolio(portfolio);
    console.log('Suggested Allocation:', result.suggestedAllocations);
    console.log('Expected Return:', result.expectedReturn);
  };

  return (
    <div>
      <button onClick={handleOptimize} disabled={loading}>
        Optimize Portfolio
      </button>
      {optimizationResult && (
        <div>
          <h3>Optimization Results</h3>
          <p>Expected Return: {(optimizationResult.expectedReturn * 100).toFixed(2)}%</p>
          <p>Transaction Cost: {optimizationResult.totalTransactionCost.toFixed(2)}</p>
          <button onClick={() => applyOptimization(optimizationResult)}>
            Apply Changes
          </button>
        </div>
      )}
    </div>
  );
}
```

### Performance Comparison

```typescript
import { usePerformanceComparison } from '@/hooks/usePortfolioAnalysis';

function BenchmarkComparison({ userId, portfolio }) {
  const {
    comparison,
    compareWithBenchmark,
    getPerformanceMetrics,
    loading,
  } = usePerformanceComparison(userId);

  useEffect(() => {
    compareWithBenchmark(portfolio, 'SP500');
  }, [portfolio]);

  return (
    <div>
      {comparison && (
        <div>
          <h3>vs S&P 500</h3>
          <p>Alpha: {(comparison.alpha * 100).toFixed(2)}%</p>
          <p>Sharpe Ratio: {comparison.portfolio.sharpeRatio.toFixed(2)}</p>
          <p>Outperformance: {(comparison.out_performance * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}
```

## Component Examples

### PortfolioAnalysisCard

Display portfolio overview with key metrics.

```typescript
interface PortfolioAnalysisCardProps {
  metrics: PortfolioAnalysis;
  loading?: boolean;
  error?: Error | null;
}

function PortfolioAnalysisCard({ metrics, loading, error }) {
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="card">
      <h3>Portfolio Overview</h3>
      <div className="metrics">
        <div>
          <label>Total Value</label>
          <value>{formatCurrency(metrics.totalValue)}</value>
        </div>
        <div>
          <label>Daily Change</label>
          <value>{formatPercentage(metrics.dailyReturn)}</value>
        </div>
        <div>
          <label>Risk Level</label>
          <value>{metrics.riskMetrics.riskLevel}</value>
        </div>
      </div>
    </div>
  );
}
```

### RecommendationCard

Display individual recommendation with actions.

```typescript
interface RecommendationCardProps {
  recommendation: PortfolioRecommendation;
  onAccept: () => void;
  onReject: () => void;
}

function RecommendationCard({ recommendation, onAccept, onReject }) {
  return (
    <div className="recommendation-card">
      <div className="header">
        <h4>{recommendation.title}</h4>
        <span className={`priority ${recommendation.priority}`}>
          {recommendation.priority}
        </span>
      </div>
      <p>{recommendation.description}</p>
      <div className="actions">
        <ul>
          {recommendation.actionItems.map((item, idx) => (
            <li key={idx}>
              {item.marketName}: {item.action} {item.quantity} @{formatCurrency(item.targetPrice)}
            </li>
          ))}
        </ul>
      </div>
      <div className="buttons">
        <button onClick={onAccept}>Accept</button>
        <button onClick={onReject}>Dismiss</button>
      </div>
    </div>
  );
}
```

### OptimizationResultCard

Display optimization results and trades.

```typescript
interface OptimizationResultCardProps {
  result: OptimizationResult;
  onApply: () => void;
}

function OptimizationResultCard({ result, onApply }) {
  return (
    <div className="optimization-card">
      <h3>Optimization Results</h3>
      <div className="metrics">
        <div>
          <label>Expected Return</label>
          <value>{formatPercentage(result.expectedReturn)}</value>
        </div>
        <div>
          <label>Expected Risk</label>
          <value>{formatPercentage(result.expectedRisk)}</value>
        </div>
        <div>
          <label>Improvement</label>
          <value>{(result.expectedImprovement * 100).toFixed(2)}%</value>
        </div>
      </div>
      <div>
        <h4>Suggested Trades</h4>
        {result.trades.map((trade) => (
          <div key={trade.id} className="trade">
            <p>{trade.marketName}: {trade.action} {trade.quantity}</p>
            <p>Cost: {formatCurrency(trade.transactionCost)}</p>
          </div>
        ))}
      </div>
      <button onClick={onApply}>Apply Changes</button>
    </div>
  );
}
```

## Styling Recommendations

Add CSS classes for styling:

```css
.portfolio-analysis-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: white;
}

.metric {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.recommendation-card {
  border-left: 4px solid #2196f3;
  padding: 12px;
  margin: 8px 0;
  background: #f5f5f5;
}

.recommendation-card.high {
  border-left-color: #f44336;
}

.recommendation-card.medium {
  border-left-color: #ff9800;
}

.recommendation-card.low {
  border-left-color: #4caf50;
}
```

## Performance Optimization

### Lazy Load Recommendations

```typescript
const recommendations = useMemo(
  () => recommendations.filter((r) => r.priority === 'high'),
  [recommendations]
);
```

### Cache Analysis Results

```typescript
const cachedMetrics = useCallback(() => {
  if (portfolio === previousPortfolio) {
    return previousMetrics;
  }
  return analyzePortfolio(portfolio);
}, [portfolio]);
```

### Pagination for Large Portfolios

```typescript
const [page, setPage] = useState(0);
const pageSize = 20;
const paginatedPositions = positions.slice(
  page * pageSize,
  (page + 1) * pageSize
);
```

## Error Handling

All hooks include error states:

```typescript
const { metrics, loading, error } = usePortfolioAnalysis(userId);

if (error) {
  return (
    <div className="error">
      <p>Failed to analyze portfolio: {error.message}</p>
      <button onClick={() => analyzePortfolio(portfolio)}>Retry</button>
    </div>
  );
}
```

## Testing Components

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { usePortfolioAnalysis } from '@/hooks/usePortfolioAnalysis';

jest.mock('@/hooks/usePortfolioAnalysis');

describe('PortfolioAnalysisCard', () => {
  it('displays loading state', () => {
    usePortfolioAnalysis.mockReturnValue({
      loading: true,
      metrics: null,
    });

    render(<PortfolioAnalysisCard userId="user1" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays metrics', async () => {
    usePortfolioAnalysis.mockReturnValue({
      loading: false,
      metrics: mockMetrics,
    });

    render(<PortfolioAnalysisCard userId="user1" />);
    await waitFor(() => {
      expect(screen.getByText('Portfolio Analysis')).toBeInTheDocument();
    });
  });
});
```

## Troubleshooting

### Recommendations Not Generating

Check that:
- Portfolio has at least 2 positions
- Portfolio value is properly defined
- Position weights sum to 100%

### Metrics Showing Zero Values

Ensure:
- Positions have realistic entry prices
- Current prices are defined
- Position quantities are positive

### Performance Issues

Optimize by:
- Using pagination for large portfolios
- Caching analysis results
- Reducing analysis frequency
- Memoizing expensive calculations

## Next Steps

1. Create UI components for your design system
2. Integrate with your state management (Redux, Zustand, etc.)
3. Connect to real portfolio data
4. Add real market data integration
5. Implement automated rebalancing execution
6. Add user preferences and customization

---

**Version**: 1.0.0  
**Status**: Production Ready
