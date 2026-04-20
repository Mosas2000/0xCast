// frontend/src/utils/portfolioFormatters.ts

import { PortfolioRecommendation, Trade } from '@/types/portfolio';

export class PortfolioFormatters {
  static formatRecommendationForDisplay(recommendation: PortfolioRecommendation): {
    title: string;
    description: string;
    summary: string;
  } {
    return {
      title: this.formatRecommendationTitle(recommendation),
      description: this.formatRecommendationDescription(recommendation),
      summary: this.formatRecommendationSummary(recommendation),
    };
  }

  private static formatRecommendationTitle(recommendation: PortfolioRecommendation): string {
    const priorityEmojis = {
      high: '🔴',
      medium: '🟠',
      low: '🟢',
    };

    const typeLabels = {
      rebalancing: 'Rebalance',
      diversification: 'Diversify',
      risk_management: 'Reduce Risk',
      opportunity: 'Opportunity',
    };

    const priority = priorityEmojis[recommendation.priority as keyof typeof priorityEmojis] || '';
    const type = typeLabels[recommendation.type as keyof typeof typeLabels] || recommendation.type;

    return `${priority} ${type}: ${recommendation.title}`;
  }

  private static formatRecommendationDescription(recommendation: PortfolioRecommendation): string {
    let description = recommendation.description;
    
    if (recommendation.actionItems.length > 0) {
      description += '\n\nSuggested actions:\n';
      recommendation.actionItems.forEach((item, idx) => {
        description += `${idx + 1}. ${item.action.toUpperCase()} ${item.quantity} ${item.marketName}\n`;
      });
    }

    description += `\nConfidence: ${(recommendation.confidenceScore * 100).toFixed(0)}%`;
    return description;
  }

  private static formatRecommendationSummary(recommendation: PortfolioRecommendation): string {
    return `${recommendation.type}: ${recommendation.expectedBenefit}`;
  }

  static formatTradeForExecution(trade: Trade): string {
    const verb = trade.action.toUpperCase();
    return `${verb} ${trade.quantity} contracts of ${trade.marketName} @ ${trade.targetPrice.toFixed(2)}`;
  }

  static formatTradesForReport(trades: Trade[]): string[] {
    return trades.map((trade) => this.formatTradeForExecution(trade));
  }

  static formatRecommendationJSON(recommendation: PortfolioRecommendation): Record<string, any> {
    return {
      id: recommendation.id,
      type: recommendation.type,
      title: recommendation.title,
      description: recommendation.description,
      priority: recommendation.priority,
      confidence: recommendation.confidenceScore,
      expectedBenefit: recommendation.expectedBenefit,
      actions: recommendation.actionItems.map((item) => ({
        marketId: item.marketId,
        marketName: item.marketName,
        action: item.action,
        quantity: item.quantity,
        targetPrice: item.targetPrice,
        estimatedCost: item.estimatedCost,
      })),
      expiresAt: recommendation.expiresAt.toISOString(),
    };
  }

  static formatPortfolioSummary(portfolio: any): string {
    const totalValue = portfolio.totalValue?.toFixed(2) || '0.00';
    const positions = portfolio.positions?.length || 0;
    const cash = portfolio.cash?.toFixed(2) || '0.00';

    return `Portfolio Summary: $${totalValue} (${positions} positions, $${cash} cash)`;
  }

  static formatMetricsSummary(metrics: any): string {
    const parts = [];
    
    if (metrics.totalValue) {
      parts.push(`Value: $${metrics.totalValue.toFixed(2)}`);
    }
    
    if (metrics.riskMetrics) {
      parts.push(`Risk: ${metrics.riskMetrics.riskLevel}`);
      parts.push(`Volatility: ${(metrics.riskMetrics.volatility * 100).toFixed(1)}%`);
      parts.push(`Sharpe: ${metrics.riskMetrics.sharpeRatio.toFixed(2)}`);
    }
    
    if (metrics.diversificationScore !== undefined) {
      parts.push(`Diversification: ${metrics.diversificationScore.toFixed(0)}%`);
    }

    return parts.join(' | ');
  }

