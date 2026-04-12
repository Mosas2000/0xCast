import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addStakeHistoryEntry,
  getStakeHistoryForMarketUser,
  getStakeHistoryTotals,
} from '../stakeHistory';

describe('stakeHistory utilities', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    vi.spyOn(localStorage, 'getItem').mockImplementation((key: string) => store[key] ?? null);
    vi.spyOn(localStorage, 'setItem').mockImplementation((key: string, value: string) => {
      store[key] = value;
    });
    vi.spyOn(localStorage, 'removeItem').mockImplementation((key: string) => {
      delete store[key];
    });
    vi.spyOn(localStorage, 'clear').mockImplementation(() => {
      store = {};
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('stores and retrieves stake history entries for a market and user', () => {
    addStakeHistoryEntry({
      txId: '0x1',
      marketId: 3,
      userAddress: 'STUSER',
      outcome: 'yes',
      amountStx: 10,
      timestamp: Date.now(),
    });

    addStakeHistoryEntry({
      txId: '0x2',
      marketId: 3,
      userAddress: 'STUSER',
      outcome: 'no',
      amountStx: 20,
      timestamp: Date.now(),
    });

    const entries = getStakeHistoryForMarketUser(3, 'STUSER');
    expect(entries).toHaveLength(2);
    expect(entries[0].txId).toBe('0x2');
  });

  it('computes yes/no/total stake history aggregates', () => {
    const totals = getStakeHistoryTotals([
      { txId: 'a', marketId: 1, userAddress: 'ST1', outcome: 'yes', amountStx: 5, timestamp: 1 },
      { txId: 'b', marketId: 1, userAddress: 'ST1', outcome: 'no', amountStx: 2.5, timestamp: 2 },
      { txId: 'c', marketId: 1, userAddress: 'ST1', outcome: 'yes', amountStx: 1.5, timestamp: 3 },
    ]);

    expect(totals.yes).toBe(6.5);
    expect(totals.no).toBe(2.5);
    expect(totals.total).toBe(9);
  });
});
