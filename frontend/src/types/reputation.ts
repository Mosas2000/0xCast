export interface ReputationMetrics {
  totalPredictions: number;
  correctPredictions: number;
  totalVolume: number;
  totalStaked?: number;
  winRate?: number;
}

export interface KYCDocument {
  type: 'passport' | 'license' | 'national_id';
  data: KYCDocumentData;
}

export interface KYCDocumentData {
  documentNumber: string;
  fullName: string;
  dateOfBirth: string;
  expiryDate: string;
  issuingCountry: string;
  documentImage?: string;
}

export interface KYCStatus {
  status: 'pending' | 'verified' | 'rejected';
  submittedAt: number;
  reviewedAt?: number;
  reason?: string;
}

export interface SuspiciousActivity {
  id: string;
  userId: string;
  type: 'wash_trading' | 'sybil_attack' | 'pump_dump' | 'price_manipulation';
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  details: string;
}

export interface FraudAlert {
  id: string;
  userId: string;
  type: 'wash_trading' | 'sybil_attack' | 'pump_dump' | 'price_manipulation';
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  details: string;
  resolved: boolean;
}

export interface TransactionForAnalysis {
  id: string;
  userId: string;
  marketId: string;
  amount: number;
  timestamp: number;
  type: 'buy' | 'sell';
  price: number;
}

export interface AccountForAnalysis {
  userId: string;
  address: string;
  createdAt: number;
  ipAddress?: string;
  deviceFingerprint?: string;
}
