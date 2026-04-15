import type { Market, Position } from '../types/market';
import { MarketStatus, MarketOutcome } from '../types/market';
import { microStxToStx } from '../constants';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (isRecord(value) && 'value' in value) {
    return toNumber(value.value, fallback);
  }
  return fallback;
}

export function parseMarketData(marketId: number, rawData: unknown): Market {
  const data = isRecord(rawData) ? rawData : {};

  return {
    id: marketId,
    question: typeof data.question === 'string' ? data.question : '',
    creator: typeof data.creator === 'string' ? data.creator : '',
    endDate: toNumber(data['end-date']),
    resolutionDate: toNumber(data['resolution-date']),
    totalYesStake: toNumber(data['total-yes-stake']),
    totalNoStake: toNumber(data['total-no-stake']),
    status: toNumber(data.status) as MarketStatus,
    outcome: toNumber(data.outcome) as MarketOutcome,
    createdAt: toNumber(data['created-at']),
    paused: data.paused !== undefined ? Boolean(data.paused) : undefined,
  };
}

export function parsePosition(marketId: number, user: string, rawData: unknown): Position {
  const data = isRecord(rawData) ? rawData : {};

  return {
    marketId,
    user,
    yesStake: toNumber(data['yes-stake']),
    noStake: toNumber(data['no-stake']),
    claimed: Boolean(data.claimed),
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
