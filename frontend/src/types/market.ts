// Market status enum matching contract constants
export enum MarketStatus {
    ACTIVE = 0,
    RESOLVED = 1,
}

// Market outcome enum matching contract constants
export enum MarketOutcome {
    NONE = 0,
    YES = 1,
    NO = 2,
}

// Main Market interface
export interface Market {
    id: number;
    question: string;
    creator: string;
    endDate: number; // Block height
    resolutionDate: number; // Block height
    totalYesStake: number; // In microSTX
    totalNoStake: number; // In microSTX
    status: MarketStatus;
    outcome: MarketOutcome;
    createdAt: number; // Block height
}

// User position in a market
export interface Position {
    marketId: number;
    user: string;
    yesStake: number; // In microSTX
    noStake: number; // In microSTX
    claimed: boolean;
}

// Transaction status for UI feedback
export interface TransactionStatus {
    pending: boolean;
    success: boolean;
    error: string | null;
    txId: string | null;
}

