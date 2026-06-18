import { describe, it, expect, beforeEach } from 'vitest';
import { LiquidityRewardsService } from '../LiquidityRewardsService';
import type {
  LiquidityPosition,
  HistoricalReward,
  MarketVolume,
} from '../../utils/liquidityRewardsCalculator';

describe('LiquidityRewardsService', () => {
  let service: LiquidityRewardsService;

  beforeEach(() => {
    localStorage.clear();
    service = new LiquidityRewardsService();
  });

  describe('addPosition', () => {
    it('should add a liquidity position', () => {
      const position: LiquidityPosition = {
        amount: 1000,
        marketId: 1,
        timestamp: Date.now(),
        userAddress: 'ST1',
      };

      service.addPosition(position);
      const positions = service.getPositions('ST1');

      expect(positions).toHaveLength(1);
      expect(positions[0]).toEqual(position);
    });

    it('should add multiple positions for same user', () => {
      const position1: LiquidityPosition = {
        amount: 1000,
        marketId: 1,
        timestamp: Date.now(),
        userAddress: 'ST1',
      };

      const position2: LiquidityPosition = {
        amount: 2000,
        marketId: 2,
        timestamp: Date.now(),
        userAddress: 'ST1',
      };

      service.addPosition(position1);
      service.addPosition(position2);

      const positions = service.getPositions('ST1');
      expect(positions).toHaveLength(2);
    });
  });

  describe('getPositions', () => {
    it('should return empty array for user with no positions', () => {
      const positions = service.getPositions('ST1');
      expect(positions).toEqual([]);
    });

    it('should return only positions for specified user', () => {
      const position1: LiquidityPosition = {
        amount: 1000,
        marketId: 1,
        timestamp: Date.now(),
        userAddress: 'ST1',
      };

      const position2: LiquidityPosition = {
        amount: 2000,
        marketId: 1,
        timestamp: Date.now(),
        userAddress: 'ST2',
      };

      service.addPosition(position1);
      service.addPosition(position2);

      const positions = service.getPositions('ST1');
      expect(positions).toHaveLength(1);
      expect(positions[0].userAddress).toBe('ST1');
    });
  });

  describe('getPositionsByMarket', () => {
    it('should return positions for specific market', () => {
      const position1: LiquidityPosition = {
        amount: 1000,
        marketId: 1,
        timestamp: Date.now(),
        userAddress: 'ST1',
      };

      const position2: LiquidityPosition = {
        amount: 2000,
        marketId: 2,
        timestamp: Date.now(),
        userAddress: 'ST1',
      };

      service.addPosition(position1);
      service.addPosition(position2);

      const positions = service.getPositionsByMarket('ST1', 1);
      expect(positions).toHaveLength(1);
      expect(positions[0].marketId).toBe(1);
    });
  });

  describe('getTotalLiquidity', () => {
    it('should calculate total liquidity for user', () => {
      const position1: LiquidityPosition = {
        amount: 1000,
        marketId: 1,
        timestamp: Date.now(),
        userAddress: 'ST1',
      };

      const position2: LiquidityPosition = {
        amount: 2000,
        marketId: 2,
        timestamp: Date.now(),
        userAddress: 'ST1',
      };

      service.addPosition(position1);
      service.addPosition(position2);

      const total = service.getTotalLiquidity('ST1');
      expect(total).toBe(3000);
    });

    it('should return 0 for user with no positions', () => {
      const total = service.getTotalLiquidity('ST1');
      expect(total).toBe(0);
    });
  });

  describe('addReward', () => {
    it('should add a reward', () => {
      const reward: HistoricalReward = {
        timestamp: Date.now(),
        amount: 10,
        marketId: 1,
        userAddress: 'ST1',
      };

      service.addReward(reward);
      const rewards = service.getRewards('ST1');

      expect(rewards).toHaveLength(1);
      expect(rewards[0]).toEqual(reward);
    });
  });

  describe('getRewards', () => {
    it('should return rewards for specific user', () => {
      const reward1: HistoricalReward = {
        timestamp: Date.now(),
        amount: 10,
        marketId: 1,
        userAddress: 'ST1',
      };

      const reward2: HistoricalReward = {
        timestamp: Date.now(),
        amount: 20,
        marketId: 1,
        userAddress: 'ST2',
      };

      service.addReward(reward1);
      service.addReward(reward2);

      const rewards = service.getRewards('ST1');
      expect(rewards).toHaveLength(1);
      expect(rewards[0].userAddress).toBe('ST1');
    });
  });

  describe('getRewardsByMarket', () => {
    it('should return rewards for specific market', () => {
      const reward1: HistoricalReward = {
        timestamp: Date.now(),
        amount: 10,
        marketId: 1,
        userAddress: 'ST1',
      };

      const reward2: HistoricalReward = {
        timestamp: Date.now(),
        amount: 20,
        marketId: 2,
        userAddress: 'ST1',
      };

      service.addReward(reward1);
      service.addReward(reward2);

      const rewards = service.getRewardsByMarket('ST1', 1);
      expect(rewards).toHaveLength(1);
      expect(rewards[0].marketId).toBe(1);
    });
  });

  describe('getRewardsByTimeRange', () => {
    it('should return rewards within time range', () => {
      const now = Date.now();

      const reward1: HistoricalReward = {
        timestamp: now - 86400000,
        amount: 10,
        marketId: 1,
        userAddress: 'ST1',
      };

      const reward2: HistoricalReward = {
        timestamp: now - 172800000,
        amount: 20,
        marketId: 1,
        userAddress: 'ST1',
      };

      service.addReward(reward1);
      service.addReward(reward2);

      const rewards = service.getRewardsByTimeRange(
        'ST1',
        now - 100000000,
        now
      );

      expect(rewards).toHaveLength(2);
    });

    it('should filter out rewards outside time range', () => {
      const now = Date.now();

      const reward1: HistoricalReward = {
        timestamp: now - 86400000,
        amount: 10,
        marketId: 1,
        userAddress: 'ST1',
      };

      const reward2: HistoricalReward = {
        timestamp: now - 864000000,
        amount: 20,
        marketId: 1,
        userAddress: 'ST1',
      };

      service.addReward(reward1);
      service.addReward(reward2);

      const rewards = service.getRewardsByTimeRange(
        'ST1',
        now - 100000000,
        now
      );

      expect(rewards).toHaveLength(1);
      expect(rewards[0].timestamp).toBe(reward1.timestamp);
    });
  });

  describe('getTotalRewards', () => {
    it('should calculate total rewards for user', () => {
      const reward1: HistoricalReward = {
        timestamp: Date.now(),
        amount: 10,
        marketId: 1,
        userAddress: 'ST1',
      };

      const reward2: HistoricalReward = {
        timestamp: Date.now(),
        amount: 20,
        marketId: 1,
        userAddress: 'ST1',
      };

      service.addReward(reward1);
      service.addReward(reward2);

      const total = service.getTotalRewards('ST1');
      expect(total).toBe(30);
    });

    it('should return 0 for user with no rewards', () => {
      const total = service.getTotalRewards('ST1');
      expect(total).toBe(0);
    });
  });

  describe('updateMarketVolume', () => {
    it('should update market volume', () => {
      const volume: MarketVolume = {
        marketId: 1,
        volume24h: 50000,
        volume7d: 300000,
        volume30d: 1200000,
        totalVolume: 5000000,
      };

      service.updateMarketVolume(1, volume);
      const retrieved = service.getMarketVolume(1);

      expect(retrieved).toEqual(volume);
    });
  });

  describe('getMarketVolume', () => {
    it('should return undefined for non-existent market', () => {
      const volume = service.getMarketVolume(999);
      expect(volume).toBeUndefined();
    });
  });

  describe('getAllMarketVolumes', () => {
    it('should return all market volumes', () => {
      const volume1: MarketVolume = {
        marketId: 1,
        volume24h: 50000,
        volume7d: 300000,
        volume30d: 1200000,
        totalVolume: 5000000,
      };

      const volume2: MarketVolume = {
        marketId: 2,
        volume24h: 60000,
        volume7d: 400000,
        volume30d: 1500000,
        totalVolume: 6000000,
      };

      service.updateMarketVolume(1, volume1);
      service.updateMarketVolume(2, volume2);

      const volumes = service.getAllMarketVolumes();
      expect(volumes).toHaveLength(2);
    });
  });

  describe('getRewardHistory', () => {
    it('should return daily aggregated rewards', () => {
      const now = Date.now();
      const today = new Date(now).toISOString().split('T')[0];

      const reward1: HistoricalReward = {
        timestamp: now,
        amount: 10,
        marketId: 1,
        userAddress: 'ST1',
      };

      const reward2: HistoricalReward = {
        timestamp: now - 1000,
        amount: 5,
        marketId: 1,
        userAddress: 'ST1',
      };

      service.addReward(reward1);
      service.addReward(reward2);

      const history = service.getRewardHistory('ST1', 7);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].date).toBe(today);
      expect(history[0].amount).toBe(15);
    });
  });

  describe('clearUserData', () => {
    it('should clear all data for specific user', () => {
      const position: LiquidityPosition = {
        amount: 1000,
        marketId: 1,
        timestamp: Date.now(),
        userAddress: 'ST1',
      };

      const reward: HistoricalReward = {
        timestamp: Date.now(),
        amount: 10,
        marketId: 1,
        userAddress: 'ST1',
      };

      service.addPosition(position);
      service.addReward(reward);

      service.clearUserData('ST1');

      expect(service.getPositions('ST1')).toHaveLength(0);
      expect(service.getRewards('ST1')).toHaveLength(0);
    });
  });

  describe('clearAllData', () => {
    it('should clear all data', () => {
      const position: LiquidityPosition = {
        amount: 1000,
        marketId: 1,
        timestamp: Date.now(),
        userAddress: 'ST1',
      };

      const reward: HistoricalReward = {
        timestamp: Date.now(),
        amount: 10,
        marketId: 1,
        userAddress: 'ST1',
      };

      const volume: MarketVolume = {
        marketId: 1,
        volume24h: 50000,
        volume7d: 300000,
        volume30d: 1200000,
        totalVolume: 5000000,
      };

      service.addPosition(position);
      service.addReward(reward);
      service.updateMarketVolume(1, volume);

      service.clearAllData();

      expect(service.getPositions('ST1')).toHaveLength(0);
      expect(service.getRewards('ST1')).toHaveLength(0);
      expect(service.getAllMarketVolumes()).toHaveLength(0);
    });
  });

  describe('persistence', () => {
    it('should persist data to localStorage', () => {
      const position: LiquidityPosition = {
        amount: 1000,
        marketId: 1,
        timestamp: Date.now(),
        userAddress: 'ST1',
      };

      service.addPosition(position);

      const stored = localStorage.getItem('liquidity_positions');
      expect(stored).toBeDefined();
    });

    it('should load data from localStorage', () => {
      const position: LiquidityPosition = {
        amount: 1000,
        marketId: 1,
        timestamp: Date.now(),
        userAddress: 'ST1',
      };

      service.addPosition(position);

      const newService = new LiquidityRewardsService();
      const positions = newService.getPositions('ST1');

      expect(positions).toHaveLength(1);
      expect(positions[0].amount).toBe(1000);
    });
  });
});
