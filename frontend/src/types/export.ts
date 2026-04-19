export const ExportFormat = {
  CSV: 'csv',
  JSON: 'json',
  PDF: 'pdf',
} as const;

export type ExportFormat = typeof ExportFormat[keyof typeof ExportFormat];

export const ExportType = {
  TRANSACTIONS: 'transactions',
  PORTFOLIO: 'portfolio',
  POSITIONS: 'positions',
  REWARDS: 'rewards',
  TAX_REPORT: 'tax_report',
  FULL_HISTORY: 'full_history',
} as const;

export type ExportType = typeof ExportType[keyof typeof ExportType];

export interface ExportOptions {
  format: ExportFormat;
  type: ExportType;
  startDate?: Date;
  endDate?: Date;
  includeMetadata?: boolean;
  compress?: boolean;
}

export interface ExportTransaction {
  id: string;
  date: string;
  type: string;
  marketId: number;
  amount: number;
  outcome: string;
  status: string;
  txHash?: string;
}

export interface ExportPosition {
  id: string;
  marketId: number;
  marketQuestion: string;
  yesStake: number;
  noStake: number;
  currentValue: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportPortfolio {
  totalValue: number;
  totalInvested: number;
  totalWinnings: number;
  positions: number;
  markets: number;
  exportDate: string;
  positions_data: ExportPosition[];
}

export interface ExportReward {
  id: string;
  type: string;
  amount: number;
  source: string;
  date: string;
  description: string;
}

export interface TaxReport {
  year: number;
  totalIncome: number;
  totalLosses: number;
  netGainLoss: number;
  transactions: Array<{
    date: string;
    type: string;
    proceeds: number;
    cost: number;
    gain: number;
  }>;
  generatedAt: string;
}

export interface ScheduledExport {
  id: string;
  userId: string;
  type: ExportType;
  format: ExportFormat;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportProgress {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  error?: string;
  downloadUrl?: string;
}

export interface ExportRequest {
  id: string;
  userId: string;
  type: ExportType;
  format: ExportFormat;
  options: ExportOptions;
  status: ExportProgress;
  createdAt: Date;
  completedAt?: Date;
}
