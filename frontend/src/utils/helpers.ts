import type { Market, Position } from '@/types/market';
import { MarketStatus } from '@/types/market';
import { MarketOutcome } from '@/types/market';
import { microStxToStx } from '../constants';
import i18n from '../i18n/config';
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
  const stxAmount = microStxToStx(num);
  return `${formatNumber(stxAmount, i18n.language, decimals)} STX`;
}

export function formatAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getStatusLabel(status: MarketStatus): string {
  return i18n.t(`common:status.${getStatusKey(status)}`);
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
  return i18n.t(`common:outcome.${getOutcomeKey(outcome)}`);
}

function getOutcomeKey(outcome: MarketOutcome): string {
  const keys: Record<MarketOutcome, string> = {
    [MarketOutcome.NONE]: 'none',
    [MarketOutcome.YES]: 'yes',
    [MarketOutcome.NO]: 'no',
  };
  return keys[outcome] || 'unknown';
}
