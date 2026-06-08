export interface PortfolioPosition {
  marketId: string;
  marketName: string;
  outcome: string;
  quantity: number;
  currentPrice: number;
  entryPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
  weight: number;
}

export interface Portfolio {
  userId: string;
  totalValue: number;
  positions: PortfolioPosition[];
  cash: number;
  lastUpdated: Date;
  createdAt: Date;
}

export interface RiskMetrics {
  portfolioId: string;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  beta: number;
  concentration: number;
  diversificationScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  calculatedAt: Date;
}

export interface DiversificationAnalysis {
  currentDiversification: Record<string, number>;
  recommendedDiversification: Record<string, number>;
  diversificationGap: number;
  topPositions: PortfolioPosition[];
  concentrationRisk: number;
  recommendations: string[];
}

export interface RebalancingRecommendation {
  id: string;
  portfolioId: string;
  userId: string;
  marketId: string;
  marketName: string;
  action: 'buy' | 'sell' | 'reduce' | 'increase';
  currentWeight: number;
  recommendedWeight: number;
  suggestedAmount: number;
  suggestedPrice: number;
  expectedImpact: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTransactionCost: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface PerformanceComparison {
  portfolioId: string;
  benchmarkName: string;
  portfolioReturn: number;
  benchmarkReturn: number;
  outperformance: number;
  period: '1m' | '3m' | '6m' | '1y' | 'ytd';
  dataPoints: PerformanceDataPoint[];
}

export interface PerformanceDataPoint {
  date: Date;
  portfolioValue: number;
  benchmarkValue: number;
  portfolioReturn: number;
  benchmarkReturn: number;
}

export interface HistoricalPerformance {
  portfolioId: string;
  userId: string;
  period: '1d' | '1w' | '1m' | '3m' | '6m' | '1y';
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  bestDay: number;
  worstDay: number;
  winRate: number;
  dataPoints: HistoricalDataPoint[];
}

export interface HistoricalDataPoint {
  date: Date;
  value: number;
  change: number;
  changePercentage: number;
}

export interface PortfolioRecommendation {
  id: string;
  portfolioId: string;
  userId: string;
  type: 'rebalancing' | 'diversification' | 'risk_management' | 'opportunity';
  title: string;
  description: string;
  actionItems: RebalancingRecommendation[];
  expectedBenefit: string;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  priority: 'high' | 'medium' | 'low';
  confidenceScore: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface PortfolioOptimizationResult {
  currentPortfolio: Portfolio;
  optimizedPortfolio: PortfolioPosition[];
  expectedReturn: number;
  expectedVolatility: number;
  expectedSharpeRatio: number;
  trades: RebalancingRecommendation[];
  estimatedTransactionCost: number;
  expectedImpactOnRisk: number;
}

export interface AllocationModel {
  name: string;
  description: string;
  allocations: Record<string, number>;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  targetReturn: number;
  targetVolatility: number;
}

export interface PortfolioMetrics {
  portfolioId: string;
  userId: string;
  totalValue: number;
  cash: number;
  numberOfPositions: number;
  largestPosition: number;
  smallestPosition: number;
  averagePosition: number;
  totalReturn: number;
  dayReturn: number;
  weekReturn: number;
  monthReturn: number;
  yearReturn: number;
  riskMetrics: RiskMetrics;
  diversificationScore: number;
  calculatedAt: Date;
}

export interface RecommendationResponse {
  portfolioMetrics: PortfolioMetrics;
  diversificationAnalysis: DiversificationAnalysis;
  recommendations: PortfolioRecommendation[];
  performanceComparison: PerformanceComparison;
  historicalPerformance: HistoricalPerformance;
}
