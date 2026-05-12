import { describe, it, expect } from 'vitest';
import {
  MarketStatus,
  MarketOutcome,
  isMarketStatus,
  isMarketOutcome,
  getMarketStatusLabel,
  getMarketOutcomeLabel,
  canAcceptPredictions,
  canResolveMarket,
  canClaimWinnings,
  isMarket,
  isPrediction,
  type Market,
  type Prediction,
} from '../market';

describe('MarketStatus enum', () => {
  it('should have correct values', () => {
    expect(MarketStatus.ACTIVE).toBe(1);
    expect(MarketStatus.RESOLVED).toBe(2);
    expect(MarketStatus.DISPUTED).toBe(3);
    expect(MarketStatus.REFUNDED).toBe(4);
  });
});

describe('MarketOutcome enum', () => {
  it('should have correct values', () => {
    expect(MarketOutcome.NONE).toBe(0);
    expect(MarketOutcome.YES).toBe(1);
    expect(MarketOutcome.NO).toBe(2);
  });
});

describe('isMarketStatus', () => {
  it('should return true for valid MarketStatus values', () => {
    expect(isMarketStatus(1)).toBe(true);
    expect(isMarketStatus(2)).toBe(true);
    expect(isMarketStatus(3)).toBe(true);
    expect(isMarketStatus(4)).toBe(true);
  });

  it('should return false for invalid values', () => {
    expect(isMarketStatus(0)).toBe(false);
    expect(isMarketStatus(5)).toBe(false);
    expect(isMarketStatus('1')).toBe(false);
    expect(isMarketStatus(null)).toBe(false);
    expect(isMarketStatus(undefined)).toBe(false);
  });
});

describe('isMarketOutcome', () => {
  it('should return true for valid MarketOutcome values', () => {
    expect(isMarketOutcome(0)).toBe(true);
    expect(isMarketOutcome(1)).toBe(true);
    expect(isMarketOutcome(2)).toBe(true);
  });

  it('should return false for invalid values', () => {
    expect(isMarketOutcome(3)).toBe(false);
    expect(isMarketOutcome(-1)).toBe(false);
    expect(isMarketOutcome('0')).toBe(false);
    expect(isMarketOutcome(null)).toBe(false);
    expect(isMarketOutcome(undefined)).toBe(false);
  });
});

describe('getMarketStatusLabel', () => {
  it('should return correct labels for each status', () => {
    expect(getMarketStatusLabel(MarketStatus.ACTIVE)).toBe('Active');
    expect(getMarketStatusLabel(MarketStatus.RESOLVED)).toBe('Resolved');
    expect(getMarketStatusLabel(MarketStatus.DISPUTED)).toBe('Disputed');
    expect(getMarketStatusLabel(MarketStatus.REFUNDED)).toBe('Refunded');
  });

  it('should return Unknown for invalid status', () => {
    expect(getMarketStatusLabel(999 as MarketStatus)).toBe('Unknown');
  });
});

describe('getMarketOutcomeLabel', () => {
  it('should return correct labels for each outcome', () => {
    expect(getMarketOutcomeLabel(MarketOutcome.NONE)).toBe('Unresolved');
    expect(getMarketOutcomeLabel(MarketOutcome.YES)).toBe('Yes');
    expect(getMarketOutcomeLabel(MarketOutcome.NO)).toBe('No');
  });

  it('should return Unknown for invalid outcome', () => {
    expect(getMarketOutcomeLabel(999 as MarketOutcome)).toBe('Unknown');
  });
});

describe('canAcceptPredictions', () => {
  it('should return true only for ACTIVE status', () => {
    expect(canAcceptPredictions(MarketStatus.ACTIVE)).toBe(true);
    expect(canAcceptPredictions(MarketStatus.RESOLVED)).toBe(false);
    expect(canAcceptPredictions(MarketStatus.DISPUTED)).toBe(false);
    expect(canAcceptPredictions(MarketStatus.REFUNDED)).toBe(false);
  });
});

