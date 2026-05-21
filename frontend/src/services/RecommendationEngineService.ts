import {
  Portfolio,
  RebalancingRecommendation,
  PortfolioRecommendation,
  PortfolioOptimizationResult,
} from '@/types/portfolio';
import { PortfolioAnalysisService } from './PortfolioAnalysisService';

export class RecommendationEngineService {
  static generateRecommendations(portfolio: Portfolio): PortfolioRecommendation[] {
    const recommendations: PortfolioRecommendation[] = [];

    const rebalancingRecs = this.generateRebalancingRecommendations(portfolio);
    if (rebalancingRecs.length > 0) {
      recommendations.push(this.createRecommendation('rebalancing', rebalancingRecs, portfolio));
    }

    const diversificationRecs = this.generateDiversificationRecommendations(portfolio);
    if (diversificationRecs.length > 0) {
      recommendations.push(this.createRecommendation('diversification', diversificationRecs, portfolio));
    }

    const riskRecs = this.generateRiskManagementRecommendations(portfolio);
    if (riskRecs.length > 0) {
      recommendations.push(this.createRecommendation('risk_management', riskRecs, portfolio));
    }

    const opportunityRecs = this.generateOpportunityRecommendations(portfolio);
    if (opportunityRecs.length > 0) {
      recommendations.push(this.createRecommendation('opportunity', opportunityRecs, portfolio));
    }

    return recommendations;
  }

