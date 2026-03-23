export const MarketStatus = {
  ACTIVE: 0,
  RESOLVED: 1,
  DISPUTED: 2,
  REFUNDED: 3,
} as const;

export type MarketStatus = typeof MarketStatus[keyof typeof MarketStatus];

export const MarketOutcome = {
  NONE: 0,
  YES: 1,
  NO: 2,
} as const;

export type MarketOutcome = typeof MarketOutcome[keyof typeof MarketOutcome];

export interface Market {
  id: number;
  question: string;
  creator: string;
  endDate: number;
  resolutionDate: number;
  totalYesStake: number;
  totalNoStake: number;
  status: MarketStatus;
  outcome: MarketOutcome;
  createdAt: number;
}

export interface Position {
  marketId: number;
  user: string;
  yesStake: number;
  noStake: number;
  claimed: boolean;
}

export interface TransactionStatus {
  pending: boolean;
  success: boolean;
  error: string | null;
  txId: string | null;
}
