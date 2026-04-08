import { describe, it, expect } from 'vitest';
import {
  parseMarketData,
  parsePosition,
  calculateOdds,
  formatStx,
  formatAddress,
  getStatusLabel,
  getOutcomeLabel,
} from '../helpers';
import { MarketStatus, MarketOutcome } from '../../types/market';

describe('parseMarketData', () => {
  it('parses valid market data correctly', () => {
    const rawData = {
      question: 'Will BTC reach $100k?',
      creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      'end-date': '1704067200',
      'resolution-date': '1704153600',
      'total-yes-stake': '1000000',
      'total-no-stake': '500000',
      status: '0',
      outcome: '0',
      'created-at': '1703980800',
    };

    const result = parseMarketData(1, rawData);

    expect(result).toEqual({
      id: 1,
      question: 'Will BTC reach $100k?',
      creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      endDate: 1704067200,
      resolutionDate: 1704153600,
      totalYesStake: 1000000,
      totalNoStake: 500000,
      status: MarketStatus.ACTIVE,
      outcome: MarketOutcome.NONE,
      createdAt: 1703980800,
    });
  });

  it('handles string numbers correctly', () => {
    const rawData = {
      question: 'Test market',
      creator: 'ST1TEST',
      'end-date': 1704067200,
      'resolution-date': 1704153600,
      'total-yes-stake': 0,
      'total-no-stake': 0,
      status: 1,
      outcome: 1,
      'created-at': 1703980800,
    };

    const result = parseMarketData(2, rawData);

    expect(result.id).toBe(2);
    expect(result.status).toBe(MarketStatus.RESOLVED);
    expect(result.outcome).toBe(MarketOutcome.YES);
  });

  it('handles zero values', () => {
    const rawData = {
      question: 'New market',
      creator: 'ST1TEST',
      'end-date': 0,
      'resolution-date': 0,
      'total-yes-stake': 0,
      'total-no-stake': 0,
      status: 0,
      outcome: 0,
      'created-at': 0,
    };

    const result = parseMarketData(3, rawData);

    expect(result.totalYesStake).toBe(0);
    expect(result.totalNoStake).toBe(0);
    expect(result.endDate).toBe(0);
  });
});

describe('parsePosition', () => {
  it('parses valid position data', () => {
    const rawData = {
      'yes-stake': '500000',
      'no-stake': '250000',
      claimed: false,
    };

    const result = parsePosition(1, 'ST1USER', rawData);

    expect(result).toEqual({
      marketId: 1,
      user: 'ST1USER',
      yesStake: 500000,
      noStake: 250000,
      claimed: false,
    });
  });

  it('handles claimed positions', () => {
    const rawData = {
      'yes-stake': '1000000',
      'no-stake': '0',
      claimed: true,
    };

    const result = parsePosition(2, 'ST1USER', rawData);

    expect(result.claimed).toBe(true);
    expect(result.yesStake).toBe(1000000);
  });

  it('handles zero stakes', () => {
    const rawData = {
      'yes-stake': 0,
      'no-stake': 0,
      claimed: false,
    };

    const result = parsePosition(3, 'ST1USER', rawData);

    expect(result.yesStake).toBe(0);
    expect(result.noStake).toBe(0);
  });
});

