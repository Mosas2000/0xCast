// Format utilities for staking display
import { OXC_CONFIG } from '@/config/token';

// Format OXC amount with proper decimals
export function formatOxcAmount(amount: bigint, decimals: number = 2): string {
  const value = Number(amount) / Math.pow(10, OXC_CONFIG.decimals);
  
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(decimals)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}

// Parse OXC input string to micro units (bigint)
export function parseOxcInput(value: string): bigint {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) return 0n;
  return BigInt(Math.floor(num * Math.pow(10, OXC_CONFIG.decimals)));
}

// Format block height to estimated time
export function formatBlocksToTime(blocks: number): string {
  // Approximately 10 minutes per block on Stacks
  const totalMinutes = blocks * 10;
  
  if (totalMinutes < 60) {
    return `${totalMinutes} minutes`;
  }
  
  const hours = Math.floor(totalMinutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''}`;
}

// Calculate estimated APY based on staking parameters
export function calculateEstimatedApy(
  userStake: bigint,
  totalStaked: bigint,
  rewardRate: number = 100 // basis points per epoch
): number {
  if (totalStaked === 0n || userStake === 0n) return 0;
  
  // Simplified APY calculation
  // Real APY would depend on actual reward distribution
  const epochsPerYear = 365; // Assuming daily epochs
  const baseApy = (rewardRate / 10000) * epochsPerYear * 100;
  
  return Math.min(baseApy, 50); // Cap at 50% for display
}

// Format lock status message
export function formatLockStatus(
  currentBlock: number,
  lockedUntil: number
): { isLocked: boolean; message: string; blocksRemaining: number } {
  if (currentBlock >= lockedUntil || lockedUntil === 0) {
    return {
      isLocked: false,
      message: 'Unlocked',
      blocksRemaining: 0,
    };
  }
  
  const blocksRemaining = lockedUntil - currentBlock;
  const timeRemaining = formatBlocksToTime(blocksRemaining);
  
  return {
    isLocked: true,
    message: `Locked for ~${timeRemaining}`,
    blocksRemaining,
  };
}
