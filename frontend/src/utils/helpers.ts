import type { Market, Position } from '../types/market';
import { MarketStatus, MarketOutcome } from '../types/market';
import { microStxToStx } from '../constants';

export function parseMarketData(marketId: number, rawData: any): Market {
  return {
    id: marketId,
    question: rawData.question,
    creator: rawData.creator,
    endDate: Number(rawData['end-date']),
    resolutionDate: Number(rawData['resolution-date']),
    totalYesStake: Number(rawData['total-yes-stake']),
    totalNoStake: Number(rawData['total-no-stake']),
    status: Number(rawData.status) as MarketStatus,
    outcome: Number(rawData.outcome) as MarketOutcome,
    createdAt: Number(rawData['created-at']),
  };
}

export function parsePosition(marketId: number, user: string, rawData: any): Position {
  return {
    marketId,
    user,
    yesStake: Number(rawData['yes-stake']),
    noStake: Number(rawData['no-stake']),
    claimed: Boolean(rawData.claimed),
  };
}

export function calculateOdds(yesStake: number, noStake: number): { yes: number; no: number } {
  const total = yesStake + noStake;
  if (total === 0) return { yes: 50, no: 50 };
  
  return {
    yes: Math.round((yesStake / total) * 1000) / 10,
    no: Math.round((noStake / total) * 1000) / 10,
  };
}

export function formatStx(microStx: number | bigint, decimals: number = 2): string {
  const num = typeof microStx === 'bigint' ? Number(microStx) : microStx;
  return `${microStxToStx(num).toFixed(decimals)} STX`;
}

export function formatAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getStatusLabel(status: MarketStatus): string {
  const labels: Record<MarketStatus, string> = {
    [MarketStatus.ACTIVE]: 'Active',
    [MarketStatus.RESOLVED]: 'Resolved',
    [MarketStatus.DISPUTED]: 'Disputed',
    [MarketStatus.REFUNDED]: 'Refunded',
  };
  return labels[status] || 'Unknown';
}

export function getOutcomeLabel(outcome: MarketOutcome): string {
  const labels: Record<MarketOutcome, string> = {
    [MarketOutcome.NONE]: 'Pending',
    [MarketOutcome.YES]: 'Yes',
    [MarketOutcome.NO]: 'No',
  };
  return labels[outcome] || 'Unknown';
}
