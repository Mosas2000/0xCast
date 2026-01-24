export interface MultiOutcome {
  name: string;
  index: number;
  stake: number;
  odds: number;
}

export interface MultiMarket {
  id: number;
  question: string;
  creator: string;
  outcomes: MultiOutcome[];
  outcomeCount: number;
  endDate: number;
  resolutionDate: number;
  status: number;
  winningOutcome?: number;
  createdAt: number;
  totalPool: number;
}

export interface UserMultiPosition {
  marketId: number;
  outcomeIndex: number;
  stake: number;
  claimed: boolean;
}
