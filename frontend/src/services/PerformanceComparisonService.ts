import { PortfolioPosition, PerformanceComparison, PerformanceDataPoint } from '@/types/portfolio';

export class PerformanceComparisonService {
  static compareWithBenchmark(
    portfolioReturn: number,
    benchmarkName: string = 'Market Index'
  ): PerformanceComparison {
    const period = '1y';
    const benchmarkReturn = this.generateBenchmarkReturn(benchmarkName);
    const outperformance = portfolioReturn - benchmarkReturn;

    const dataPoints = this.generateComparisonDataPoints(portfolioReturn, benchmarkReturn, period);

    return {
      portfolioId: `portfolio_${Date.now()}`,
      benchmarkName,
      portfolioReturn,
      benchmarkReturn,
      outperformance,
      period: period as '1m' | '3m' | '6m' | '1y' | 'ytd',
      dataPoints,
    };
  }

  static generateBenchmarkReturn(benchmarkName: string): number {
    const benchmarks: Record<string, number> = {
      'SP500': 0.12,
      'NASDAQ': 0.15,
      'Russell 2000': 0.08,
      'Market Index': 0.10,
      'Crypto Index': 0.25,
      'Balanced Index': 0.09,
    };

    return benchmarks[benchmarkName] || 0.10;
  }

  static generateComparisonDataPoints(
    portfolioReturn: number,
    benchmarkReturn: number,
    period: string
  ): PerformanceDataPoint[] {
    const dataPoints: PerformanceDataPoint[] = [];
    const days = this.getPeriodDays(period);

    let portfolioValue = 100;
    let benchmarkValue = 100;
    const portfolioVolatility = 0.015;
    const benchmarkVolatility = 0.012;

    for (let i = 0; i < days; i++) {
      const portfolioDailyReturn = (portfolioReturn / days) + (Math.random() - 0.5) * portfolioVolatility;
      const benchmarkDailyReturn = (benchmarkReturn / days) + (Math.random() - 0.5) * benchmarkVolatility;

      portfolioValue *= 1 + portfolioDailyReturn;
      benchmarkValue *= 1 + benchmarkDailyReturn;

      const date = new Date();
      date.setDate(date.getDate() - (days - i));

      dataPoints.push({
        date,
        portfolioValue: Math.round(portfolioValue * 100) / 100,
        benchmarkValue: Math.round(benchmarkValue * 100) / 100,
        portfolioReturn: Math.round((portfolioValue - 100) * 10000) / 10000,
        benchmarkReturn: Math.round((benchmarkValue - 100) * 10000) / 10000,
      });
    }

    return dataPoints;
  }

  static getPeriodDays(period: string): number {
    const periods: Record<string, number> = {
      '1m': 21,
      '3m': 63,
      '6m': 126,
      '1y': 252,
      'ytd': 252,
    };

    return periods[period] || 252;
  }

  static calculateAlpha(portfolioReturn: number, benchmarkReturn: number, beta: number): number {
    const riskFreeRate = 0.02;
    const expectedReturn = riskFreeRate + beta * (benchmarkReturn - riskFreeRate);
    return portfolioReturn - expectedReturn;
  }

  static calculateInformation(portfolioReturns: number[], benchmarkReturns: number[]): number {
    const trackingError = this.calculateTrackingError(portfolioReturns, benchmarkReturns);
    const informationRatio = trackingError > 0 ? (portfolioReturns[portfolioReturns.length - 1] - benchmarkReturns[benchmarkReturns.length - 1]) / trackingError : 0;
    return informationRatio;
  }

  static calculateTrackingError(portfolioReturns: number[], benchmarkReturns: number[]): number {
    const differences = portfolioReturns.map((pr, i) => pr - (benchmarkReturns[i] || 0));
    const mean = differences.reduce((sum, d) => sum + d, 0) / differences.length || 0;
    const variance = differences.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / differences.length || 0;
    return Math.sqrt(variance);
  }

