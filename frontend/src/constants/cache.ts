export const CACHE_TTL = {
  MARKET_DATA: 30 * 1000,
  MARKET_LIST: 60 * 1000,
  USER_DATA: 15 * 1000,
  CONTRACT_READ: 45 * 1000,
  STATIC_DATA: 5 * 60 * 1000,
} as const;

export const CACHE_KEYS = {
  MARKET: (id: number) => `market_${id}`,
  MARKET_LIST: 'market_list',
  USER_STAKE: (marketId: number, address: string) => `user_stake_${marketId}_${address}`,
  USER_BALANCE: (address: string) => `user_balance_${address}`,
  CONTRACT_STATE: 'contract_state',
} as const;

export const CACHE_STORAGE = {
  MEMORY: 'memory',
  SESSION: 'session',
  LOCAL: 'local',
} as const;
