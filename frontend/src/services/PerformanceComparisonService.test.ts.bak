import { describe, it, expect } from 'vitest';
import { PerformanceComparisonService } from './PerformanceComparisonService';

describe('PerformanceComparisonService', () => {
  describe('compareWithBenchmark', () => {
    it('should compare portfolio with benchmark', () => {
      const result = PerformanceComparisonService.compareWithBenchmark(0.15, 'SP500');

      expect(result.portfolioId).toBeDefined();
      expect(result.benchmarkName).toBe('SP500');
      expect(result.portfolioReturn).toBe(0.15);
      expect(result.benchmarkReturn).toBeDefined();
      expect(result.outperformance).toBeDefined();
      expect(result.dataPoints).toBeDefined();
      expect(result.dataPoints.length).toBeGreaterThan(0);
    });

    it('should use default benchmark if not provided', () => {
      const result = PerformanceComparisonService.compareWithBenchmark(0.15);

      expect(result.benchmarkName).toBe('Market Index');
    });
  });

  describe('generateBenchmarkReturn', () => {
    it('should return correct benchmark return for known benchmarks', () => {
      expect(PerformanceComparisonService.generateBenchmarkReturn('SP500')).toBe(0.12);
      expect(PerformanceComparisonService.generateBenchmarkReturn('NASDAQ')).toBe(0.15);
      expect(PerformanceComparisonService.generateBenchmarkReturn('Crypto Index')).toBe(0.25);
    });

    it('should return default for unknown benchmark', () => {
      const result = PerformanceComparisonService.generateBenchmarkReturn('Unknown');

      expect(result).toBe(0.10);
    });
  });

  describe('calculateAlpha', () => {
    it('should calculate alpha correctly', () => {
      const alpha = PerformanceComparisonService.calculateAlpha(0.15, 0.10, 1.2);

      expect(typeof alpha).toBe('number');
      expect(alpha).toBeDefined();
    });

    it('should return positive alpha for outperforming portfolio', () => {
      const alpha = PerformanceComparisonService.calculateAlpha(0.20, 0.10, 1.0);

      expect(alpha).toBeGreaterThan(0);
    });
  });

  describe('calculateVolatility', () => {
    it('should calculate volatility from returns', () => {
      const returns = [0.01, -0.02, 0.03, -0.01, 0.02];
      const volatility = PerformanceComparisonService.calculateVolatility(returns);

      expect(volatility).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 for zero returns', () => {
      const returns = [0, 0, 0, 0];
      const volatility = PerformanceComparisonService.calculateVolatility(returns);

      expect(volatility).toBe(0);
    });
  });

  describe('calculateSharpeRatio', () => {
    it('should calculate Sharpe ratio', () => {
      const returns = [0.01, 0.02, 0.015, 0.018, 0.022];
      const sharpeRatio = PerformanceComparisonService.calculateSharpeRatio(returns);

      expect(typeof sharpeRatio).toBe('number');
      expect(sharpeRatio).toBeDefined();
    });
  });

  describe('calculateDownsideDeviation', () => {
    it('should calculate downside deviation', () => {
      const returns = [0.02, -0.01, 0.03, -0.02, 0.01];
      const downside = PerformanceComparisonService.calculateDownsideDeviation(returns);

      expect(downside).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 when no downside', () => {
      const returns = [0.01, 0.02, 0.03];
      const downside = PerformanceComparisonService.calculateDownsideDeviation(returns);

      expect(downside).toBe(0);
    });
  });

  describe('calculateSortinoRatio', () => {
    it('should calculate Sortino ratio', () => {
      const returns = [0.01, 0.02, -0.005, 0.015, 0.025];
      const sortino = PerformanceComparisonService.calculateSortinoRatio(returns);

      expect(typeof sortino).toBe('number');
    });
  });

  describe('calculateCumulativeReturn', () => {
    it('should calculate cumulative return correctly', () => {
      const dailyReturns = [0.01, 0.02, -0.01];
      const cumulative = PerformanceComparisonService.calculateCumulativeReturn(dailyReturns);

      expect(cumulative).toBeGreaterThan(0);
    });

    it('should handle negative returns', () => {
      const dailyReturns = [-0.02, -0.01, 0.005];
      const cumulative = PerformanceComparisonService.calculateCumulativeReturn(dailyReturns);

      expect(cumulative).toBeLessThan(0);
    });
  });

  describe('calculateMaxDrawdown', () => {
    it('should calculate max drawdown', () => {
      const returns = [0.01, 0.02, -0.05, 0.01, 0.02];
      const drawdown = PerformanceComparisonService.calculateMaxDrawdown(returns);

      expect(drawdown).toBeGreaterThanOrEqual(0);
      expect(drawdown).toBeLessThanOrEqual(1);
    });

    it('should return 0 for all positive returns', () => {
      const returns = [0.01, 0.02, 0.03];
      const drawdown = PerformanceComparisonService.calculateMaxDrawdown(returns);

      expect(drawdown).toBe(0);
    });
  });

  describe('calculateConsecutiveWins', () => {
    it('should count consecutive wins', () => {
      const returns = [0.01, 0.02, 0.015, -0.01, 0.02, 0.01];
      const wins = PerformanceComparisonService.calculateConsecutiveWins(returns);

      expect(wins).toBe(3);
    });
  });

  describe('calculateConsecutiveLosses', () => {
    it('should count consecutive losses', () => {
      const returns = [0.01, -0.02, -0.015, 0.01, -0.01, -0.02];
      const losses = PerformanceComparisonService.calculateConsecutiveLosses(returns);

      expect(losses).toBe(2);
    });
  });

  describe('generatePerformanceMetrics', () => {
    it('should generate comprehensive performance metrics', () => {
      const portfolioReturns = [0.01, 0.02, -0.01, 0.015, 0.025];
      const benchmarkReturns = [0.01, 0.01, 0.005, 0.012, 0.018];

      const metrics = PerformanceComparisonService.generatePerformanceMetrics(portfolioReturns, benchmarkReturns);

      expect(metrics.cumulativeReturn).toBeDefined();
      expect(metrics.volatility).toBeDefined();
      expect(metrics.sharpeRatio).toBeDefined();
      expect(metrics.maxDrawdown).toBeDefined();
      expect(metrics.winRate).toBeDefined();
      expect(metrics.consecutiveWins).toBeDefined();
      expect(metrics.consecutiveLosses).toBeDefined();
    });
  });

  describe('calculateMonthlyReturns', () => {
    it('should calculate monthly returns from daily returns', () => {
      const dailyReturns = Array(21).fill(0.001);
      const monthlyReturns = PerformanceComparisonService.calculateMonthlyReturns(dailyReturns);

      expect(monthlyReturns.length).toBeGreaterThan(0);
    });
  });

  describe('calculateQuarterlyReturns', () => {
    it('should calculate quarterly returns from daily returns', () => {
      const dailyReturns = Array(63).fill(0.001);
      const quarterlyReturns = PerformanceComparisonService.calculateQuarterlyReturns(dailyReturns);

      expect(quarterlyReturns.length).toBeGreaterThan(0);
    });
  });
});