  static calculateDownsideDeviation(returns: number[], threshold: number = 0): number {
    const downsideReturns = returns.filter((r) => r < threshold);

    if (downsideReturns.length === 0) return 0;

    const variance = downsideReturns.reduce((sum, r) => sum + Math.pow(Math.min(r - threshold, 0), 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  static calculateSortinoRatio(returns: number[], riskFreeRate: number = 0.02): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length || 0;
    const downside = this.calculateDownsideDeviation(returns, riskFreeRate);

    return downside > 0 ? (mean - riskFreeRate) / downside : 0;
  }

  static comparePositionPerformance(positions: PortfolioPosition[]): Record<string, number> {
    const performance: Record<string, number> = {};

    positions.forEach((position) => {
      performance[position.marketName] = position.pnlPercentage;
    });

    return performance;
  }

  static calculateCumulativeReturn(dailyReturns: number[]): number {
    let cumulativeReturn = 1;

    dailyReturns.forEach((dailyReturn) => {
      cumulativeReturn *= 1 + dailyReturn;
    });

    return (cumulativeReturn - 1) * 100;
  }

  static calculateMonthlyReturns(dailyReturns: number[]): number[] {
    const monthlyReturns: number[] = [];
    let monthlyReturn = 1;

    for (let i = 0; i < dailyReturns.length; i++) {
      monthlyReturn *= 1 + dailyReturns[i];

      if ((i + 1) % 21 === 0 || i === dailyReturns.length - 1) {
        monthlyReturns.push((monthlyReturn - 1) * 100);
        monthlyReturn = 1;
      }
    }

    return monthlyReturns;
  }

  static calculateQuarterlyReturns(dailyReturns: number[]): number[] {
    const quarterlyReturns: number[] = [];
    let quarterlyReturn = 1;

    for (let i = 0; i < dailyReturns.length; i++) {
      quarterlyReturn *= 1 + dailyReturns[i];

      if ((i + 1) % 63 === 0 || i === dailyReturns.length - 1) {
        quarterlyReturns.push((quarterlyReturn - 1) * 100);
        quarterlyReturn = 1;
      }
    }

    return quarterlyReturns;
  }

  static calculateConsecutiveWins(dailyReturns: number[]): number {
    let maxConsecutive = 0;
    let currentConsecutive = 0;

    dailyReturns.forEach((dailyReturn) => {
      if (dailyReturn > 0) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    });

    return maxConsecutive;
  }

  static calculateConsecutiveLosses(dailyReturns: number[]): number {
    let maxConsecutive = 0;
    let currentConsecutive = 0;

    dailyReturns.forEach((dailyReturn) => {
      if (dailyReturn < 0) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    });

    return maxConsecutive;
  }

  static generatePerformanceMetrics(
    dailyReturns: number[],
    benchmarkDailyReturns: number[]
  ): Record<string, number> {
    const cumulativeReturn = this.calculateCumulativeReturn(dailyReturns);
    const benchmarkCumulativeReturn = this.calculateCumulativeReturn(benchmarkDailyReturns);

    const volatility = this.calculateVolatility(dailyReturns);
    const benchmarkVolatility = this.calculateVolatility(benchmarkDailyReturns);

    const sharpeRatio = this.calculateSharpeRatio(dailyReturns);
    const sortinoRatio = this.calculateSortinoRatio(dailyReturns);

    const maxDrawdown = this.calculateMaxDrawdown(dailyReturns);
    const winRate = dailyReturns.filter((r) => r > 0).length / dailyReturns.length;

    const consecutiveWins = this.calculateConsecutiveWins(dailyReturns);
    const consecutiveLosses = this.calculateConsecutiveLosses(dailyReturns);

    return {
      cumulativeReturn: Math.round(cumulativeReturn * 100) / 100,
      benchmarkCumulativeReturn: Math.round(benchmarkCumulativeReturn * 100) / 100,
      outperformance: Math.round((cumulativeReturn - benchmarkCumulativeReturn) * 100) / 100,
      volatility: Math.round(volatility * 10000) / 10000,
      benchmarkVolatility: Math.round(benchmarkVolatility * 10000) / 10000,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      sortinoRatio: Math.round(sortinoRatio * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 10000) / 10000,
      winRate: Math.round(winRate * 10000) / 10000,
      consecutiveWins,
      consecutiveLosses,
    };
  }

  static calculateVolatility(returns: number[]): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length || 0;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length || 0;
    return Math.sqrt(variance);
  }

  static calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length || 0;
    const volatility = this.calculateVolatility(returns);

    return volatility > 0 ? (mean - riskFreeRate) / volatility : 0;
  }

  static calculateMaxDrawdown(returns: number[]): number {
    let peak = 0;
    let maxDrawdown = 0;
    let currentValue = 1;

    returns.forEach((dailyReturn) => {
      currentValue *= 1 + dailyReturn;
      peak = Math.max(peak, currentValue);
      const drawdown = (peak - currentValue) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    });

    return maxDrawdown;
  }
}
