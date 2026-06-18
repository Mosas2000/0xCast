import { describe, it, expect } from 'vitest';
import {
  validateAmount,
  validateStacksAddress,
  validateMarketQuestion,
  validateMemo,
  validateMarketId,
  validateUrl,
  validateMultiOutcomeInputs,
  sanitizeInput,
  sanitizeHtml,
  VALIDATION_LIMITS,
} from '../validation';

describe('validateAmount', () => {
  it('accepts valid amounts', () => {
    expect(validateAmount(100)).toEqual({ isValid: true });
    expect(validateAmount('50.5')).toEqual({ isValid: true });
    expect(validateAmount(1)).toEqual({ isValid: true });
  });

  it('rejects invalid number strings', () => {
    const result = validateAmount('not a number');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Please enter a valid number');
    expect(result.code).toBe('ERR_INVALID_NUMBER');
  });

  it('rejects zero amounts', () => {
    const result = validateAmount(0);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Amount must be greater than zero');
    expect(result.code).toBe('ERR_NON_POSITIVE_AMOUNT');
  });

  it('rejects negative amounts', () => {
    const result = validateAmount(-10);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Amount must be greater than zero');
    expect(result.code).toBe('ERR_NON_POSITIVE_AMOUNT');
  });

  it('rejects amounts below minimum', () => {
    const result = validateAmount(0.5, 1, 1000);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Minimum amount is 1 STX');
    expect(result.code).toBe('ERR_MIN_STAKE_REQUIRED');
  });

  it('rejects amounts above maximum', () => {
    const result = validateAmount(2000000);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(`Maximum amount is ${VALIDATION_LIMITS.MAX_STAKE_AMOUNT} STX`);
  });

  it('rejects excessive decimal places', () => {
    const result = validateAmount('1.1234567');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Maximum 6 decimal places allowed');
  });

  it('accepts maximum 6 decimal places', () => {
    expect(validateAmount('1.123456').isValid).toBe(true);
  });

  it('uses custom min/max when provided', () => {
    expect(validateAmount(5, 10, 100).isValid).toBe(false);
    expect(validateAmount(15, 10, 100).isValid).toBe(true);
    expect(validateAmount(150, 10, 100).isValid).toBe(false);
  });
});

describe('validateStacksAddress', () => {
  // Use real-format addresses (41 chars, valid base58 - no 0, O, I, l)
  const validMainnetAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
  const validTestnetAddress = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';

  it('accepts valid mainnet addresses', () => {
    const result = validateStacksAddress(validMainnetAddress);
    expect(result.isValid).toBe(true);
  });

  it('accepts valid testnet addresses', () => {
    const result = validateStacksAddress(validTestnetAddress);
    expect(result.isValid).toBe(true);
  });

  it('rejects empty addresses', () => {
    expect(validateStacksAddress('').isValid).toBe(false);
    expect(validateStacksAddress('   ').isValid).toBe(false);
  });

  it('rejects addresses without SP or ST prefix', () => {
    const result = validateStacksAddress('XX2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Must start with SP or ST');
  });

  it('rejects addresses with wrong length', () => {
    const result = validateStacksAddress('SP2PABAF9FTAJYN');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(`${VALIDATION_LIMITS.STACKS_ADDRESS_LENGTH} characters`);
  });

  it('rejects addresses with invalid characters (0, O, I, l)', () => {
    // Contains '0' which is invalid in base58
    const result = validateStacksAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9E00');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('invalid characters');
  });

  it('trims whitespace from addresses', () => {
    const result = validateStacksAddress(`  ${validMainnetAddress}  `);
    expect(result.isValid).toBe(true);
  });
});

describe('validateMarketQuestion', () => {
  it('accepts valid questions', () => {
    const result = validateMarketQuestion('Will Bitcoin reach $100,000 by end of year?');
    expect(result.isValid).toBe(true);
  });

  it('rejects empty questions', () => {
    expect(validateMarketQuestion('').isValid).toBe(false);
    expect(validateMarketQuestion('   ').isValid).toBe(false);
  });

  it('rejects questions that are too short', () => {
    const result = validateMarketQuestion('Hi?');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at least 10 characters');
  });

  it('rejects questions that are too long', () => {
    const longQuestion = 'A'.repeat(501);
    const result = validateMarketQuestion(longQuestion);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('less than 500 characters');
  });

  it('rejects questions with fewer than 3 words', () => {
    const result = validateMarketQuestion('Will happen?');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at least 3 words');
  });

  it('accepts questions with exactly 3 words', () => {
    const result = validateMarketQuestion('Will this happen?');
    expect(result.isValid).toBe(true);
  });

  it('handles whitespace correctly', () => {
    const result = validateMarketQuestion('   Will this happen today?   ');
    expect(result.isValid).toBe(true);
  });
});