  static formatOptimizationSummary(result: any): string {
    const parts = [];
    
    if (result.expectedReturn !== undefined) {
      parts.push(`Expected Return: ${(result.expectedReturn * 100).toFixed(2)}%`);
    }
    
    if (result.expectedRisk !== undefined) {
      parts.push(`Expected Risk: ${(result.expectedRisk * 100).toFixed(2)}%`);
    }
    
    if (result.expectedImprovement !== undefined) {
      parts.push(`Improvement: ${(result.expectedImprovement * 100).toFixed(2)}%`);
    }
    
    if (result.trades) {
      parts.push(`Trades: ${result.trades.length}`);
    }

    return parts.join(' | ');
  }

  static formatRecommendationList(recommendations: PortfolioRecommendation[]): string {
    const byType = recommendations.reduce((acc, rec) => {
      if (!acc[rec.type]) acc[rec.type] = [];
      acc[rec.type].push(rec);
      return acc;
    }, {} as Record<string, PortfolioRecommendation[]>);

    const lines = [];
    
    Object.entries(byType).forEach(([type, recs]) => {
      lines.push(`\n${type.toUpperCase()} (${recs.length}):`);
      recs.forEach((rec) => {
        lines.push(`  • [${rec.priority}] ${rec.title}`);
      });
    });

    return lines.join('\n');
  }

  static formatPerformanceComparison(comparison: any): string {
    const parts = [];
    
    if (comparison.alpha !== undefined) {
      parts.push(`Alpha: ${(comparison.alpha * 100).toFixed(2)}%`);
    }
    
    if (comparison.beta !== undefined) {
      parts.push(`Beta: ${comparison.beta.toFixed(2)}`);
    }
    
    if (comparison.out_performance !== undefined) {
      parts.push(`Outperformance: ${(comparison.out_performance * 100).toFixed(2)}%`);
    }
    
    if (comparison.information_ratio !== undefined) {
      parts.push(`Information Ratio: ${comparison.information_ratio.toFixed(2)}`);
    }

    return parts.join(' | ');
  }

  static exportRecommendationsAsCSV(recommendations: PortfolioRecommendation[]): string {
    const headers = [
      'ID',
      'Type',
      'Title',
      'Priority',
      'Confidence',
      'Expected Benefit',
      'Actions',
      'Expires',
    ];

    const rows = recommendations.map((rec) => [
      rec.id,
      rec.type,
      rec.title,
      rec.priority,
      (rec.confidenceScore * 100).toFixed(0),
      rec.expectedBenefit,
      rec.actionItems.length,
      rec.expiresAt.toLocaleDateString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }

  static exportTradesAsCSV(trades: Trade[]): string {
    const headers = [
      'ID',
      'Market',
      'Action',
      'Quantity',
      'Target Price',
      'Estimated Cost',
    ];

    const rows = trades.map((trade) => [
      trade.id,
      trade.marketName,
      trade.action,
      trade.quantity,
      trade.targetPrice.toFixed(2),
      trade.transactionCost.toFixed(2),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }

  static formatErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error.message) {
      return error.message;
    }
    
    if (error.error && error.error.message) {
      return error.error.message;
    }

    return 'An unknown error occurred';
  }

  static formatLoadingMessage(stage: string): string {
    const messages: Record<string, string> = {
      analyzing: 'Analyzing portfolio...',
      calculating: 'Calculating metrics...',
      generating: 'Generating recommendations...',
      optimizing: 'Optimizing portfolio...',
      comparing: 'Comparing with benchmarks...',
      loading: 'Loading portfolio data...',
    };

    return messages[stage] || 'Processing...';
  }

  static formatSuccessMessage(type: string): string {
    const messages: Record<string, string> = {
      analyzed: 'Portfolio analysis complete',
      recommended: 'Recommendations generated',
      optimized: 'Portfolio optimization complete',
      compared: 'Benchmark comparison complete',
      accepted: 'Recommendation accepted',
      rejected: 'Recommendation dismissed',
      applied: 'Changes applied successfully',
    };

    return messages[type] || 'Success';
  }
}

export default PortfolioFormatters;
