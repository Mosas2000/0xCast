import { describe, it, expect } from 'vitest';
import {
  validateMarketTitle,
  validateMarketDescription,
  validateMarketDuration,
  validatePredictionAmount,
  validateMarketOutcome,
  validateMarketStatus,
  validateStacksAddress,
  validateMarketEndTime,
  validateMarketCreation,
  validatePrediction,
  MIN_TITLE_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MIN_PREDICTION_AMOUNT,
  MAX_PREDICTION_AMOUNT,
  MIN_MARKET_DURATION_BLOCKS,
  MAX_MARKET_DURATION_BLOCKS,
} from '../marketValidation';
import { MarketStatus, MarketOutcome } from '../../types/market';

describe('validateMarketTitle', () => {
  it('should accept valid titles', () => {
    const result = validateMarketTitle('Will BTC reach $100k in 2026?');
    expect(result.isValid).toBe(true);
  });

  it('should reject empty titles', () => {
    const result = validateMarketTitle('');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should reject titles that are too short', () => {
    const result = validateMarketTitle('Short');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(`at least ${MIN_TITLE_LENGTH}`);
  });

  it('should reject titles that are too long', () => {
    const longTitle = 'a'.repeat(MAX_TITLE_LENGTH + 1);
    const result = validateMarketTitle(longTitle);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(`not exceed ${MAX_TITLE_LENGTH}`);
  });

  it('should reject titles with invalid characters', () => {
    const result = validateMarketTitle('Invalid <script> title');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('invalid characters');
  });

  it('should trim whitespace', () => {
    const result = validateMarketTitle('  Valid title here  ');
    expect(result.isValid).toBe(true);
  });
});

describe('validateMarketDescription', () => {
  it('should accept valid descriptions', () => {
    const description = 'This market resolves YES if Bitcoin reaches $100,000 by end of 2026.';
    const result = validateMarketDescription(description);
    expect(result.isValid).toBe(true);
  });

  it('should reject empty descriptions', () => {
    const result = validateMarketDescription('');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should reject descriptions that are too short', () => {
    const result = validateMarketDescription('Too short');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(`at least ${MIN_DESCRIPTION_LENGTH}`);
  });

  it('should reject descriptions that are too long', () => {
    const longDescription = 'a'.repeat(MAX_DESCRIPTION_LENGTH + 1);
    const result = validateMarketDescription(longDescription);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(`not exceed ${MAX_DESCRIPTION_LENGTH}`);
  });
});

describe('validateMarketDuration', () => {
  it('should accept valid durations', () => {
    const result = validateMarketDuration(144); // ~1 day
    expect(result.isValid).toBe(true);
  });

  it('should reject non-integer durations', () => {
    const result = validateMarketDuration(144.5);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('whole number');
  });

  it('should reject durations that are too short', () => {
    const result = validateMarketDuration(MIN_MARKET_DURATION_BLOCKS - 1);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(`at least ${MIN_MARKET_DURATION_BLOCKS}`);
  });

  it('should reject durations that are too long', () => {
    const result = validateMarketDuration(MAX_MARKET_DURATION_BLOCKS + 1);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(`not exceed ${MAX_MARKET_DURATION_BLOCKS}`);
  });
});

describe('validatePredictionAmount', () => {
  it('should accept valid amounts', () => {
    const result = validatePredictionAmount(10_000_000n); // 10 STX
    expect(result.isValid).toBe(true);
  });

  it('should reject amounts below minimum', () => {
    const result = validatePredictionAmount(MIN_PREDICTION_AMOUNT - 1n);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Minimum');
  });

  it('should reject amounts above maximum', () => {
    const result = validatePredictionAmount(MAX_PREDICTION_AMOUNT + 1n);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Maximum');
  });

  it('should reject non-BigInt values', () => {
    const result = validatePredictionAmount(10000000 as any);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('BigInt');
  });
});

describe('validateMarketOutcome', () => {
  it('should accept valid outcomes', () => {
    expect(validateMarketOutcome(MarketOutcome.NONE).isValid).toBe(true);
    expect(validateMarketOutcome(MarketOutcome.YES).isValid).toBe(true);
    expect(validateMarketOutcome(MarketOutcome.NO).isValid).toBe(true);
  });

  it('should reject invalid outcomes', () => {
    expect(validateMarketOutcome(3).isValid).toBe(false);
    expect(validateMarketOutcome(-1).isValid).toBe(false);
    expect(validateMarketOutcome('YES').isValid).toBe(false);
  });
});

