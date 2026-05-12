export const STACKS_BLOCK_TIME_MINUTES = 10;

export const STACKS_BLOCKS_PER_HOUR = 6;

export const STACKS_BLOCKS_PER_DAY = 144;

export const STACKS_BLOCKS_PER_WEEK = 1008;

export const STACKS_BLOCKS_PER_MONTH = 4320;

export const STACKS_BLOCKS_PER_YEAR = 52560;

export const HIRO_API_ENDPOINTS = {
    mainnet: 'https://api.mainnet.hiro.so/v2/info',
    testnet: 'https://api.testnet.hiro.so/v2/info',
    devnet: 'http://localhost:3999/v2/info',
} as const;

export const DEFAULT_RETRY_CONFIG = {
    maxRetries: 3,
    retryDelayMs: 2000,
    timeoutMs: 5000,
} as const;

export const CACHE_CONFIG = {
    ttlMs: 60000,
    enabled: true,
} as const;

export const MARKET_DURATION_PRESETS = {
    short: 7,
    medium: 30,
    long: 90,
    veryLong: 180,
} as const;

export const RESOLUTION_BUFFER_PRESETS = {
    minimal: 1,
    standard: 3,
    extended: 7,
} as const;
