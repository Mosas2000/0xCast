import type {
  LiquidityPosition,
  HistoricalReward,
  MarketVolume,
} from '@/utils/liquidityRewardsCalculator';
import { GDPRComplianceService } from './GDPRComplianceService';
import { SecureStorageV2Service } from './SecureStorageV2Service';

const STORAGE_KEY_POSITIONS = 'liquidity_positions';
const STORAGE_KEY_REWARDS = 'historical_rewards';
const STORAGE_KEY_VOLUMES = 'market_volumes';

export class LiquidityRewardsService {
  private positions: Map<string, LiquidityPosition[]> = new Map();
  private rewards: HistoricalReward[] = [];
  private volumes: Map<number, MarketVolume> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const positionsData = await SecureStorageV2Service.getItem<Record<string, LiquidityPosition[]>>(
        STORAGE_KEY_POSITIONS
      );
      if (positionsData) {
        this.positions = new Map(Object.entries(positionsData));
      } else {
        const localData = localStorage.getItem(STORAGE_KEY_POSITIONS);
        if (localData) {
          const parsed = JSON.parse(localData);
          this.positions = new Map(Object.entries(parsed));
        }
      }

      const rewardsData = await SecureStorageV2Service.getItem<HistoricalReward[]>(
        STORAGE_KEY_REWARDS
      );
      if (rewardsData) {
        this.rewards = rewardsData;
      } else {
        const localData = localStorage.getItem(STORAGE_KEY_REWARDS);
        if (localData) {
          this.rewards = JSON.parse(localData);
        }
      }

      const volumesData = await SecureStorageV2Service.getItem<Record<string, MarketVolume>>(
        STORAGE_KEY_VOLUMES
      );
      if (volumesData) {
        this.volumes = new Map(
          Object.entries(volumesData).map(([k, v]) => [parseInt(k), v])
        );
      } else {
        const localData = localStorage.getItem(STORAGE_KEY_VOLUMES);
        if (localData) {
          const parsed = JSON.parse(localData);
          this.volumes = new Map(
            Object.entries(parsed).map(([k, v]) => [parseInt(k), v as MarketVolume])
          );
        }
      }
    } catch (error) {
      console.error('Failed to load liquidity data from storage:', error);
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      const consentCheck = GDPRComplianceService.checkConsentForStorage(
        { liquidityData: true },
        'necessary'
      );
      if (!consentCheck.allowed) return;

      const positionsObj = Object.fromEntries(this.positions);
      await SecureStorageV2Service.setItem(STORAGE_KEY_POSITIONS, positionsObj, {
        encrypt: true,
        category: 'necessary',
        expiresIn: 365 * 24 * 60 * 60 * 1000,
      });

      await SecureStorageV2Service.setItem(STORAGE_KEY_REWARDS, this.rewards, {
        encrypt: true,
        category: 'necessary',
        expiresIn: 365 * 24 * 60 * 60 * 1000,
      });

      const volumesObj = Object.fromEntries(this.volumes);
      await SecureStorageV2Service.setItem(STORAGE_KEY_VOLUMES, volumesObj, {
        encrypt: true,
        category: 'necessary',
        expiresIn: 90 * 24 * 60 * 60 * 1000,
      });
    } catch (error) {
      console.error('Failed to save liquidity data to storage:', error);
    }
  }

  addPosition(position: LiquidityPosition): void {
    const userPositions = this.positions.get(position.userAddress) || [];
    userPositions.push(position);
    this.positions.set(position.userAddress, userPositions);
    this.saveToStorage();
  }

  getPositions(userAddress: string): LiquidityPosition[] {
    return this.positions.get(userAddress) || [];
  }

  getPositionsByMarket(userAddress: string, marketId: number): LiquidityPosition[] {
    const userPositions = this.getPositions(userAddress);
    return userPositions.filter((pos) => pos.marketId === marketId);
  }

  getTotalLiquidity(userAddress: string): number {
    const positions = this.getPositions(userAddress);
    return positions.reduce((sum, pos) => sum + pos.amount, 0);
  }

  addReward(reward: HistoricalReward): void {
    this.rewards.push(reward);
    this.saveToStorage();
  }

  getRewards(userAddress: string): HistoricalReward[] {
    return this.rewards.filter((reward) => reward.userAddress === userAddress);
  }

  getRewardsByMarket(userAddress: string, marketId: number): HistoricalReward[] {
    return this.rewards.filter(
      (reward) => reward.userAddress === userAddress && reward.marketId === marketId
    );
  }

  getRewardsByTimeRange(
    userAddress: string,
    startTime: number,
    endTime: number
  ): HistoricalReward[] {
    return this.rewards.filter(
      (reward) =>
        reward.userAddress === userAddress &&
        reward.timestamp >= startTime &&
        reward.timestamp <= endTime
    );
  }

  getTotalRewards(userAddress: string): number {
    const rewards = this.getRewards(userAddress);
    return rewards.reduce((sum, reward) => sum + reward.amount, 0);
  }

  updateMarketVolume(marketId: number, volume: MarketVolume): void {
    this.volumes.set(marketId, volume);
    this.saveToStorage();
  }

  getMarketVolume(marketId: number): MarketVolume | undefined {
    return this.volumes.get(marketId);
  }

  getAllMarketVolumes(): MarketVolume[] {
    return Array.from(this.volumes.values());
  }

  getRewardHistory(
    userAddress: string,
    days: number
  ): { date: string; amount: number }[] {
    const now = Date.now();
    const startTime = now - days * 86400 * 1000;

    const rewards = this.getRewardsByTimeRange(userAddress, startTime, now);

    const dailyRewards = new Map<string, number>();

    rewards.forEach((reward) => {
      const date = new Date(reward.timestamp).toISOString().split('T')[0];
      const current = dailyRewards.get(date) || 0;
      dailyRewards.set(date, current + reward.amount);
    });

    return Array.from(dailyRewards.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  clearUserData(userAddress: string): void {
    this.positions.delete(userAddress);
    this.rewards = this.rewards.filter(
      (reward) => reward.userAddress !== userAddress
    );
    this.saveToStorage();
  }

  async clearAllData(): Promise<void> {
    this.positions.clear();
    this.rewards = [];
    this.volumes.clear();
    localStorage.removeItem(STORAGE_KEY_POSITIONS);
    localStorage.removeItem(STORAGE_KEY_REWARDS);
    localStorage.removeItem(STORAGE_KEY_VOLUMES);
    await SecureStorageV2Service.removeItem(STORAGE_KEY_POSITIONS);
    await SecureStorageV2Service.removeItem(STORAGE_KEY_REWARDS);
    await SecureStorageV2Service.removeItem(STORAGE_KEY_VOLUMES);
  }
}

export const liquidityRewardsService = new LiquidityRewardsService();