  static generateRebalancingRecommendations(portfolio: Portfolio): RebalancingRecommendation[] {
    const recommendations: RebalancingRecommendation[] = [];
    const targetWeight = 100 / portfolio.positions.length || 0;

    portfolio.positions.forEach((position) => {
      const deviation = Math.abs(position.weight - targetWeight);

      if (deviation > 10) {
        const action = position.weight > targetWeight ? 'reduce' : 'increase';
        const adjustment = ((position.weight - targetWeight) / 100) * portfolio.totalValue;

        recommendations.push({
          id: `rec_${position.marketId}_${Date.now()}`,
          portfolioId: `portfolio_${portfolio.userId}`,
          userId: portfolio.userId,
          marketId: position.marketId,
          marketName: position.marketName,
          action,
          currentWeight: position.weight,
          recommendedWeight: targetWeight,
          suggestedAmount: Math.abs(adjustment),
          suggestedPrice: position.currentPrice,
          expectedImpact: deviation * 0.5,
          reason: `Weight deviation detected. Current: ${position.weight.toFixed(2)}%, Target: ${targetWeight.toFixed(2)}%`,
          priority: deviation > 20 ? 'high' : 'medium',
          estimatedTransactionCost: Math.abs(adjustment) * 0.001,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      }
    });

    return recommendations;
  }

  static generateDiversificationRecommendations(portfolio: Portfolio): RebalancingRecommendation[] {
    const recommendations: RebalancingRecommendation[] = [];
    const analysis = PortfolioAnalysisService.analyzeDiversification(portfolio);

    if (analysis.concentrationRisk > 0.6) {
      const topPosition = analysis.topPositions[0];
      const excessAmount = (analysis.concentrationRisk - 0.4) * portfolio.totalValue;

      recommendations.push({
        id: `rec_diversify_${topPosition.marketId}_${Date.now()}`,
        portfolioId: `portfolio_${portfolio.userId}`,
        userId: portfolio.userId,
        marketId: topPosition.marketId,
        marketName: topPosition.marketName,
        action: 'reduce',
        currentWeight: topPosition.weight,
        recommendedWeight: topPosition.weight - (excessAmount / portfolio.totalValue) * 100,
        suggestedAmount: excessAmount,
        suggestedPrice: topPosition.currentPrice,
        expectedImpact: 15,
        reason: 'Reduce concentration risk. Consider diversifying into other positions.',
        priority: 'high',
        estimatedTransactionCost: excessAmount * 0.001,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    if (portfolio.positions.length < 3) {
      recommendations.push({
        id: `rec_expand_${Date.now()}`,
        portfolioId: `portfolio_${portfolio.userId}`,
        userId: portfolio.userId,
        marketId: 'new_position',
        marketName: 'New Position',
        action: 'buy',
        currentWeight: 0,
        recommendedWeight: 20,
        suggestedAmount: portfolio.totalValue * 0.2,
        suggestedPrice: 1,
        expectedImpact: 10,
        reason: 'Add more positions to improve diversification.',
        priority: 'medium',
        estimatedTransactionCost: portfolio.totalValue * 0.2 * 0.001,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    return recommendations;
  }

  static generateRiskManagementRecommendations(portfolio: Portfolio): RebalancingRecommendation[] {
    const recommendations: RebalancingRecommendation[] = [];
    const riskMetrics = PortfolioAnalysisService.calculateRiskMetrics(portfolio);

    if (riskMetrics.volatility > 0.3) {
      portfolio.positions
        .filter((p) => p.pnlPercentage < -10)
        .slice(0, 2)
        .forEach((position) => {
          recommendations.push({
            id: `rec_stop_loss_${position.marketId}_${Date.now()}`,
            portfolioId: `portfolio_${portfolio.userId}`,
            userId: portfolio.userId,
            marketId: position.marketId,
            marketName: position.marketName,
            action: 'reduce',
            currentWeight: position.weight,
            recommendedWeight: position.weight * 0.5,
            suggestedAmount: position.currentValue * 0.5,
            suggestedPrice: position.currentPrice,
            expectedImpact: -position.pnlPercentage * 0.25,
            reason: 'Reduce high-risk position with significant losses.',
            priority: 'high',
            estimatedTransactionCost: position.currentValue * 0.5 * 0.001,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          });
        });
    }

    if (riskMetrics.maxDrawdown > 0.2) {
      recommendations.push({
        id: `rec_drawdown_${Date.now()}`,
        portfolioId: `portfolio_${portfolio.userId}`,
        userId: portfolio.userId,
        marketId: 'risk_reduction',
        marketName: 'Risk Reduction',
        action: 'reduce',
        currentWeight: 100,
        recommendedWeight: 70,
        suggestedAmount: portfolio.totalValue * 0.3,
        suggestedPrice: 1,
        expectedImpact: 20,
        reason: 'High drawdown detected. Consider moving to cash or defensive positions.',
        priority: 'high',
        estimatedTransactionCost: 0,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    return recommendations;
  }

  static generateOpportunityRecommendations(portfolio: Portfolio): RebalancingRecommendation[] {
    const recommendations: RebalancingRecommendation[] = [];

    const winningPositions = portfolio.positions.filter((p) => p.pnlPercentage > 15).slice(0, 1);

    winningPositions.forEach((position) => {
      recommendations.push({
        id: `rec_opportunity_${position.marketId}_${Date.now()}`,
        portfolioId: `portfolio_${portfolio.userId}`,
        userId: portfolio.userId,
        marketId: position.marketId,
        marketName: position.marketName,
        action: 'increase',
        currentWeight: position.weight,
        recommendedWeight: position.weight * 1.2,
        suggestedAmount: position.currentValue * 0.2,
        suggestedPrice: position.currentPrice,
        expectedImpact: position.pnlPercentage * 0.2,
        reason: 'Strong performer with positive momentum. Consider increasing position.',
        priority: 'medium',
        estimatedTransactionCost: position.currentValue * 0.2 * 0.001,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    });

    return recommendations;
  }

  static createRecommendation(
    type: 'rebalancing' | 'diversification' | 'risk_management' | 'opportunity',
    actions: RebalancingRecommendation[],
    portfolio: Portfolio
  ): PortfolioRecommendation {
    const typeConfig = {
      rebalancing: {
        title: 'Portfolio Rebalancing',
        description: 'Rebalance portfolio to target allocation to manage risk.',
        timeframe: 'short_term' as const,
        riskLevel: 'low' as const,
      },
      diversification: {
        title: 'Improve Diversification',
        description: 'Reduce concentration risk by diversifying positions.',
        timeframe: 'medium_term' as const,
        riskLevel: 'medium' as const,
      },
      risk_management: {
        title: 'Risk Management Actions',
        description: 'Reduce portfolio risk through defensive actions.',
        timeframe: 'immediate' as const,
        riskLevel: 'high' as const,
      },
      opportunity: {
        title: 'Capture Opportunities',
        description: 'Increase positions in strong performers.',
        timeframe: 'medium_term' as const,
        riskLevel: 'medium' as const,
      },
    };

    const config = typeConfig[type];
    const priority = type === 'risk_management' ? 'high' : type === 'opportunity' ? 'low' : 'medium';
    const expectedBenefit = this.calculateExpectedBenefit(actions, portfolio);

    return {
      id: `portfolio_rec_${Date.now()}`,
      portfolioId: `portfolio_${portfolio.userId}`,
      userId: portfolio.userId,
      type,
      title: config.title,
      description: config.description,
      actionItems: actions,
      expectedBenefit,
      riskLevel: config.riskLevel,
      timeframe: config.timeframe,
      priority,
      confidenceScore: this.calculateConfidenceScore(actions),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    };
  }

  static calculateExpectedBenefit(actions: RebalancingRecommendation[], portfolio: Portfolio): string {
    const totalImpact = actions.reduce((sum, a) => sum + a.expectedImpact, 0);
    const avgImpact = totalImpact / actions.length || 0;

    if (avgImpact > 10) return 'High benefit: Significant improvement expected';
    if (avgImpact > 5) return 'Medium benefit: Moderate improvement expected';
    return 'Low benefit: Minor improvement expected';
  }

  static calculateConfidenceScore(actions: RebalancingRecommendation[]): number {
    const baseScore = 0.7;
    const actionBonus = Math.min(actions.length * 0.05, 0.15);
    return Math.min(baseScore + actionBonus, 0.95);
  }

  static optimizePortfolio(portfolio: Portfolio): PortfolioOptimizationResult {
    const riskMetrics = PortfolioAnalysisService.calculateRiskMetrics(portfolio);
    const recommendations = this.generateRecommendations(portfolio);

    const allTrades = recommendations.flatMap((r) => r.actionItems);

    const optimizedPositions = portfolio.positions.map((pos) => {
      const tradeForPosition = allTrades.find((t) => t.marketId === pos.marketId);

      if (tradeForPosition) {
        const newQuantity = tradeForPosition.action === 'buy' || tradeForPosition.action === 'increase'
          ? pos.quantity + (tradeForPosition.suggestedAmount / pos.currentPrice)
          : Math.max(0, pos.quantity - (tradeForPosition.suggestedAmount / pos.currentPrice));

        return {
          ...pos,
          quantity: newQuantity,
          currentValue: newQuantity * pos.currentPrice,
          weight: (newQuantity * pos.currentPrice) / portfolio.totalValue * 100,
        };
      }

      return pos;
    });

    const totalTransactionCost = allTrades.reduce((sum, t) => sum + t.estimatedTransactionCost, 0);
    const expectedImpactOnRisk = -allTrades.reduce((sum, t) => sum + t.expectedImpact, 0) / allTrades.length || 0;

    const newReturns = optimizedPositions.map((p) => p.pnlPercentage);
    const expectedVolatility = this.calculateExpectedVolatility(newReturns);
    const expectedReturn = newReturns.reduce((sum, r) => sum + r, 0) / newReturns.length || 0;
    const expectedSharpeRatio = expectedVolatility > 0 ? expectedReturn / expectedVolatility : 0;

    return {
      currentPortfolio: portfolio,
      optimizedPortfolio: optimizedPositions,
      expectedReturn: Math.round(expectedReturn * 10000) / 10000,
      expectedVolatility: Math.round(expectedVolatility * 10000) / 10000,
      expectedSharpeRatio: Math.round(expectedSharpeRatio * 100) / 100,
      trades: allTrades,
      estimatedTransactionCost: Math.round(totalTransactionCost * 100) / 100,
      expectedImpactOnRisk,
    };
  }

  static calculateExpectedVolatility(returns: number[]): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length || 0;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length || 0;
    return Math.sqrt(variance);
  }
}
