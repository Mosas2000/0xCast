import { describe, expect, it } from 'vitest';
import { basisPointsToPercent, microStxToStxValue, parseMultiMarketData } from '../multiMarket';

describe('parseMultiMarketData', () => {
  it('parses market payload and computes outcome percentages', () => {
    const rawData = {
      question: 'Who will win?',
      creator: 'SP123',
      'outcome-names': ['A', 'B', 'C'],
      'outcome-stakes': ['5000000', '3000000', '2000000'],
      'outcome-count': '3',
      'end-date': '100',
      'resolution-date': '120',
      status: '0',
      'winning-outcome': null,
      'created-at': '90',
    };

    const parsed = parseMultiMarketData(1, rawData);

    expect(parsed.id).toBe(1);
    expect(parsed.outcomeCount).toBe(3);
    expect(parsed.outcomes[0].name).toBe('A');
    expect(parsed.outcomes[0].percentage).toBe(50);
    expect(parsed.outcomes[1].percentage).toBe(30);
    expect(parsed.outcomes[2].percentage).toBe(20);
  });

  it('handles missing outcome names with fallback labels', () => {
    const rawData = {
      question: 'Market',
      creator: 'SP123',
      'outcome-names': ['A'],
      'outcome-stakes': ['100', '200', '300'],
      'outcome-count': 3,
      'end-date': 100,
      'resolution-date': 120,
      status: 0,
      'winning-outcome': null,
      'created-at': 90,
    };

    const parsed = parseMultiMarketData(2, rawData);

    expect(parsed.outcomes[1].name).toBe('Outcome 2');
    expect(parsed.outcomes[2].name).toBe('Outcome 3');
  });
});

describe('basisPointsToPercent', () => {
  it('converts basis points to percentage', () => {
    expect(basisPointsToPercent(6000)).toBe(60);
    expect(basisPointsToPercent(3333)).toBe(33.3);
  });
});

describe('microStxToStxValue', () => {
  it('converts micro STX to STX value', () => {
    expect(microStxToStxValue(1500000)).toBe(1.5);
  });
});
