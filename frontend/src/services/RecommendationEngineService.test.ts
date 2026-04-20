import { describe, it, expect, beforeEach } from 'vitest';
import { Portfolio } from '../types/portfolio';
import { RecommendationEngineService } from './RecommendationEngineService';

describe('RecommendationEngineService', () => {
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
          weight: 50,
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
          weight: 30,
        },
        {
          marketId: 'sol',
          marketName: 'Solana',
          outcome: 'YES',
          quantity: 100,
          currentPrice: 100,
          entryPrice: 80,
          currentValue: 10000,
          pnl: 2000,
          pnlPercentage: 25,
          weight: 20,
        },
      ],
      lastUpdated: new Date(),
      createdAt: new Date(),
    };
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations for portfolio', () => {
      const recommendations = RecommendationEngineService.generateRecommendations(mockPortfolio);

      expect(Array.isArray(recommendations)).toBe(true);
      recommendations.forEach((rec) => {
        expect(rec.id).toBeDefined();
        expect(rec.type).toBeDefined();
        expect(rec.title).toBeDefined();
        expect(['high', 'medium', 'low']).toContain(rec.priority);
      });
    });

    it('should include action items in recommendations', () => {
      const recommendations = RecommendationEngineService.generateRecommendations(mockPortfolio);

      const hasActions = recommendations.some((rec) => rec.actionItems.length > 0);
      expect(hasActions).toBe(true);
    });
  });

  describe('generateRebalancingRecommendations', () => {
    it('should detect weight deviations', () => {
      const recs = RecommendationEngineService.generateRebalancingRecommendations(mockPortfolio);

      if (recs.length > 0) {
        recs.forEach((rec) => {
          expect(['buy', 'sell', 'reduce', 'increase']).toContain(rec.action);
          expect(rec.marketId).toBeDefined();
          expect(rec.suggestedAmount).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('generateDiversificationRecommendations', () => {
    it('should identify diversification opportunities', () => {
      const recs = RecommendationEngineService.generateDiversificationRecommendations(mockPortfolio);

      if (mockPortfolio.positions.length < 5) {
        const hasExpand = recs.some((rec) => rec.action === 'buy');
        expect(hasExpand).toBe(true);
      }
    });
  });

  describe('generateRiskManagementRecommendations', () => {
    it('should identify risk management needs', () => {
      const riskPortfolio = {
        ...mockPortfolio,
        positions: [
          ...mockPortfolio.positions,
          {
            marketId: 'loss',
            marketName: 'Loss Position',
            outcome: 'YES',
            quantity: 100,
            currentPrice: 50,
            entryPrice: 100,
            currentValue: 5000,
            pnl: -5000,
            pnlPercentage: -50,
            weight: 10,
          },
        ],
      };

      const recs = RecommendationEngineService.generateRiskManagementRecommendations(riskPortfolio);

      if (riskPortfolio.positions.some((p) => p.pnlPercentage < -10)) {
        expect(recs.length).toBeGreaterThan(0);
      }
    });
  });

  describe('generateOpportunityRecommendations', () => {
    it('should identify winning positions', () => {
      const winningPortfolio = {
        ...mockPortfolio,
        positions: [
          ...mockPortfolio.positions.map((p) => ({
            ...p,
            pnlPercentage: 5,
          })),
          {
            marketId: 'winner',
            marketName: 'Winner',
            outcome: 'YES',
            quantity: 10,
            currentPrice: 100,
            entryPrice: 50,
            currentValue: 1000,
            pnl: 500,
            pnlPercentage: 100,
            weight: 2,
          },
        ],
      };

      const recs = RecommendationEngineService.generateOpportunityRecommendations(winningPortfolio);

      const hasIncrease = recs.some((rec) => rec.action === 'increase');
      expect(hasIncrease).toBe(true);
    });
  });

  describe('optimizePortfolio', () => {
    it('should generate optimization result', () => {
      const result = RecommendationEngineService.optimizePortfolio(mockPortfolio);

      expect(result.currentPortfolio).toBeDefined();
      expect(result.optimizedPortfolio).toBeDefined();
      expect(result.expectedReturn).toBeDefined();
      expect(result.expectedVolatility).toBeDefined();
      expect(result.expectedSharpeRatio).toBeDefined();
      expect(result.trades).toBeDefined();
      expect(result.estimatedTransactionCost).toBeGreaterThanOrEqual(0);
    });

    it('should provide trade recommendations', () => {
      const result = RecommendationEngineService.optimizePortfolio(mockPortfolio);

      result.trades.forEach((trade) => {
        expect(['buy', 'sell', 'reduce', 'increase']).toContain(trade.action);
        expect(trade.suggestedAmount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('calculateConfidenceScore', () => {
    it('should calculate confidence between 0 and 1', () => {
      const actions = [
        {
          id: 'action1',
          portfolioId: 'port1',
          userId: 'user1',
          marketId: 'btc',
          marketName: 'Bitcoin',
          action: 'buy' as const,
          currentWeight: 0,
          recommendedWeight: 10,
          suggestedAmount: 5000,
          suggestedPrice: 45000,
          expectedImpact: 5,
          reason: 'Test',
          priority: 'medium' as const,
          estimatedTransactionCost: 5,
          createdAt: new Date(),
          expiresAt: new Date(),
        },
      ];

      const confidence = RecommendationEngineService.calculateConfidenceScore(actions);

      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });
  });
});
