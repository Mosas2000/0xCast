import { describe, it, expect } from 'vitest';
import {
  validateQuestion,
  validateDuration,
  validateCategory,
  validateMarketForm,
  getQuestionSuggestions,
  formatDurationLabel,
  calculateEndDate,
  formatEndDate,
  isValidQuestion,
  isValidDuration,
  isValidCategory,
  isFormValid,
} from '../utils/templateValidation';

describe('TemplateValidation', () => {
  describe('validateQuestion', () => {
    it('should reject empty question', () => {
      const result = validateQuestion('');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject question shorter than 10 characters', () => {
      const result = validateQuestion('Short q?');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least 10 characters');
    });

    it('should reject question longer than 500 characters', () => {
      const longQuestion = 'a'.repeat(501) + '?';
      const result = validateQuestion(longQuestion);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('exceed 500');
    });

    it('should accept valid question', () => {
      const result = validateQuestion('Will Bitcoin reach $50,000 by end of 2024?');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should suggest starting with Will for clarity', () => {
      const result = validateQuestion('Bitcoin will reach $50,000 by 2024?');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should reject questions with bad characters', () => {
      const result = validateQuestion('Will Bitcoin reach $50,000? <script>alert(1)</script>');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateDuration', () => {
    it('should reject zero duration', () => {
      const result = validateDuration(0);
      expect(result.valid).toBe(false);
    });

    it('should reject negative duration', () => {
      const result = validateDuration(-100);
      expect(result.valid).toBe(false);
    });

    it('should reject duration less than 1 day', () => {
      const result = validateDuration(100);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 1 day');
    });

    it('should reject duration greater than 1 year', () => {
      const result = validateDuration(60000);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceed 1 year');
    });

    it('should accept valid duration', () => {
      const result = validateDuration(1008);
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should accept minimum duration', () => {
      const result = validateDuration(144);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateCategory', () => {
    it('should reject empty category', () => {
      const result = validateCategory('');
      expect(result.valid).toBe(false);
    });

    it('should accept valid categories', () => {
      const categories = ['crypto', 'sports', 'politics', 'economics', 'technology', 'entertainment', 'other'];
      categories.forEach(cat => {
        const result = validateCategory(cat);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject invalid category', () => {
      const result = validateCategory('invalid_category');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid category');
    });

    it('should handle case insensitive validation', () => {
      const result = validateCategory('CRYPTO');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateMarketForm', () => {
    it('should validate complete form', () => {
      const result = validateMarketForm(
        'Will Bitcoin reach $50,000 by end of 2024?',
        1008,
        'crypto'
      );
      expect(result.question.valid).toBe(true);
      expect(result.duration.valid).toBe(true);
      expect(result.category.valid).toBe(true);
    });

    it('should return errors for invalid form', () => {
      const result = validateMarketForm('short', 0, 'invalid');
      expect(result.question.valid).toBe(false);
      expect(result.duration.valid).toBe(false);
      expect(result.category.valid).toBe(false);
    });
  });

  describe('getQuestionSuggestions', () => {
    it('should suggest for short questions', () => {
      const suggestions = getQuestionSuggestions('Short question?');
      expect(suggestions.some(s => s.includes('quite short'))).toBe(true);
    });

    it('should suggest adding question mark', () => {
      const suggestions = getQuestionSuggestions('Will Bitcoin reach 50000');
      expect(suggestions.some(s => s.includes('question mark'))).toBe(true);
    });

    it('should suggest adding date', () => {
      const suggestions = getQuestionSuggestions('Will Bitcoin increase?');
      expect(suggestions.some(s => s.includes('date'))).toBe(true);
    });

    it('should not suggest for good questions', () => {
      const suggestions = getQuestionSuggestions('Will Bitcoin reach $50,000 by December 31, 2024?');
      expect(suggestions.length).toBe(0);
    });
  });

  describe('formatDurationLabel', () => {
    it('should format hours correctly', () => {
      const label = formatDurationLabel(6);
      expect(label).toContain('hours');
    });

    it('should format days correctly', () => {
      const label = formatDurationLabel(144);
      expect(label).toContain('days');
    });

    it('should format weeks correctly', () => {
      const label = formatDurationLabel(1008);
      expect(label).toContain('weeks');
    });

    it('should format months correctly', () => {
      const label = formatDurationLabel(4320);
      expect(label).toContain('months');
    });
  });

  describe('calculateEndDate', () => {
    it('should calculate future date', () => {
      const now = Date.now();
      const endDate = calculateEndDate(144);
      expect(endDate.getTime()).toBeGreaterThan(now);
    });

    it('should be approximately correct', () => {
      const startTime = Date.now();
      const endDate = calculateEndDate(144);
      const expectedMs = 144 * 10 * 60 * 1000;
      const actualMs = endDate.getTime() - startTime;
      expect(Math.abs(actualMs - expectedMs)).toBeLessThan(1000);
    });
  });

  describe('formatEndDate', () => {
    it('should format date as string', () => {
      const formatted = formatEndDate(144);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('isValidQuestion', () => {
    it('should return boolean', () => {
      const result1 = isValidQuestion('');
      const result2 = isValidQuestion('Will Bitcoin reach $50,000 by end of 2024?');
      expect(typeof result1).toBe('boolean');
      expect(typeof result2).toBe('boolean');
    });
  });

  describe('isValidDuration', () => {
    it('should return boolean', () => {
      const result1 = isValidDuration(0);
      const result2 = isValidDuration(1008);
      expect(typeof result1).toBe('boolean');
      expect(typeof result2).toBe('boolean');
    });
  });

  describe('isValidCategory', () => {
    it('should return boolean', () => {
      const result1 = isValidCategory('');
      const result2 = isValidCategory('crypto');
      expect(typeof result1).toBe('boolean');
      expect(typeof result2).toBe('boolean');
    });
  });

  describe('isFormValid', () => {
    it('should validate complete form', () => {
      const result = isFormValid('Will Bitcoin reach $50,000 by 2024?', 1008, 'crypto');
      expect(result).toBe(true);
    });

    it('should reject invalid form', () => {
      const result = isFormValid('short', 0, 'invalid');
      expect(result).toBe(false);
    });
  });
});
