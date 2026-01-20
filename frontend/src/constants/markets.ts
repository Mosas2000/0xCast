import { MarketStatus, MarketOutcome } from '../types/market';

// Market status constants matching contract values
export const MARKET_STATUS = {
    ACTIVE: MarketStatus.ACTIVE,
    RESOLVED: MarketStatus.RESOLVED,
} as const;

// Market outcome constants matching contract values
export const OUTCOME = {
    NONE: MarketOutcome.NONE,
    YES: MarketOutcome.YES,
    NO: MarketOutcome.NO,
} as const;

// Staking constants (in STX)
export const DEFAULT_STAKE_AMOUNT = 10;
export const MIN_STAKE = 1;
export const MAX_STAKE = 10000;

// Conversion factor: 1 STX = 1,000,000 microSTX
export const MICROSTX_PER_STX = 1_000_000;

// Helper functions for stake conversion
export const stxToMicroStx = (stx: number): number => {
    return Math.floor(stx * MICROSTX_PER_STX);
};

export const microStxToStx = (microStx: number): number => {
    return microStx / MICROSTX_PER_STX;
};

// Status labels for UI
export const STATUS_LABELS = {
    [MarketStatus.ACTIVE]: 'Active',
    [MarketStatus.RESOLVED]: 'Resolved',
} as const;

// Outcome labels for UI
export const OUTCOME_LABELS = {
    [MarketOutcome.NONE]: 'Pending',
    [MarketOutcome.YES]: 'Yes',
    [MarketOutcome.NO]: 'No',
} as const;

// Outcome colors for UI (Tailwind classes)
export const OUTCOME_COLORS = {
    [MarketOutcome.NONE]: 'text-slate-400',
    [MarketOutcome.YES]: 'text-green-400',
    [MarketOutcome.NO]: 'text-red-400',
} as const;
