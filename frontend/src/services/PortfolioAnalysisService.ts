import {
  Portfolio,
  PortfolioPosition,
  RiskMetrics,
  PortfolioMetrics,
  DiversificationAnalysis,
  HistoricalPerformance,
  HistoricalDataPoint,
} from '../types/portfolio';

export class PortfolioAnalysisService {
  static analyzePortfolio(portfolio: Portfolio): PortfolioMetrics {
    const positions = portfolio.positions;
    const totalValue = portfolio.totalValue;

    const numberOfPositions = positions.length;
    const values = positions.map((p) => p.currentValue);

    const largestPosition = Math.max(...values);
    const smallestPosition = Math.min(...values);
    const averagePosition = totalValue / (numberOfPositions || 1);

    const dayReturn = this.calculateReturn(positions, '1d');
    const weekReturn = this.calculateReturn(positions, '1w');
    const monthReturn = this.calculateReturn(positions, '1m');
    const yearReturn = this.calculateReturn(positions, '1y');

    const totalReturn = positions.reduce((sum, p) => sum + p.pnl, 0);

    const riskMetrics = this.calculateRiskMetrics(portfolio);
    const diversificationScore = this.calculateDiversificationScore(positions);

    return {
      portfolioId: `portfolio_${portfolio.userId}`,
      userId: portfolio.userId,
      totalValue,
      cash: portfolio.cash,
      numberOfPositions,
      largestPosition,
      smallestPosition,
      averagePosition,
      totalReturn,
      dayReturn,
      weekReturn,
      monthReturn,
      yearReturn,
      riskMetrics,
      diversificationScore,
      calculatedAt: new Date(),
    };
  }

  static calculateRiskMetrics(portfolio: Portfolio): RiskMetrics {
    const positions = portfolio.positions;
    const returns = positions.map((p) => p.pnlPercentage);

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length || 0;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length || 0;
    const volatility = Math.sqrt(variance);

    const riskFreeRate = 0.02;
    const annualizedReturn = (mean * 252) / 100;
    const annualizedVolatility = volatility * Math.sqrt(252);
    const sharpeRatio = annualizedVolatility > 0 ? (annualizedReturn - riskFreeRate) / annualizedVolatility : 0;

    const maxDrawdown = this.calculateMaxDrawdown(positions);
    const concentration = this.calculateConcentration(positions);
    const diversificationScore = this.calculateDiversificationScore(positions);

    const beta = this.calculateBeta(returns);

    const riskLevel = this.determineRiskLevel(volatility, concentration);

    return {
      portfolioId: `portfolio_${portfolio.userId}`,
      volatility: Math.round(volatility * 10000) / 10000,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      beta: Math.round(beta * 100) / 100,
      concentration,
      diversificationScore,
      riskLevel,
      calculatedAt: new Date(),
    };
  }

  static calculateDiversificationScore(positions: PortfolioPosition[]): number {
    if (positions.length === 0) return 0;

    const weights = positions.map((p) => p.weight);
    const herfindahlIndex = weights.reduce((sum, w) => sum + Math.pow(w, 2), 0);
    const maxHerfindahl = 1;
    const minHerfindahl = 1 / positions.length;

    const diversificationScore = ((maxHerfindahl - herfindahlIndex) / (maxHerfindahl - minHerfindahl)) * 100;

    return Math.max(0, Math.min(100, diversificationScore));
  }

  static calculateConcentration(positions: PortfolioPosition[]): number {
    const weights = positions.map((p) => p.weight);
    const topThreeWeight = weights.sort((a, b) => b - a).slice(0, 3).reduce((sum, w) => sum + w, 0);
    return topThreeWeight;
  }

