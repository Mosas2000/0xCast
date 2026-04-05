import { describe, it, expect } from 'vitest';
import {
  validateAmount,
  validateStacksAddress,
  validateMarketQuestion,
  validateMemo,
  validateMarketId,
  validateUrl,
  sanitizeInput,
  sanitizeHtml,
  VALIDATION_LIMITS,
} from './validation';

describe('validateAmount', () => {
  it('should accept valid amounts', () => {
    expect(validateAmount('100').isValid).toBe(true);
    expect(validateAmount(50).isValid).toBe(true);
    expect(validateAmount('1.5').isValid).toBe(true);
  });

  it('should reject invalid amounts', () => {
    expect(validateAmount('abc').isValid).toBe(false);
    expect(validateAmount(-10).isValid).toBe(false);
    expect(validateAmount(0).isValid).toBe(false);
  });

  it('should enforce min/max limits', () => {
    expect(validateAmount(0.5, 1, 100).isValid).toBe(false);
    expect(validateAmount(150, 1, 100).isValid).toBe(false);
    expect(validateAmount(50, 1, 100).isValid).toBe(true);
  });

  it('should reject excessive decimal places', () => {
    expect(validateAmount('1.1234567').isValid).toBe(false);
    expect(validateAmount('1.123456').isValid).toBe(true);
  });
});

describe('validateStacksAddress', () => {
  it('should accept valid mainnet addresses', () => {
    const result = validateStacksAddress('SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T');
    expect(result.isValid).toBe(true);
  });

  it('should accept valid testnet addresses', () => {
    const result = validateStacksAddress('ST31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T');
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid addresses', () => {
    expect(validateStacksAddress('invalid').isValid).toBe(false);
    expect(validateStacksAddress('').isValid).toBe(false);
    expect(validateStacksAddress('0x1234567890abcdef').isValid).toBe(false);
  });

  it('should reject addresses with wrong prefix', () => {
    expect(validateStacksAddress('XP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T').isValid).toBe(false);
  });
});

describe('validateMarketQuestion', () => {
  it('should accept valid questions', () => {
    const result = validateMarketQuestion('Will Bitcoin reach $100k by end of year?');
    expect(result.isValid).toBe(true);
  });

  it('should reject too short questions', () => {
    expect(validateMarketQuestion('short').isValid).toBe(false);
    expect(validateMarketQuestion('').isValid).toBe(false);
  });

  it('should reject questions with too few words', () => {
    expect(validateMarketQuestion('Singleword').isValid).toBe(false);
  });
});

describe('validateMemo', () => {
  it('should accept empty memo', () => {
    expect(validateMemo('').isValid).toBe(true);
  });

  it('should accept valid memo', () => {
    expect(validateMemo('test memo').isValid).toBe(true);
  });

  it('should reject memo exceeding byte limit', () => {
    const longMemo = 'a'.repeat(50);
    expect(validateMemo(longMemo).isValid).toBe(false);
  });
});

describe('validateMarketId', () => {
  it('should accept valid IDs', () => {
    expect(validateMarketId(1).isValid).toBe(true);
    expect(validateMarketId('42').isValid).toBe(true);
    expect(validateMarketId(0).isValid).toBe(true);
  });

  it('should reject invalid IDs', () => {
    expect(validateMarketId(-1).isValid).toBe(false);
    expect(validateMarketId('abc').isValid).toBe(false);
    expect(validateMarketId(1.5).isValid).toBe(false);
  });
});

describe('validateUrl', () => {
  it('should accept valid URLs', () => {
    expect(validateUrl('https://example.com').isValid).toBe(true);
    expect(validateUrl('http://localhost:3000').isValid).toBe(true);
  });

  it('should reject javascript: protocol', () => {
    expect(validateUrl('javascript:alert(1)').isValid).toBe(false);
  });

  it('should reject data: protocol', () => {
    expect(validateUrl('data:text/html,<script>alert(1)</script>').isValid).toBe(false);
  });

  it('should enforce domain whitelist', () => {
    const result = validateUrl('https://evil.com', ['example.com']);
    expect(result.isValid).toBe(false);
    
    const allowed = validateUrl('https://api.example.com', ['example.com']);
    expect(allowed.isValid).toBe(true);
  });
});

describe('sanitizeInput', () => {
  it('should remove angle brackets', () => {
    expect(sanitizeInput('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
  });

  it('should remove javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
  });

  it('should remove event handlers', () => {
    expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)');
  });

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });
});

describe('sanitizeHtml', () => {
  it('should escape HTML entities', () => {
    expect(sanitizeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('should escape quotes', () => {
    expect(sanitizeHtml('"test"')).toBe('&quot;test&quot;');
  });

  it('should handle empty strings', () => {
    expect(sanitizeHtml('')).toBe('');
  });
});

describe('VALIDATION_LIMITS', () => {
  it('should have expected constants', () => {
    expect(VALIDATION_LIMITS.MIN_STAKE_AMOUNT).toBe(1);
    expect(VALIDATION_LIMITS.STACKS_ADDRESS_LENGTH).toBe(41);
    expect(VALIDATION_LIMITS.MEMO_MAX_LENGTH).toBe(34);
  });
});
