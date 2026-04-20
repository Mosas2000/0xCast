import { describe, it, expect, beforeEach } from 'vitest';
import { Portfolio, PortfolioPosition } from '../types/portfolio';
import { PortfolioAnalysisService } from './PortfolioAnalysisService';

describe('PortfolioAnalysisService', () => {
  let mockPortfolio: Portfolio;

  beforeEach(() => {
    mockPortfolio = {
      userId: 'user123',
      totalValue: 50000,
      cash: 5000,
      positions: [
        {
          marketId: 'btc',
          marketName: 'Bitcoin',
          outcome: 'YES',
          quantity: 0.5,
          currentPrice: 45000,
          entryPrice: 40000,
          currentValue: 22500,
          pnl: 2500,
          pnlPercentage: 12.5,
          weight: 45,
        },
        {
          marketId: 'eth',
          marketName: 'Ethereum',
          outcome: 'YES',
          quantity: 5,
          currentPrice: 2500,
          entryPrice: 2000,
          currentValue: 12500,
          pnl: 2500,
          pnlPercentage: 25,
          weight: 25,
        },
        {
          marketId: 'sol',
          marketName: 'Solana',
          outcome: 'YES',
          quantity: 50,
          currentPrice: 100,
          entryPrice: 80,
          currentValue: 5000,
          pnl: 1000,
          pnlPercentage: 25,
          weight: 10,
        },
        {
          marketId: 'other',
          marketName: 'Other Assets',
          outcome: 'YES',
          quantity: 100,
          currentPrice: 50,
          entryPrice: 45,
          currentValue: 5000,
          pnl: 500,
          pnlPercentage: 10,
          weight: 10,
        },
      ],
      lastUpdated: new Date(),
      createdAt: new Date(),
    };
  });

  describe('analyzePortfolio', () => {
    it('should analyze portfolio metrics', () => {
      const metrics = PortfolioAnalysisService.analyzePortfolio(mockPortfolio);

      expect(metrics.userId).toBe('user123');
      expect(metrics.totalValue).toBe(50000);
      expect(metrics.numberOfPositions).toBe(4);
      expect(metrics.cash).toBe(5000);
    });

    it('should calculate correct total return', () => {
      const metrics = PortfolioAnalysisService.analyzePortfolio(mockPortfolio);

      const expectedReturn = mockPortfolio.positions.reduce((sum, p) => sum + p.pnl, 0);
      expect(metrics.totalReturn).toBe(expectedReturn);
    });

    it('should include risk metrics', () => {
      const metrics = PortfolioAnalysisService.analyzePortfolio(mockPortfolio);

      expect(metrics.riskMetrics).toBeDefined();
      expect(metrics.riskMetrics.volatility).toBeDefined();
      expect(metrics.riskMetrics.sharpeRatio).toBeDefined();
    });
  });

  describe('calculateRiskMetrics', () => {
    it('should calculate risk metrics', () => {
      const riskMetrics = PortfolioAnalysisService.calculateRiskMetrics(mockPortfolio);

      expect(riskMetrics.volatility).toBeGreaterThanOrEqual(0);
      expect(riskMetrics.sharpeRatio).toBeDefined();
      expect(riskMetrics.beta).toBeDefined();
      expect(riskMetrics.concentration).toBeGreaterThan(0);
      expect(riskMetrics.diversificationScore).toBeGreaterThanOrEqual(0);
      expect(riskMetrics.diversificationScore).toBeLessThanOrEqual(100);
    });

    it('should determine correct risk level', () => {
      const riskMetrics = PortfolioAnalysisService.calculateRiskMetrics(mockPortfolio);

      expect(['low', 'medium', 'high']).toContain(riskMetrics.riskLevel);
    });
  });

  describe('calculateDiversificationScore', () => {
    it('should calculate diversification score between 0 and 100', () => {
      const score = PortfolioAnalysisService.calculateDiversificationScore(mockPortfolio.positions);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 for empty portfolio', () => {
      const score = PortfolioAnalysisService.calculateDiversificationScore([]);

      expect(score).toBe(0);
    });

    it('should return higher score for more diversified portfolio', () => {
      const concentrated = [
        { ...mockPortfolio.positions[0], weight: 95 } as PortfolioPosition,
        { ...mockPortfolio.positions[1], weight: 5 } as PortfolioPosition,
      ];

      const diversified = [
        { ...mockPortfolio.positions[0], weight: 25 } as PortfolioPosition,
        { ...mockPortfolio.positions[1], weight: 25 } as PortfolioPosition,
        { ...mockPortfolio.positions[2], weight: 25 } as PortfolioPosition,
        { ...mockPortfolio.positions[3], weight: 25 } as PortfolioPosition,
      ];

      const concentratedScore = PortfolioAnalysisService.calculateDiversificationScore(concentrated);
      const diversifiedScore = PortfolioAnalysisService.calculateDiversificationScore(diversified);

      expect(diversifiedScore).toBeGreaterThan(concentratedScore);
    });
  });

  describe('analyzeDiversification', () => {
    it('should analyze diversification', () => {
      const analysis = PortfolioAnalysisService.analyzeDiversification(mockPortfolio);

      expect(analysis.currentDiversification).toBeDefined();
      expect(analysis.recommendedDiversification).toBeDefined();
      expect(analysis.diversificationGap).toBeGreaterThanOrEqual(0);
      expect(analysis.topPositions).toHaveLength(3);
      expect(analysis.concentrationRisk).toBeGreaterThan(0);
      expect(analysis.recommendations).toBeDefined();
    });

    it('should identify concentration risk', () => {
      const analysis = PortfolioAnalysisService.analyzeDiversification(mockPortfolio);

      if (analysis.concentrationRisk > 0.6) {
        expect(analysis.recommendations.some((r) => r.includes('concentration'))).toBe(true);
      }
    });
  });

  describe('generateHistoricalPerformance', () => {
    it('should generate historical performance data', () => {
      const performance = PortfolioAnalysisService.generateHistoricalPerformance(mockPortfolio, '1m');

      expect(performance.userId).toBe('user123');
      expect(performance.period).toBe('1m');
      expect(performance.dataPoints.length).toBeGreaterThan(0);
      expect(performance.totalReturn).toBeDefined();
      expect(performance.volatility).toBeGreaterThanOrEqual(0);
    });

    it('should have increasing data points', () => {
      const performance = PortfolioAnalysisService.generateHistoricalPerformance(mockPortfolio, '1m');

      expect(performance.dataPoints[0].date.getTime()).toBeLessThanOrEqual(
        performance.dataPoints[performance.dataPoints.length - 1].date.getTime()
      );
    });
  });

  describe('calculateConcentration', () => {
    it('should calculate concentration correctly', () => {
      const concentration = PortfolioAnalysisService.calculateConcentration(mockPortfolio.positions);

      expect(concentration).toBeGreaterThan(0);
      expect(concentration).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateMaxDrawdown', () => {
    it('should calculate max drawdown', () => {
      const drawdown = PortfolioAnalysisService.calculateMaxDrawdown(mockPortfolio.positions);

      expect(drawdown).toBeGreaterThanOrEqual(0);
      expect(drawdown).toBeLessThanOrEqual(1);
    });
  });
});