describe('validateMarketStatus', () => {
  it('should accept valid statuses', () => {
    expect(validateMarketStatus(MarketStatus.ACTIVE).isValid).toBe(true);
    expect(validateMarketStatus(MarketStatus.RESOLVED).isValid).toBe(true);
    expect(validateMarketStatus(MarketStatus.DISPUTED).isValid).toBe(true);
    expect(validateMarketStatus(MarketStatus.REFUNDED).isValid).toBe(true);
  });

  it('should reject invalid statuses', () => {
    expect(validateMarketStatus(0).isValid).toBe(false);
    expect(validateMarketStatus(5).isValid).toBe(false);
    expect(validateMarketStatus('ACTIVE').isValid).toBe(false);
  });
});

describe('validateStacksAddress', () => {
  it('should accept valid mainnet addresses', () => {
    const result = validateStacksAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
    expect(result.isValid).toBe(true);
  });

  it('should accept valid testnet addresses', () => {
    const result = validateStacksAddress('ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE');
    expect(result.isValid).toBe(true);
  });

  it('should reject empty addresses', () => {
    const result = validateStacksAddress('');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('should reject invalid address formats', () => {
    expect(validateStacksAddress('0x1234567890').isValid).toBe(false);
    expect(validateStacksAddress('invalid-address').isValid).toBe(false);
    expect(validateStacksAddress('SP123').isValid).toBe(false);
  });
});

describe('validateMarketEndTime', () => {
  it('should accept future timestamps', () => {
    const futureTime = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
    const result = validateMarketEndTime(futureTime);
    expect(result.isValid).toBe(true);
  });

  it('should reject past timestamps', () => {
    const pastTime = Math.floor(Date.now() / 1000) - 86400; // 1 day ago
    const result = validateMarketEndTime(pastTime);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('future');
  });

  it('should reject timestamps too far in the future', () => {
    const farFuture = Math.floor(Date.now() / 1000) + (3 * 365 * 24 * 60 * 60); // 3 years
    const result = validateMarketEndTime(farFuture);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('2 years');
  });

  it('should reject non-integer timestamps', () => {
    const result = validateMarketEndTime(1234567890.5);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Unix timestamp');
  });
});

describe('validateMarketCreation', () => {
  const validData = {
    title: 'Will BTC reach $100k in 2026?',
    description: 'This market resolves YES if Bitcoin reaches $100,000 by end of 2026.',
    durationBlocks: 144,
  };

  it('should accept valid market creation data', () => {
    const result = validateMarketCreation(validData);
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid title', () => {
    const result = validateMarketCreation({
      ...validData,
      title: 'Short',
    });
    expect(result.isValid).toBe(false);
    expect(result.field).toBe('title');
  });

  it('should reject invalid description', () => {
    const result = validateMarketCreation({
      ...validData,
      description: 'Too short',
    });
    expect(result.isValid).toBe(false);
    expect(result.field).toBe('description');
  });

  it('should reject invalid duration', () => {
    const result = validateMarketCreation({
      ...validData,
      durationBlocks: 1,
    });
    expect(result.isValid).toBe(false);
    expect(result.field).toBe('duration');
  });
});

describe('validatePrediction', () => {
  const validData = {
    marketId: '1',
    outcome: MarketOutcome.YES,
    amount: 10_000_000n,
  };

  it('should accept valid prediction data', () => {
    const result = validatePrediction(validData);
    expect(result.isValid).toBe(true);
  });

  it('should reject missing market ID', () => {
    const result = validatePrediction({
      ...validData,
      marketId: '',
    });
    expect(result.isValid).toBe(false);
    expect(result.field).toBe('marketId');
  });

  it('should reject invalid outcome', () => {
    const result = validatePrediction({
      ...validData,
      outcome: 999,
    });
    expect(result.isValid).toBe(false);
    expect(result.field).toBe('outcome');
  });

  it('should reject invalid amount', () => {
    const result = validatePrediction({
      ...validData,
      amount: 100n, // Too small
    });
    expect(result.isValid).toBe(false);
    expect(result.field).toBe('amount');
  });
});