describe('validateMultiOutcomeInputs', () => {
  it('accepts valid question and outcomes', () => {
    const result = validateMultiOutcomeInputs('Who will win the final match?', ['A', 'B', 'C']);
    expect(result.isValid).toBe(true);
  });

  it('rejects fewer than minimum outcomes', () => {
    const result = validateMultiOutcomeInputs('Who will win the final match?', ['A', 'B']);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(`${VALIDATION_LIMITS.MIN_MULTI_OUTCOMES}`);
  });

  it('rejects more than maximum outcomes', () => {
    const result = validateMultiOutcomeInputs(
      'Who will win the final match?',
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']
    );
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(`${VALIDATION_LIMITS.MAX_MULTI_OUTCOMES}`);
  });

  it('rejects duplicate outcomes', () => {
    const result = validateMultiOutcomeInputs('Who will win the final match?', ['A', 'B', 'a']);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Outcomes must be unique');
  });

  it('rejects overly long outcomes', () => {
    const long = 'X'.repeat(VALIDATION_LIMITS.MAX_OUTCOME_LABEL_LENGTH + 1);
    const result = validateMultiOutcomeInputs('Who will win the final match?', ['A', 'B', long]);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(`${VALIDATION_LIMITS.MAX_OUTCOME_LABEL_LENGTH}`);
  });
});

describe('validateMemo', () => {
  it('accepts empty/undefined memo (optional field)', () => {
    expect(validateMemo('').isValid).toBe(true);
    expect(validateMemo(undefined as unknown as string).isValid).toBe(true);
  });

  it('accepts valid memo', () => {
    const result = validateMemo('Market stake 123');
    expect(result.isValid).toBe(true);
  });

  it('rejects memo exceeding byte limit', () => {
    const longMemo = 'A'.repeat(35);
    const result = validateMemo(longMemo);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(`${VALIDATION_LIMITS.MEMO_MAX_LENGTH} bytes`);
  });

  it('counts multi-byte characters correctly', () => {
    // Unicode characters take more bytes
    const unicodeMemo = '🎉'.repeat(10); // Each emoji is 4 bytes
    const result = validateMemo(unicodeMemo);
    expect(result.isValid).toBe(false);
  });
});

describe('validateMarketId', () => {
  it('accepts valid numeric IDs', () => {
    expect(validateMarketId(1).isValid).toBe(true);
    expect(validateMarketId(100).isValid).toBe(true);
    expect(validateMarketId(0).isValid).toBe(true);
  });

  it('accepts valid string IDs', () => {
    expect(validateMarketId('1').isValid).toBe(true);
    expect(validateMarketId('999').isValid).toBe(true);
  });

  it('rejects non-numeric strings', () => {
    const result = validateMarketId('abc');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid market ID');
  });

  it('rejects negative IDs', () => {
    const result = validateMarketId(-1);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Market ID cannot be negative');
  });

  it('rejects floating point IDs', () => {
    const result = validateMarketId(1.5);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Market ID must be a whole number');
  });
});

describe('validateUrl', () => {
  it('accepts valid URLs', () => {
    expect(validateUrl('https://example.com').isValid).toBe(true);
    expect(validateUrl('http://test.org/path').isValid).toBe(true);
  });

  it('rejects empty URLs', () => {
    expect(validateUrl('').isValid).toBe(false);
  });

  it('rejects javascript: protocol', () => {
    const result = validateUrl('javascript:alert(1)');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid URL protocol');
  });

  it('rejects data: protocol', () => {
    const result = validateUrl('data:text/html,<script>alert(1)</script>');
    expect(result.isValid).toBe(false);
  });

  it('rejects invalid URL format', () => {
    const result = validateUrl('not a url');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Invalid URL format');
  });

  it('validates against allowed domains', () => {
    const allowed = ['example.com', 'test.org'];
    
    expect(validateUrl('https://example.com', allowed).isValid).toBe(true);
    expect(validateUrl('https://sub.example.com', allowed).isValid).toBe(true);
    expect(validateUrl('https://malicious.com', allowed).isValid).toBe(false);
  });
});

describe('sanitizeInput', () => {
  it('removes angle brackets', () => {
    expect(sanitizeInput('<script>alert()</script>')).toBe('scriptalert()/script');
  });

  it('removes javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert()')).toBe('alert()');
  });

  it('removes event handlers', () => {
    expect(sanitizeInput('onclick=alert()')).toBe('alert()');
    expect(sanitizeInput('onmouseover=test')).toBe('test');
  });

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('handles empty/null input', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput(undefined as unknown as string)).toBe('');
  });
});

describe('sanitizeHtml', () => {
  it('escapes HTML entities', () => {
    expect(sanitizeHtml('<div>')).toBe('&lt;div&gt;');
    expect(sanitizeHtml('&test')).toBe('&amp;test');
  });

  it('escapes quotes', () => {
    expect(sanitizeHtml('"test"')).toBe('&quot;test&quot;');
    expect(sanitizeHtml("'test'")).toBe('&#39;test&#39;');
  });

  it('escapes script tags completely', () => {
    const malicious = '<script>alert("xss")</script>';
    const sanitized = sanitizeHtml(malicious);
    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('>');
    expect(sanitized).toContain('&lt;');
    expect(sanitized).toContain('&gt;');
  });

  it('handles empty/null input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(undefined as unknown as string)).toBe('');
  });

  it('escapes forward slash and backtick', () => {
    expect(sanitizeHtml('/path')).toBe('&#x2F;path');
    expect(sanitizeHtml('`code`')).toBe('&#x60;code&#x60;');
  });
});