describe('calculateOdds', () => {
  it('returns 50/50 for empty pool', () => {
    const odds = calculateOdds(0, 0);
    expect(odds).toEqual({ yes: 50, no: 50 });
  });

  it('calculates correct percentages for equal stakes', () => {
    const odds = calculateOdds(1000000, 1000000);
    expect(odds.yes).toBe(50);
    expect(odds.no).toBe(50);
  });

  it('calculates correct percentages for unequal stakes', () => {
    const odds = calculateOdds(750000, 250000);
    expect(odds.yes).toBe(75);
    expect(odds.no).toBe(25);
  });

  it('handles large numbers', () => {
    const odds = calculateOdds(1000000000000, 500000000000);
    expect(odds.yes).toBeCloseTo(66.7, 1);
    expect(odds.no).toBeCloseTo(33.3, 1);
  });

  it('handles one-sided pools', () => {
    const oddsYesOnly = calculateOdds(1000000, 0);
    expect(oddsYesOnly.yes).toBe(100);
    expect(oddsYesOnly.no).toBe(0);

    const oddsNoOnly = calculateOdds(0, 1000000);
    expect(oddsNoOnly.yes).toBe(0);
    expect(oddsNoOnly.no).toBe(100);
  });

  it('rounds to one decimal place', () => {
    const odds = calculateOdds(333333, 666667);
    expect(odds.yes).toBe(33.3);
    expect(odds.no).toBe(66.7);
  });
});

describe('formatStx', () => {
  it('formats micro STX to STX correctly', () => {
    const result = formatStx(1000000);
    expect(result).toBe('1.00 STX');
  });

  it('handles custom decimal places', () => {
    const result = formatStx(1234567, 4);
    expect(result).toBe('1.2346 STX');
  });

  it('handles zero', () => {
    const result = formatStx(0);
    expect(result).toBe('0.00 STX');
  });

  it('handles large amounts', () => {
    const result = formatStx(1000000000000);
    expect(result).toBe('1000000.00 STX');
  });
});

describe('formatAddress', () => {
  it('truncates long addresses', () => {
    const address = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const result = formatAddress(address);
    expect(result).toBe('ST1PQH...ZGZGM');
    expect(result.length).toBe(13);
  });

  it('returns short addresses unchanged', () => {
    const address = 'ST1TEST';
    const result = formatAddress(address);
    expect(result).toBe('ST1TEST');
  });

  it('handles edge case of exactly 12 characters', () => {
    const address = '123456789012';
    const result = formatAddress(address);
    expect(result).toBe('123456789012');
  });

  it('truncates 13+ character addresses', () => {
    const address = '1234567890123';
    const result = formatAddress(address);
    expect(result).toBe('123456...0123');
  });
});

describe('getStatusLabel', () => {
  it('returns correct label for ACTIVE status', () => {
    expect(getStatusLabel(MarketStatus.ACTIVE)).toBe('Active');
  });

  it('returns correct label for RESOLVED status', () => {
    expect(getStatusLabel(MarketStatus.RESOLVED)).toBe('Resolved');
  });

  it('returns correct label for DISPUTED status', () => {
    expect(getStatusLabel(MarketStatus.DISPUTED)).toBe('Disputed');
  });

  it('returns correct label for REFUNDED status', () => {
    expect(getStatusLabel(MarketStatus.REFUNDED)).toBe('Refunded');
  });

  it('handles numeric status values', () => {
    expect(getStatusLabel(0 as MarketStatus)).toBe('Active');
    expect(getStatusLabel(1 as MarketStatus)).toBe('Resolved');
    expect(getStatusLabel(2 as MarketStatus)).toBe('Disputed');
    expect(getStatusLabel(3 as MarketStatus)).toBe('Refunded');
  });
});

describe('getOutcomeLabel', () => {
  it('returns correct label for NONE outcome', () => {
    expect(getOutcomeLabel(MarketOutcome.NONE)).toBe('Pending');
  });

  it('returns correct label for YES outcome', () => {
    expect(getOutcomeLabel(MarketOutcome.YES)).toBe('Yes');
  });

  it('returns correct label for NO outcome', () => {
    expect(getOutcomeLabel(MarketOutcome.NO)).toBe('No');
  });

  it('handles numeric outcome values', () => {
    expect(getOutcomeLabel(0 as MarketOutcome)).toBe('Pending');
    expect(getOutcomeLabel(1 as MarketOutcome)).toBe('Yes');
    expect(getOutcomeLabel(2 as MarketOutcome)).toBe('No');
  });
});
