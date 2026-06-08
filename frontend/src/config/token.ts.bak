// Import unified contract configuration
import { 
  TOKEN_CONTRACT, 
  getContractIdentifier,
  CONTRACT_NAMES,
} from './contracts';

// OXC Token Configuration
export const OXC_TOKEN = {
  name: '0xCast Token',
  symbol: 'OXC',
  decimals: 6,
  totalSupply: 100_000_000_000_000n, // 100M with 6 decimals
  
  // Contract addresses (uses unified config)
  contracts: {
    mainnet: {
      oxcast: getContractIdentifier(CONTRACT_NAMES.OXCAST, 'mainnet'),
    },
    testnet: {
      oxcast: getContractIdentifier(CONTRACT_NAMES.OXCAST, 'testnet'),
    },
  },
  
  // Current contract identifier
  get currentContract() {
    return TOKEN_CONTRACT.identifier;
  },
} as const;

// Alias for simpler access
export const OXC_CONFIG = {
  name: OXC_TOKEN.name,
  symbol: OXC_TOKEN.symbol,
  decimals: OXC_TOKEN.decimals,
  totalSupply: OXC_TOKEN.totalSupply,
} as const;

// Network configuration (re-exported from unified source)
export { API_URLS, EXPLORER_URLS, getApiUrl, getNodeUrl } from './network';

// Re-export network from unified source
export { CURRENT_NETWORK } from './contracts';
export type { NetworkType } from './contracts';

// Token distribution
export const TOKEN_DISTRIBUTION = [
  { name: 'Community & Ecosystem', percentage: 40, amount: 40_000_000, vesting: '4-year linear' },
  { name: 'Team & Advisors', percentage: 20, amount: 20_000_000, vesting: '2-year cliff, 4-year vest' },
  { name: 'Treasury', percentage: 20, amount: 20_000_000, vesting: 'DAO controlled' },
  { name: 'Liquidity & Partnerships', percentage: 15, amount: 15_000_000, vesting: 'As needed' },
  { name: 'Initial Distribution', percentage: 5, amount: 5_000_000, vesting: 'Immediate' },
] as const;

// Token utility features
export const TOKEN_UTILITIES = [
  {
    title: 'Governance',
    description: 'Vote on market resolutions, protocol upgrades, and treasury allocation',
    icon: '🗳️',
  },
  {
    title: 'Fee Discounts',
    description: 'Reduced trading fees when paying with OXC tokens',
    icon: '💰',
  },
  {
    title: 'Staking Rewards',
    description: 'Stake OXC to earn platform revenue share',
    icon: '📈',
  },
  {
    title: 'Market Creation',
    description: 'Stake OXC to create new prediction markets',
    icon: '🎯',
  },
] as const;

// Staking configuration
export const STAKING_CONFIG = {
  minStake: 1_000_000n, // 1 OXC
  lockPeriod: 144, // ~1 day in blocks
  rewardRate: 100, // 1% per epoch (basis points)
} as const;

// Format OXC amount for display
export function formatOXC(amount: bigint): string {
  const value = Number(amount) / 1_000_000;
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

// Parse OXC input to micro units
export function parseOXC(value: string): bigint {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) return 0n;
  return BigInt(Math.floor(num * 1_000_000));
}
