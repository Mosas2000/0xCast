import { PostConditionMode } from '@stacks/transactions';

export interface TransactionData {
  id: string;
  type: string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  txId?: string;
}

export interface Portfolio {
  totalValue: number;
  positions: Position[];
  performance: PerformanceMetrics;
}

export interface Position {
  id: string;
  marketId: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  dailyReturn: number;
  weeklyReturn: number;
  monthlyReturn: number;
}

export interface RewardData {
  id: string;
  userId: string;
  amount: number;
  type: string;
  timestamp: number;
  claimed: boolean;
}

export interface ContractCallParams {
  functionName: string;
  functionArgs: unknown[];
  postConditions?: unknown[];
  postConditionMode?: PostConditionMode;
}

export interface Order {
  id: string;
  marketId: string;
  userId: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: number;
}
