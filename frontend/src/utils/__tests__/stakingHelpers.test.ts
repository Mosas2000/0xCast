import { describe, it, expect } from 'vitest';
import {
  formatOxcAmount,
  parseOxcInput,
  formatBlocksToTime,
  calculateEstimatedApy,
  formatLockStatus,
} from '../stakingHelpers';

describe('formatOxcAmount', () => {
  it('formats small amounts correctly', () => {
    // 1 OXC = 1_000_000 micro units (assuming 6 decimals)
    expect(formatOxcAmount(1_000_000n)).toBe('1.00');
    expect(formatOxcAmount(500_000n)).toBe('0.50');
    expect(formatOxcAmount(123_456n, 4)).toBe('0.1235');
  });

  it('formats thousands with K suffix', () => {
    expect(formatOxcAmount(1_000_000_000n)).toBe('1.00K');
    expect(formatOxcAmount(5_500_000_000n)).toBe('5.50K');
  });

  it('formats millions with M suffix', () => {
    expect(formatOxcAmount(1_000_000_000_000n)).toBe('1.00M');
    expect(formatOxcAmount(2_500_000_000_000n)).toBe('2.50M');
  });

  it('respects decimal parameter', () => {
    expect(formatOxcAmount(1_234_567n, 0)).toBe('1');
    expect(formatOxcAmount(1_234_567n, 3)).toBe('1.235');
    expect(formatOxcAmount(1_234_567n, 6)).toBe('1.234567');
  });

  it('handles zero', () => {
    expect(formatOxcAmount(0n)).toBe('0.00');
  });
});

describe('parseOxcInput', () => {
  it('parses valid decimal input', () => {
    expect(parseOxcInput('1')).toBe(1_000_000n);
    expect(parseOxcInput('0.5')).toBe(500_000n);
    expect(parseOxcInput('1.234567')).toBe(1_234_567n);
  });

  it('handles integer input', () => {
    expect(parseOxcInput('100')).toBe(100_000_000n);
    expect(parseOxcInput('0')).toBe(0n);
  });

  it('returns zero for invalid input', () => {
    expect(parseOxcInput('')).toBe(0n);
    expect(parseOxcInput('abc')).toBe(0n);
    expect(parseOxcInput('NaN')).toBe(0n);
  });

  it('returns zero for negative input', () => {
    expect(parseOxcInput('-1')).toBe(0n);
    expect(parseOxcInput('-100')).toBe(0n);
  });

  it('floors fractional micro units', () => {
    // More precision than 6 decimals should be truncated
    expect(parseOxcInput('1.1234567')).toBe(1_123_456n);
  });
});

describe('formatBlocksToTime', () => {
  it('formats minutes for small block counts', () => {
    expect(formatBlocksToTime(1)).toBe('10 minutes');
    expect(formatBlocksToTime(3)).toBe('30 minutes');
    expect(formatBlocksToTime(5)).toBe('50 minutes');
  });

  it('formats hours correctly', () => {
    expect(formatBlocksToTime(6)).toBe('1 hour');
    expect(formatBlocksToTime(12)).toBe('2 hours');
    expect(formatBlocksToTime(18)).toBe('3 hours');
  });

  it('formats days for large block counts', () => {
    expect(formatBlocksToTime(144)).toBe('1 day'); // 144 blocks = 24 hours
    expect(formatBlocksToTime(288)).toBe('2 days');
    expect(formatBlocksToTime(432)).toBe('3 days');
  });

  it('handles zero blocks', () => {
    expect(formatBlocksToTime(0)).toBe('0 minutes');
  });

  it('handles edge case boundaries', () => {
    expect(formatBlocksToTime(6)).toBe('1 hour'); // 60 minutes
    expect(formatBlocksToTime(143)).toBe('23 hours'); // Just under a day
  });
});

describe('calculateEstimatedApy', () => {
  it('returns 0 for zero total staked', () => {
    expect(calculateEstimatedApy(1000n, 0n)).toBe(0);
  });

  it('returns 0 for zero user stake', () => {
    expect(calculateEstimatedApy(0n, 10000n)).toBe(0);
  });

  it('calculates APY with default reward rate', () => {
    const apy = calculateEstimatedApy(1000n, 10000n);
    expect(apy).toBeGreaterThan(0);
    expect(apy).toBeLessThanOrEqual(50);
  });

  it('caps APY at 50%', () => {
    // High reward rate should still cap at 50
    const apy = calculateEstimatedApy(1000n, 10000n, 1000);
    expect(apy).toBe(50);
  });

  it('handles different reward rates', () => {
    const lowApy = calculateEstimatedApy(1000n, 10000n, 10);
    const highApy = calculateEstimatedApy(1000n, 10000n, 100);
    expect(lowApy).toBeLessThan(highApy);
  });
});

describe('formatLockStatus', () => {
  it('returns unlocked status when current block >= locked until', () => {
    const result = formatLockStatus(1000, 1000);
    expect(result.isLocked).toBe(false);
    expect(result.message).toBe('Unlocked');
    expect(result.blocksRemaining).toBe(0);
  });

  it('returns unlocked status when current block is past lock', () => {
    const result = formatLockStatus(1100, 1000);
    expect(result.isLocked).toBe(false);
    expect(result.message).toBe('Unlocked');
  });

  it('returns unlocked status when locked until is 0', () => {
    const result = formatLockStatus(100, 0);
    expect(result.isLocked).toBe(false);
  });

  it('returns locked status with blocks remaining', () => {
    const result = formatLockStatus(1000, 1006); // 6 blocks = 1 hour
    expect(result.isLocked).toBe(true);
    expect(result.blocksRemaining).toBe(6);
    expect(result.message).toBe('Locked for ~1 hour');
  });

  it('returns locked status with days remaining', () => {
    const result = formatLockStatus(1000, 1288); // 288 blocks = 2 days
    expect(result.isLocked).toBe(true);
    expect(result.blocksRemaining).toBe(288);
    expect(result.message).toBe('Locked for ~2 days');
  });

  it('returns locked status with minutes remaining', () => {
    const result = formatLockStatus(1000, 1003); // 3 blocks = 30 minutes
    expect(result.isLocked).toBe(true);
    expect(result.message).toBe('Locked for ~30 minutes');
  });
});
