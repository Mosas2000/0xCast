import type { Market, Position } from '@/types/market';
import { MarketStatus } from '@/types/market';
import { MarketOutcome } from '@/types/market';
import { microStxToStx } from '../constants';
import { formatNumber } from './i18n/formatters';

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

function toString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value;
  }
  if (isRecord(value) && 'value' in value) {
    return toString(value.value, fallback);
  }
  return fallback;
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (isRecord(value) && 'value' in value) {
    return toBoolean(value.value, fallback);
  }
  return fallback;
}

export function parseMarketData(marketId: number, rawData: unknown): Market {
  let data = isRecord(rawData) ? rawData : {};
  if (
    typeof data.type === 'string' &&
    (data.type === 'tuple' || data.type.startsWith('(tuple')) &&
    isRecord(data.value)
  ) {
    data = data.value;
  }

  return {
    id: String(marketId),
    title: toString(data.question),
    question: toString(data.question),
    description: toString(data.description),
    creator: toString(data.creator),
    endTime: toNumber(data['end-date']),
    endDate: toNumber(data['end-date']),
    resolved: toBoolean(data.finalized) || toBoolean(data.resolved),
    outcome: toNumber(data.outcome) as MarketOutcome,
    totalYesStake: toNumber(data['total-yes-stake']),
    totalNoStake: toNumber(data['total-no-stake']),
    status: toNumber(data.status) as MarketStatus,
    totalVolume: toNumber(data['total-yes-stake']) + toNumber(data['total-no-stake']),
    currentPrice: 0.5, // Default, should be calculated
    createdAt: toNumber(data['created-at']),
  };
}

export function parsePosition(marketId: string, rawData: unknown): Position {
  let data = isRecord(rawData) ? rawData : {};
  if (
    typeof data.type === 'string' &&
    (data.type === 'tuple' || data.type.startsWith('(tuple')) &&
    isRecord(data.value)
  ) {
    data = data.value;
  }

  return {
    marketId,
    outcome: toNumber(data.outcome),
    amount: toNumber(data.amount),
    shares: toNumber(data.shares),
    timestamp: toNumber(data.timestamp),
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
  const stxAmount = microStxToStx(num);
  return `${formatNumber(stxAmount, 'en-US', decimals)} STX`;
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

function getStatusKey(status: MarketStatus): string {
  const keys: Record<MarketStatus, string> = {
    [MarketStatus.ACTIVE]: 'active',
    [MarketStatus.RESOLVED]: 'resolved',
    [MarketStatus.DISPUTED]: 'disputed',
    [MarketStatus.REFUNDED]: 'refunded',
  };
  return keys[status] || 'unknown';
}

export function getOutcomeLabel(outcome: MarketOutcome): string {
  const labels: Record<MarketOutcome, string> = {
    [MarketOutcome.NONE]: 'None',
    [MarketOutcome.YES]: 'Yes',
    [MarketOutcome.NO]: 'No',
  };
  return labels[outcome] || 'Unknown';
}

function getOutcomeKey(outcome: MarketOutcome): string {
  const keys: Record<MarketOutcome, string> = {
    [MarketOutcome.NONE]: 'none',
    [MarketOutcome.YES]: 'yes',
    [MarketOutcome.NO]: 'no',
  };
  return keys[outcome] || 'unknown';
}