  static calculateMaxDrawdown(positions: PortfolioPosition[]): number {
    let maxDrawdown = 0;
    let peak = 0;

    for (const position of positions) {
      peak = Math.max(peak, position.currentValue);
      const drawdown = (peak - position.currentValue) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown;
  }

  static calculateBeta(returns: number[]): number {
    const marketReturn = 0.08;
    const benchmarkVolatility = 0.15;

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length || 0;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length || 0;
    const volatility = Math.sqrt(variance);

    const covariance = volatility * benchmarkVolatility * 0.7;
    const marketVariance = Math.pow(benchmarkVolatility, 2);

    return marketVariance > 0 ? covariance / marketVariance : 1;
  }

  static calculateReturn(positions: PortfolioPosition[], period: '1d' | '1w' | '1m' | '1y'): number {
    const periodMultiplier = {
      '1d': 1,
      '1w': 5,
      '1m': 21,
      '1y': 252,
    };

    const avgReturn = positions.reduce((sum, p) => sum + p.pnlPercentage, 0) / positions.length || 0;
    return avgReturn * (periodMultiplier[period] / 252);
  }

  static analyzeDiversification(portfolio: Portfolio): DiversificationAnalysis {
    const positions = portfolio.positions;
    const totalValue = portfolio.totalValue;

    const currentDiversification: Record<string, number> = {};
    positions.forEach((p) => {
      currentDiversification[p.outcome] = (currentDiversification[p.outcome] || 0) + p.weight;
    });

    const recommendedDiversification = this.getRecommendedAllocation(positions.length);

    const diversificationGap = this.calculateDiversificationGap(currentDiversification, recommendedDiversification);

    const topPositions = positions.sort((a, b) => b.currentValue - a.currentValue).slice(0, 3);

    const concentrationRisk = this.calculateConcentration(positions);

    const recommendations: string[] = [];

    if (concentrationRisk > 0.6) {
      recommendations.push('High concentration risk detected. Consider reducing top positions.');
    }

    if (positions.length < 3) {
      recommendations.push('Portfolio lacks diversification. Add more positions.');
    }

    const volatility = positions.reduce((sum, p) => sum + p.pnlPercentage, 0) / positions.length || 0;
    if (Math.abs(volatility) > 20) {
      recommendations.push('High volatility detected. Consider defensive positions.');
    }

    return {
      currentDiversification,
      recommendedDiversification,
      diversificationGap,
      topPositions,
      concentrationRisk,
      recommendations,
    };
  }

  static getRecommendedAllocation(positionCount: number): Record<string, number> {
    const targetAllocation: Record<string, number> = {};
    const allocation = 100 / Math.max(positionCount, 1);

    for (let i = 0; i < positionCount; i++) {
      targetAllocation[`position_${i}`] = allocation;
    }

    return targetAllocation;
  }

  static calculateDiversificationGap(
    current: Record<string, number>,
    recommended: Record<string, number>
  ): number {
    let gap = 0;
    const allKeys = new Set([...Object.keys(current), ...Object.keys(recommended)]);

    for (const key of allKeys) {
      const currentValue = current[key] || 0;
      const recommendedValue = recommended[key] || 0;
      gap += Math.abs(currentValue - recommendedValue);
    }

    return gap / 2;
  }

  static determineRiskLevel(volatility: number, concentration: number): 'low' | 'medium' | 'high' {
    const riskScore = volatility * 0.5 + concentration * 0.5;

    if (riskScore < 0.2) return 'low';
    if (riskScore < 0.5) return 'medium';
    return 'high';
  }

  static generateHistoricalPerformance(
    portfolio: Portfolio,
    period: '1d' | '1w' | '1m' | '3m' | '6m' | '1y'
  ): HistoricalPerformance {
    const dataPoints = this.generateHistoricalDataPoints(portfolio, period);

    const returns = dataPoints.map((dp) => dp.changePercentage);
    const values = dataPoints.map((dp) => dp.value);

    const totalReturn = (values[values.length - 1] - values[0]) / values[0];
    const annualizedReturn = this.annualizeReturn(totalReturn, period);

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length || 0;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length || 0;
    const volatility = Math.sqrt(variance);

    const riskFreeRate = 0.02;
    const sharpeRatio = volatility > 0 ? (annualizedReturn - riskFreeRate) / volatility : 0;

    const maxDrawdown = this.calculateHistoricalMaxDrawdown(values);
    const bestDay = Math.max(...returns);
    const worstDay = Math.min(...returns);
    const winRate = returns.filter((r) => r > 0).length / returns.length;

    return {
      portfolioId: `portfolio_${portfolio.userId}`,
      userId: portfolio.userId,
      period,
      totalReturn,
      annualizedReturn,
      volatility,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      maxDrawdown,
      bestDay,
      worstDay,
      winRate,
      dataPoints,
    };
  }

  static generateHistoricalDataPoints(portfolio: Portfolio, period: string): HistoricalDataPoint[] {
    const dataPoints: HistoricalDataPoint[] = [];
    const days = this.getPeriodDays(period);

    let baseValue = portfolio.totalValue * 0.9;
    const volatility = 0.02;

    for (let i = 0; i < days; i++) {
      const randomReturn = (Math.random() - 0.5) * volatility;
      baseValue *= 1 + randomReturn;

      const date = new Date();
      date.setDate(date.getDate() - (days - i));

      const previousValue = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].value : baseValue;
      const change = baseValue - previousValue;
      const changePercentage = change / previousValue;

      dataPoints.push({
        date,
        value: Math.round(baseValue * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercentage: Math.round(changePercentage * 10000) / 10000,
      });
    }

    return dataPoints;
  }

  static getPeriodDays(period: string): number {
    const periods = {
      '1d': 1,
      '1w': 5,
      '1m': 21,
      '3m': 63,
      '6m': 126,
      '1y': 252,
    };

    return periods[period as keyof typeof periods] || 21;
  }

  static calculateHistoricalMaxDrawdown(values: number[]): number {
    let maxDrawdown = 0;
    let peak = values[0];

    for (const value of values) {
      peak = Math.max(peak, value);
      const drawdown = (peak - value) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown;
  }

  static annualizeReturn(totalReturn: number, period: string): number {
    const periods = {
      '1d': 252,
      '1w': 52,
      '1m': 12,
      '3m': 4,
      '6m': 2,
      '1y': 1,
    };

    const multiplier = periods[period as keyof typeof periods] || 1;
    return Math.pow(1 + totalReturn, multiplier) - 1;
  }
}
