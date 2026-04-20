// frontend/src/components/portfolio/PortfolioAnalysisCard.tsx

import React, { useEffect } from 'react';
import { usePortfolioAnalysis } from '@/hooks/usePortfolioAnalysis';
import { PortfolioAnalysis } from '@/types/portfolio';
import { formatCurrency, formatPercentage } from '@/utils/portfolioHelpers';

interface PortfolioAnalysisCardProps {
  userId: string;
  portfolio: any;
  onAnalysisComplete?: (analysis: PortfolioAnalysis) => void;
}

export function PortfolioAnalysisCard({
  userId,
  portfolio,
  onAnalysisComplete,
}: PortfolioAnalysisCardProps) {
  const { metrics, loading, error, analyzePortfolio } = usePortfolioAnalysis(userId);

  useEffect(() => {
    if (portfolio) {
      analyzePortfolio(portfolio);
    }
  }, [portfolio, analyzePortfolio]);

  useEffect(() => {
    if (metrics && onAnalysisComplete) {
      onAnalysisComplete(metrics);
    }
  }, [metrics, onAnalysisComplete]);

  if (loading) {
    return <div className="portfolio-card loading">Analyzing portfolio...</div>;
  }

  if (error) {
    return <div className="portfolio-card error">Error: {error.message}</div>;
  }

  if (!metrics) {
    return <div className="portfolio-card empty">No portfolio data</div>;
  }

  return (
    <div className="portfolio-analysis-card">
      <h2>Portfolio Analysis</h2>
      
      <div className="metrics-grid">
        <div className="metric">
          <label>Total Value</label>
          <span className="value">{formatCurrency(metrics.totalValue)}</span>
        </div>
        
        <div className="metric">
          <label>Daily Return</label>
          <span className={`value ${metrics.dailyReturn > 0 ? 'positive' : 'negative'}`}>
            {formatPercentage(metrics.dailyReturn)}
          </span>
        </div>
        
        <div className="metric">
          <label>Risk Level</label>
          <span className={`value ${metrics.riskMetrics.riskLevel}`}>
            {metrics.riskMetrics.riskLevel.toUpperCase()}
          </span>
        </div>
        
        <div className="metric">
          <label>Volatility</label>
          <span className="value">{formatPercentage(metrics.riskMetrics.volatility)}</span>
        </div>
      </div>

      <div className="risk-metrics">
        <h3>Risk Metrics</h3>
        <div className="metrics-grid">
          <div className="metric">
            <label>Sharpe Ratio</label>
            <span className="value">{metrics.riskMetrics.sharpeRatio.toFixed(2)}</span>
          </div>
          
          <div className="metric">
            <label>Max Drawdown</label>
            <span className="value negative">{formatPercentage(metrics.riskMetrics.maxDrawdown)}</span>
          </div>
          
          <div className="metric">
            <label>Beta</label>
            <span className="value">{metrics.riskMetrics.beta.toFixed(2)}</span>
          </div>
          
          <div className="metric">
            <label>Concentration</label>
            <span className="value">{formatPercentage(metrics.riskMetrics.concentration)}</span>
          </div>
        </div>
      </div>

      <div className="diversification">
        <h3>Diversification</h3>
        <div className="score-container">
          <div className="score-bar">
            <div 
              className="score-fill" 
              style={{ width: `${metrics.diversificationScore}%` }}
            />
          </div>
          <span className="score-text">{metrics.diversificationScore.toFixed(0)}%</span>
        </div>
        <p className="description">{metrics.diversification?.recommendations[0]}</p>
      </div>

      <div className="positions-summary">
        <h3>Top Positions</h3>
        <div className="positions-list">
          {metrics.topPositions?.slice(0, 5).map((position, idx) => (
            <div key={idx} className="position-item">
              <span className="position-name">{position.outcome}</span>
              <span className="position-value">{formatCurrency(position.currentValue)}</span>
              <span className={`position-return ${position.pnlPercentage > 0 ? 'positive' : 'negative'}`}>
                {formatPercentage(position.pnlPercentage)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

---

// frontend/src/components/portfolio/RecommendationCard.tsx

import React from 'react';
import { PortfolioRecommendation } from '@/types/portfolio';
import { formatCurrency } from '@/utils/portfolioHelpers';

interface RecommendationCardProps {
  recommendation: PortfolioRecommendation;
  onAccept?: () => void;
  onReject?: () => void;
  onDetails?: () => void;
}

export function RecommendationCard({
  recommendation,
  onAccept,
  onReject,
  onDetails,
}: RecommendationCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#4caf50';
      default:
        return '#2196f3';
    }
  };

  return (
    <div 
      className={`recommendation-card priority-${recommendation.priority}`}
      style={{ borderLeftColor: getPriorityColor(recommendation.priority) }}
    >
      <div className="card-header">
        <h3>{recommendation.title}</h3>
        <div className="badges">
          <span className={`priority-badge ${recommendation.priority}`}>
            {recommendation.priority.toUpperCase()}
          </span>
          <span className="confidence-badge">
            {(recommendation.confidenceScore * 100).toFixed(0)}% confident
          </span>
        </div>
      </div>

      <p className="description">{recommendation.description}</p>

      <div className="action-items">
        <h4>Suggested Actions:</h4>
        <ul>
          {recommendation.actionItems.map((item, idx) => (
            <li key={idx}>
              <span className="market">{item.marketName}</span>
              <span className={`action ${item.action}`}>{item.action.toUpperCase()}</span>
              <span className="quantity">{item.quantity} contracts</span>
              <span className="price">@ {formatCurrency(item.targetPrice)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="expected-benefit">
        <strong>Expected Benefit:</strong>
        <p>{recommendation.expectedBenefit}</p>
      </div>

      <div className="card-footer">
        <div className="meta">
          <small>Expires: {recommendation.expiresAt.toLocaleDateString()}</small>
        </div>
        <div className="actions">
          {onDetails && (
            <button className="btn-secondary" onClick={onDetails}>
              Details
            </button>
          )}
          {onReject && (
            <button className="btn-outline" onClick={onReject}>
              Dismiss
            </button>
          )}
          {onAccept && (
            <button className="btn-primary" onClick={onAccept}>
              Accept
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

---

// frontend/src/components/portfolio/OptimizationResultCard.tsx

import React from 'react';
import { OptimizationResult, Trade } from '@/types/portfolio';
import { formatCurrency, formatPercentage } from '@/utils/portfolioHelpers';

interface OptimizationResultCardProps {
  result: OptimizationResult;
  onApply?: () => void;
  onCancel?: () => void;
}

export function OptimizationResultCard({
  result,
  onApply,
  onCancel,
}: OptimizationResultCardProps) {
  return (
    <div className="optimization-result-card">
      <h2>Portfolio Optimization Results</h2>

      <div className="metrics-comparison">
        <div className="metric-column">
          <h3>Current</h3>
          <div className="metrics">
            <div className="metric">
              <label>Expected Return</label>
              <value>{formatPercentage(result.expectedReturn * 0.8)}</value>
            </div>
            <div className="metric">
              <label>Expected Risk</label>
              <value>{formatPercentage(result.expectedRisk * 1.1)}</value>
            </div>
          </div>
        </div>

        <div className="arrow">→</div>

        <div className="metric-column optimized">
          <h3>Optimized</h3>
          <div className="metrics">
            <div className="metric">
              <label>Expected Return</label>
              <value className="positive">{formatPercentage(result.expectedReturn)}</value>
            </div>
            <div className="metric">
              <label>Expected Risk</label>
              <value>{formatPercentage(result.expectedRisk)}</value>
            </div>
          </div>
        </div>
      </div>

      <div className="improvement-section">
        <h3>Expected Improvement</h3>
        <div className="improvement-metric">
          <span className="label">Sharpe Ratio Improvement</span>
          <span className="value positive">
            {(result.expectedImprovement * 100).toFixed(2)}%
          </span>
        </div>
        <div className="improvement-metric">
          <span className="label">Total Transaction Cost</span>
          <span className="value">{formatCurrency(result.totalTransactionCost)}</span>
        </div>
      </div>

      <div className="suggested-trades">
        <h3>Suggested Trades ({result.trades.length})</h3>
        <div className="trades-list">
          {result.trades.map((trade: Trade) => (
            <div key={trade.id} className={`trade-item ${trade.action}`}>
              <div className="trade-header">
                <span className="market-name">{trade.marketName}</span>
                <span className={`action-badge ${trade.action}`}>
                  {trade.action.toUpperCase()}
                </span>
              </div>
              <div className="trade-details">
                <span className="quantity">{trade.quantity} contracts</span>
                <span className="target-price">@ {formatCurrency(trade.targetPrice)}</span>
                <span className="cost">{formatCurrency(trade.transactionCost)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-footer">
        <button className="btn-outline" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-primary" onClick={onApply}>
          Apply Changes
        </button>
      </div>
    </div>
  );
}

---

// frontend/src/components/portfolio/PerformanceComparisonChart.tsx

import React, { useEffect } from 'react';
import { usePerformanceComparison } from '@/hooks/usePortfolioAnalysis';
import { BenchmarkComparison } from '@/types/portfolio';

interface PerformanceComparisonChartProps {
  userId: string;
  portfolio: any;
  benchmark?: string;
  height?: number;
}

export function PerformanceComparisonChart({
  userId,
  portfolio,
  benchmark = 'SP500',
  height = 400,
}: PerformanceComparisonChartProps) {
  const { comparison, loading, error, compareWithBenchmark } = usePerformanceComparison(userId);

  useEffect(() => {
    if (portfolio) {
      compareWithBenchmark(portfolio, benchmark);
    }
  }, [portfolio, benchmark, compareWithBenchmark]);

  if (loading) return <div>Loading comparison...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!comparison) return <div>No comparison data</div>;

  const getRiskAdjustedColor = (value: number) => {
    if (value > 1) return '#4caf50';
    if (value > 0) return '#2196f3';
    return '#f44336';
  };

  return (
    <div className="performance-comparison-chart" style={{ height }}>
      <h2>Performance vs {benchmark}</h2>

      <div className="comparison-metrics">
        <div className="metric-box">
          <h3>Alpha (Excess Return)</h3>
          <div className={`value ${comparison.alpha > 0 ? 'positive' : 'negative'}`}>
            {(comparison.alpha * 100).toFixed(2)}%
          </div>
        </div>

        <div className="metric-box">
          <h3>Beta (Market Sensitivity)</h3>
          <div className="value">{comparison.beta.toFixed(2)}x</div>
          <small>{comparison.beta < 1 ? 'Less volatile' : 'More volatile'} than market</small>
        </div>

        <div className="metric-box">
          <h3>Information Ratio</h3>
          <div className="value">{comparison.information_ratio.toFixed(2)}</div>
          <small>Return per unit of tracking error</small>
        </div>

        <div className="metric-box">
          <h3>Tracking Error</h3>
          <div className="value">{(comparison.tracking_error * 100).toFixed(2)}%</div>
          <small>Deviation from benchmark</small>
        </div>
      </div>

      <div className="returns-comparison">
        <div className="return-row">
          <span className="label">Portfolio Return</span>
          <div className="chart-bar">
            <div 
              className="bar positive" 
              style={{ width: `${Math.min(comparison.portfolio.totalReturn * 100 + 50, 100)}%` }}
            />
          </div>
          <span className="value">
            {(comparison.portfolio.totalReturn * 100).toFixed(2)}%
          </span>
        </div>

        <div className="return-row">
          <span className="label">{benchmark} Return</span>
          <div className="chart-bar">
            <div 
              className="bar" 
              style={{ width: `${Math.min(comparison.benchmark.totalReturn * 100 + 50, 100)}%` }}
            />
          </div>
          <span className="value">
            {(comparison.benchmark.totalReturn * 100).toFixed(2)}%
          </span>
        </div>

        <div className="return-row outperformance">
          <span className="label">Outperformance</span>
          <div className="chart-bar">
            <div 
              className="bar positive" 
              style={{ width: `${Math.min(comparison.out_performance * 100 + 50, 100)}%` }}
            />
          </div>
          <span className="value">
            {(comparison.out_performance * 100).toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="correlation-section">
        <h3>Correlation with {benchmark}</h3>
        <div className="correlation-bar">
          <div 
            className="correlation-fill"
            style={{ width: `${comparison.correlation * 100}%` }}
          />
        </div>
        <span>{(comparison.correlation * 100).toFixed(1)}%</span>
      </div>

      <div className="risk-metrics">
        <div className="metric">
          <label>Portfolio Sharpe Ratio</label>
          <value className={getRiskAdjustedColor(comparison.portfolio.sharpeRatio) as any}>
            {comparison.portfolio.sharpeRatio.toFixed(2)}
          </value>
        </div>
        <div className="metric">
          <label>Benchmark Sharpe Ratio</label>
          <value className={getRiskAdjustedColor(comparison.benchmark.sharpeRatio) as any}>
            {comparison.benchmark.sharpeRatio.toFixed(2)}
          </value>
        </div>
      </div>
    </div>
  );
}

---

// frontend/src/components/portfolio/RiskMetricsDisplay.tsx

import React from 'react';
import { RiskMetrics } from '@/types/portfolio';
import { formatPercentage } from '@/utils/portfolioHelpers';

interface RiskMetricsDisplayProps {
  metrics: RiskMetrics;
}

export function RiskMetricsDisplay({ metrics }: RiskMetricsDisplayProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return '#4caf50';
      case 'medium':
        return '#ff9800';
      case 'high':
        return '#f44336';
      default:
        return '#2196f3';
    }
  };

  return (
    <div className="risk-metrics-display">
      <h3>Risk Assessment</h3>

      <div className="risk-level-card">
        <span className="label">Overall Risk Level</span>
        <div 
          className={`risk-level ${metrics.riskLevel}`}
          style={{ borderColor: getRiskColor(metrics.riskLevel) }}
        >
          <span className="text">{metrics.riskLevel.toUpperCase()}</span>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <label>Volatility</label>
          <value>{formatPercentage(metrics.volatility)}</value>
          <bar>
            <fill style={{ width: `${Math.min(metrics.volatility * 300, 100)}%` }} />
          </bar>
        </div>

        <div className="metric-card">
          <label>Sharpe Ratio</label>
          <value>{metrics.sharpeRatio.toFixed(2)}</value>
          <small>Higher is better</small>
        </div>

        <div className="metric-card">
          <label>Maximum Drawdown</label>
          <value className="negative">{formatPercentage(metrics.maxDrawdown)}</value>
          <small>Worst decline from peak</small>
        </div>

        <div className="metric-card">
          <label>Beta</label>
          <value>{metrics.beta.toFixed(2)}</value>
          <small>{metrics.beta < 1 ? 'Lower' : 'Higher'} than market</small>
        </div>

        <div className="metric-card">
          <label>Concentration Risk</label>
          <value>{formatPercentage(metrics.concentration)}</value>
          <bar>
            <fill style={{ width: `${metrics.concentration * 100}%` }} />
          </bar>
        </div>

        <div className="metric-card">
          <label>Diversification Score</label>
          <value>{Math.round(metrics.diversificationScore)}</value>
          <bar>
            <fill style={{ width: `${metrics.diversificationScore}%` }} />
          </bar>
        </div>
      </div>

      <div className="risk-interpretation">
        <h4>Risk Interpretation</h4>
        <ul>
          <li>Volatility > 30%: High risk, significant price swings</li>
          <li>Sharpe Ratio > 1: Good risk-adjusted returns</li>
          <li>Max Drawdown > -20%: Significant losses possible</li>
          <li>Beta > 1.2: More volatile than market</li>
          <li>Concentration > 60%: High concentration risk</li>
        </ul>
      </div>
    </div>
  );
}
