export type StakeOutcome = 'yes' | 'no';

export interface StakeHistoryEntry {
  txId: string;
  marketId: number;
  userAddress: string;
  outcome: StakeOutcome;
  amountStx: number;
  timestamp: number;
}

import { GDPRComplianceService } from '@/services/GDPRComplianceService';
import { SecureStorageV2Service } from '@/services/SecureStorageV2Service';

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

async function readHistorySecure(): Promise<StakeHistoryEntry[]> {
  try {
    const stored = await SecureStorageV2Service.getItem<StakeHistoryEntry[]>(STAKE_HISTORY_KEY);
    if (stored) return stored;
    return readHistory();
  } catch {
    return readHistory();
  }
}

function writeHistory(entries: StakeHistoryEntry[]): void {
  const consentCheck = GDPRComplianceService.checkConsentForStorage(
    { stakeHistory: true },
    'necessary'
  );
  if (!consentCheck.allowed) return;

  const trimmed = entries.slice(0, MAX_HISTORY);
  localStorage.setItem(STAKE_HISTORY_KEY, JSON.stringify(trimmed));

  SecureStorageV2Service.setItem(STAKE_HISTORY_KEY, trimmed, {
    encrypt: true,
    category: 'necessary',
    expiresIn: 365 * 24 * 60 * 60 * 1000,
    requireConsent: false,
  }).catch(error => {
    console.error('Failed to store stake history in secure storage:', error);
  });
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

export async function getStakeHistoryForMarketUserSecure(
  marketId: number,
  userAddress: string
): Promise<StakeHistoryEntry[]> {
  const history = await readHistorySecure();
  return history.filter(
    (entry) => entry.marketId === marketId && entry.userAddress === userAddress
  );
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
