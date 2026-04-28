import { describe, it, expect } from 'vitest';
import {
  calculateDailyReward,
  calculateAPY,
  calculateRewardProjection,
  calculateHistoricalAPY,
  estimateRewardsByVolume,
  calculateOptimalLiquidityAmount,
  calculateImpermanentLoss,
  calculateNetReturn,
  formatRewardAmount,
  formatAPY,
  type HistoricalReward,
  type MarketVolume,
} from '../liquidityRewardsCalculator';

describe('liquidityRewardsCalculator', () => {
  describe('calculateDailyReward', () => {
    it('should calculate daily reward correctly', () => {
      const result = calculateDailyReward(1000, 10000, 50000);
      expect(result).toBeCloseTo(15, 1);
    });

    it('should return 0 when total liquidity is 0', () => {
      const result = calculateDailyReward(1000, 0, 50000);
      expect(result).toBe(0);
    });

    it('should return 0 when liquidity amount is 0', () => {
      const result = calculateDailyReward(0, 10000, 50000);
      expect(result).toBe(0);
    });

    it('should handle 100% liquidity share', () => {
      const result = calculateDailyReward(10000, 10000, 50000);
      expect(result).toBeCloseTo(150, 1);
    });
  });

  describe('calculateAPY', () => {
    it('should calculate APY correctly', () => {
      const result = calculateAPY(1000, 10000, 50000);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1000);
    });

    it('should return 0 when liquidity amount is 0', () => {
      const result = calculateAPY(0, 10000, 50000);
      expect(result).toBe(0);
    });

    it('should calculate higher APY for higher volume', () => {
      const apy1 = calculateAPY(1000, 10000, 50000);
      const apy2 = calculateAPY(1000, 10000, 100000);
      expect(apy2).toBeGreaterThan(apy1);
    });

    it('should calculate higher APY for smaller liquidity pool', () => {
      const apy1 = calculateAPY(1000, 10000, 50000);
      const apy2 = calculateAPY(1000, 5000, 50000);
      expect(apy2).toBeGreaterThan(apy1);
    });
  });

  describe('calculateRewardProjection', () => {
    it('should calculate all reward periods correctly', () => {
      const result = calculateRewardProjection(1000, 10000, 50000);

      expect(result.dailyReward).toBeGreaterThan(0);
      expect(result.weeklyReward).toBeCloseTo(result.dailyReward * 7, 1);
      expect(result.monthlyReward).toBeCloseTo(result.dailyReward * 30, 1);
      expect(result.yearlyReward).toBeCloseTo(result.dailyReward * 365, 1);
      expect(result.apy).toBeGreaterThan(0);
      expect(result.estimatedValue).toBeGreaterThan(1000);
    });

    it('should return zero rewards when no liquidity', () => {
      const result = calculateRewardProjection(0, 10000, 50000);

      expect(result.dailyReward).toBe(0);
      expect(result.weeklyReward).toBe(0);
      expect(result.monthlyReward).toBe(0);
      expect(result.yearlyReward).toBe(0);
      expect(result.apy).toBe(0);
    });
  });

  describe('calculateHistoricalAPY', () => {
    it('should calculate historical APY from rewards', () => {
      const rewards: HistoricalReward[] = [
        {
          timestamp: Date.now() - 86400000,
          amount: 10,
          marketId: 1,
          userAddress: 'ST1',
        },
        {
          timestamp: Date.now() - 172800000,
          amount: 12,
          marketId: 1,
          userAddress: 'ST1',
        },
      ];

      const result = calculateHistoricalAPY(rewards, 1000, 7);
      expect(result).toBeGreaterThan(0);
    });

    it('should return 0 when no rewards', () => {
      const result = calculateHistoricalAPY([], 1000, 7);
      expect(result).toBe(0);
    });

    it('should return 0 when liquidity is 0', () => {
      const rewards: HistoricalReward[] = [
        {
          timestamp: Date.now(),
          amount: 10,
          marketId: 1,
          userAddress: 'ST1',
        },
      ];

      const result = calculateHistoricalAPY(rewards, 0, 7);
      expect(result).toBe(0);
    });

    it('should filter rewards by time period', () => {
      const now = Date.now();
      const rewards: HistoricalReward[] = [
        {
          timestamp: now - 86400000,
          amount: 10,
          marketId: 1,
          userAddress: 'ST1',
        },
        {
          timestamp: now - 864000000,
          amount: 100,
          marketId: 1,
          userAddress: 'ST1',
        },
      ];

      const result = calculateHistoricalAPY(rewards, 1000, 7);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('estimateRewardsByVolume', () => {
    it('should estimate rewards based on different volume periods', () => {
      const volume: MarketVolume = {
        marketId: 1,
        volume24h: 50000,
        volume7d: 300000,
        volume30d: 1200000,
        totalVolume: 5000000,
      };

      const result = estimateRewardsByVolume(1000, 10000, volume);

      expect(result.based24h.apy).toBeGreaterThan(0);
      expect(result.based7d.apy).toBeGreaterThan(0);
      expect(result.based30d.apy).toBeGreaterThan(0);
    });

    it('should show different APYs for different volume periods', () => {
      const volume: MarketVolume = {
        marketId: 1,
        volume24h: 100000,
        volume7d: 300000,
        volume30d: 600000,
        totalVolume: 5000000,
      };

      const result = estimateRewardsByVolume(1000, 10000, volume);

      expect(result.based24h.apy).not.toBe(result.based7d.apy);
      expect(result.based7d.apy).not.toBe(result.based30d.apy);
    });
  });

  describe('calculateOptimalLiquidityAmount', () => {
    it('should calculate optimal liquidity for target APY', () => {
      const result = calculateOptimalLiquidityAmount(50, 10000, 50000);
      expect(result).toBeGreaterThan(0);
    });

    it('should return 0 when target APY is 0', () => {
      const result = calculateOptimalLiquidityAmount(0, 10000, 50000);
      expect(result).toBe(0);
    });

    it('should return 0 when daily volume is 0', () => {
      const result = calculateOptimalLiquidityAmount(50, 10000, 0);
      expect(result).toBe(0);
    });

    it('should require more liquidity for higher target APY', () => {
      const result1 = calculateOptimalLiquidityAmount(50, 10000, 50000);
      const result2 = calculateOptimalLiquidityAmount(100, 10000, 50000);
      expect(result2).toBeGreaterThan(result1);
    });
  });

  describe('calculateImpermanentLoss', () => {
    it('should calculate impermanent loss correctly', () => {
      const result = calculateImpermanentLoss(100, 200);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(100);
    });

    it('should return 0 when price unchanged', () => {
      const result = calculateImpermanentLoss(100, 100);
      expect(result).toBeCloseTo(0, 5);
    });

    it('should return 0 when initial price is 0', () => {
      const result = calculateImpermanentLoss(0, 100);
      expect(result).toBe(0);
    });

    it('should return 0 when current price is 0', () => {
      const result = calculateImpermanentLoss(100, 0);
      expect(result).toBe(0);
    });

    it('should calculate same loss for price increase and decrease', () => {
      const loss1 = calculateImpermanentLoss(100, 200);
      const loss2 = calculateImpermanentLoss(100, 50);
      expect(Math.abs(loss1 - loss2)).toBeLessThan(1);
    });
  });

  describe('calculateNetReturn', () => {
    it('should calculate net return including impermanent loss', () => {
      const result = calculateNetReturn(1000, 10000, 50000, 100, 110, 30);
      expect(typeof result).toBe('number');
    });

    it('should show positive return when rewards exceed impermanent loss', () => {
      const result = calculateNetReturn(1000, 10000, 100000, 100, 101, 365);
      expect(result).toBeGreaterThan(0);
    });

    it('should show negative return when impermanent loss exceeds rewards', () => {
      const result = calculateNetReturn(1000, 10000, 1000, 100, 200, 1);
      expect(result).toBeLessThan(0);
    });
  });

  describe('formatRewardAmount', () => {
    it('should format large amounts with M suffix', () => {
      expect(formatRewardAmount(1500000)).toBe('1.50M');
      expect(formatRewardAmount(2000000)).toBe('2.00M');
    });

    it('should format thousands with K suffix', () => {
      expect(formatRewardAmount(1500)).toBe('1.50K');
      expect(formatRewardAmount(2000)).toBe('2.00K');
    });

    it('should format regular amounts with 2 decimals', () => {
      expect(formatRewardAmount(123.456)).toBe('123.46');
      expect(formatRewardAmount(50)).toBe('50.00');
    });

    it('should format small amounts with 6 decimals', () => {
      expect(formatRewardAmount(0.123456)).toBe('0.123456');
      expect(formatRewardAmount(0.001)).toBe('0.001000');
    });
  });

  describe('formatAPY', () => {
    it('should format large APY with K suffix', () => {
      expect(formatAPY(1500)).toBe('1.50K%');
      expect(formatAPY(2000)).toBe('2.00K%');
    });

    it('should format high APY without decimals', () => {
      expect(formatAPY(150)).toBe('150%');
      expect(formatAPY(250)).toBe('250%');
    });

    it('should format medium APY with 2 decimals', () => {
      expect(formatAPY(15.5)).toBe('15.50%');
      expect(formatAPY(25.75)).toBe('25.75%');
    });

    it('should format low APY with 4 decimals', () => {
      expect(formatAPY(0.1234)).toBe('0.1234%');
      expect(formatAPY(0.5678)).toBe('0.5678%');
    });
  });
});
