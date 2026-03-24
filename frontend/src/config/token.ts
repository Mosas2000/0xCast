// OXC Token Configuration
export const OXC_TOKEN = {
  name: '0xCast Token',
  symbol: 'OXC',
  decimals: 6,
  totalSupply: 100_000_000_000_000n, // 100M with 6 decimals
  
  // Contract addresses
  contracts: {
    mainnet: {
      token: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.oxc-token',
      staking: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.oxc-staking',
      governance: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.oxc-governance',
      vesting: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.oxc-vesting',
      treasury: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.oxc-treasury',
    },
    testnet: {
      token: 'ST31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQV0E5K9.oxc-token',
      staking: 'ST31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQV0E5K9.oxc-staking',
      governance: 'ST31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQV0E5K9.oxc-governance',
      vesting: 'ST31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQV0E5K9.oxc-vesting',
      treasury: 'ST31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQV0E5K9.oxc-treasury',
    },
  },
} as const;

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
