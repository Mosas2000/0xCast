export type StakeOutcome = 'yes' | 'no';

export interface StakeHistoryEntry {
  txId: string;
  marketId: number;
  userAddress: string;
  outcome: StakeOutcome;
  amountStx: number;
  timestamp: number;
}

import { GDPRComplianceService } from '../services/GDPRComplianceService';

const STAKE_HISTORY_KEY = '0xcast-stake-history';
const MAX_HISTORY = 200;

function readHistory(): StakeHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STAKE_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StakeHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: StakeHistoryEntry[]): void {
  const consentCheck = GDPRComplianceService.checkConsentForStorage(
    { stakeHistory: true },
    'necessary'
  );
  if (!consentCheck.allowed) return;
  localStorage.setItem(STAKE_HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}

export function addStakeHistoryEntry(entry: StakeHistoryEntry): void {
  const existing = readHistory();
  const deduped = existing.filter((item) => item.txId !== entry.txId);
  deduped.unshift(entry);
  writeHistory(deduped);
}

export function getStakeHistoryForMarketUser(marketId: number, userAddress: string): StakeHistoryEntry[] {
  return readHistory().filter((entry) => entry.marketId === marketId && entry.userAddress === userAddress);
}

export function getStakeHistoryTotals(entries: StakeHistoryEntry[]): { yes: number; no: number; total: number } {
  const yes = entries
    .filter((entry) => entry.outcome === 'yes')
    .reduce((sum, entry) => sum + entry.amountStx, 0);
  const no = entries
    .filter((entry) => entry.outcome === 'no')
    .reduce((sum, entry) => sum + entry.amountStx, 0);

  return { yes, no, total: yes + no };
}