describe('canResolveMarket', () => {
  it('should return true for ACTIVE and DISPUTED status', () => {
    expect(canResolveMarket(MarketStatus.ACTIVE)).toBe(true);
    expect(canResolveMarket(MarketStatus.DISPUTED)).toBe(true);
    expect(canResolveMarket(MarketStatus.RESOLVED)).toBe(false);
    expect(canResolveMarket(MarketStatus.REFUNDED)).toBe(false);
  });
});

describe('canClaimWinnings', () => {
  it('should return true for RESOLVED status with valid outcome', () => {
    expect(canClaimWinnings(MarketStatus.RESOLVED, MarketOutcome.YES)).toBe(true);
    expect(canClaimWinnings(MarketStatus.RESOLVED, MarketOutcome.NO)).toBe(true);
  });

  it('should return false for RESOLVED status with NONE outcome', () => {
    expect(canClaimWinnings(MarketStatus.RESOLVED, MarketOutcome.NONE)).toBe(false);
  });

  it('should return false for non-RESOLVED status', () => {
    expect(canClaimWinnings(MarketStatus.ACTIVE, MarketOutcome.YES)).toBe(false);
    expect(canClaimWinnings(MarketStatus.DISPUTED, MarketOutcome.YES)).toBe(false);
    expect(canClaimWinnings(MarketStatus.REFUNDED, MarketOutcome.YES)).toBe(false);
  });

  it('should return false when outcome is undefined', () => {
    expect(canClaimWinnings(MarketStatus.RESOLVED, undefined)).toBe(false);
  });
});

describe('isMarket', () => {
  const validMarket: Market = {
    id: '1',
    title: 'Test Market',
    description: 'Test description',
    creator: 'SP2...',
    endTime: 1735689600,
    resolved: false,
    totalVolume: 1000,
    currentPrice: 0.5,
  };

  it('should return true for valid Market object', () => {
    expect(isMarket(validMarket)).toBe(true);
  });

  it('should return true for Market with optional fields', () => {
    const marketWithOptionals: Market = {
      ...validMarket,
      outcome: 1,
      category: 'crypto',
    };
    expect(isMarket(marketWithOptionals)).toBe(true);
  });

  it('should return false for invalid objects', () => {
    expect(isMarket(null)).toBe(false);
    expect(isMarket(undefined)).toBe(false);
    expect(isMarket({})).toBe(false);
    expect(isMarket('market')).toBe(false);
    expect(isMarket(123)).toBe(false);
  });

  it('should return false for objects missing required fields', () => {
    const { id, ...withoutId } = validMarket;
    expect(isMarket(withoutId)).toBe(false);

    const { title, ...withoutTitle } = validMarket;
    expect(isMarket(withoutTitle)).toBe(false);
  });

  it('should return false for objects with wrong field types', () => {
    expect(isMarket({ ...validMarket, id: 123 })).toBe(false);
    expect(isMarket({ ...validMarket, resolved: 'false' })).toBe(false);
    expect(isMarket({ ...validMarket, totalVolume: '1000' })).toBe(false);
  });
});

describe('isPrediction', () => {
  const validPrediction: Prediction = {
    id: '1',
    marketId: '1',
    userId: 'SP2...',
    outcome: 1,
    amount: 100,
    timestamp: 1735689600,
    shares: 50,
  };

  it('should return true for valid Prediction object', () => {
    expect(isPrediction(validPrediction)).toBe(true);
  });

  it('should return false for invalid objects', () => {
    expect(isPrediction(null)).toBe(false);
    expect(isPrediction(undefined)).toBe(false);
    expect(isPrediction({})).toBe(false);
    expect(isPrediction('prediction')).toBe(false);
    expect(isPrediction(123)).toBe(false);
  });

  it('should return false for objects missing required fields', () => {
    const { id, ...withoutId } = validPrediction;
    expect(isPrediction(withoutId)).toBe(false);

    const { marketId, ...withoutMarketId } = validPrediction;
    expect(isPrediction(withoutMarketId)).toBe(false);
  });

  it('should return false for objects with wrong field types', () => {
    expect(isPrediction({ ...validPrediction, id: 123 })).toBe(false);
    expect(isPrediction({ ...validPrediction, outcome: '1' })).toBe(false);
    expect(isPrediction({ ...validPrediction, amount: '100' })).toBe(false);
  });
});
