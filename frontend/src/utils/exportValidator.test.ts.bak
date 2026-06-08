import { describe, it, expect } from 'vitest';
import { ExportValidator } from './exportValidator';

describe('ExportValidator', () => {
  describe('validateTransactions', () => {
    it('should validate correct transaction structure', () => {
      const transactions = [
        {
          id: '1',
          date: '2024-01-15',
          type: 'claim',
          marketId: 123,
          amount: 500,
          outcome: 'Yes',
          status: 'completed',
          txHash: '0xabc',
        },
      ];

      expect(ExportValidator.validateTransactions(transactions)).toBe(true);
    });

    it('should reject invalid transaction structure', () => {
      const transactions = [
        {
          id: '1',
          date: '2024-01-15',
          type: 'claim',
          marketId: '123',
          amount: 500,
        },
      ];

      expect(ExportValidator.validateTransactions(transactions)).toBe(false);
    });

    it('should reject non-array input', () => {
      expect(ExportValidator.validateTransactions({} as any)).toBe(false);
    });

    it('should accept empty array', () => {
      expect(ExportValidator.validateTransactions([])).toBe(true);
    });
  });

  describe('validatePositions', () => {
    it('should validate correct position structure', () => {
      const positions = [
        {
          marketId: 123,
          marketQuestion: 'Will Bitcoin reach $100k?',
          yesStake: 500,
          noStake: 200,
          currentValue: 750,
          status: 'open',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-20',
        },
      ];

      expect(ExportValidator.validatePositions(positions)).toBe(true);
    });

    it('should reject invalid position structure', () => {
      const positions = [
        {
          marketId: '123',
          marketQuestion: 'Will Bitcoin reach $100k?',
          yesStake: 500,
        },
      ];

      expect(ExportValidator.validatePositions(positions)).toBe(false);
    });
  });

  describe('validatePortfolio', () => {
    it('should validate correct portfolio structure', () => {
      const portfolio = {
        totalValue: 5000,
        totalInvested: 4000,
        totalWinnings: 1500,
        positions: 5,
        markets: 3,
        exportDate: '2024-01-20',
        positions_data: [],
      };

      expect(ExportValidator.validatePortfolio(portfolio)).toBe(true);
    });

    it('should reject invalid portfolio structure', () => {
      const portfolio = {
        totalValue: 5000,
        totalInvested: 4000,
      };

      expect(ExportValidator.validatePortfolio(portfolio)).toBe(false);
    });
  });

  describe('validateRewards', () => {
    it('should validate correct reward structure', () => {
      const rewards = [
        {
          id: '1',
          date: '2024-01-15',
          type: 'referral_bonus',
          amount: 100,
          source: 'referral',
          description: 'Referral reward',
        },
      ];

      expect(ExportValidator.validateRewards(rewards)).toBe(true);
    });

    it('should reject invalid reward structure', () => {
      const rewards = [
        {
          id: '1',
          date: '2024-01-15',
          type: 'referral_bonus',
          amount: '100',
        },
      ];

      expect(ExportValidator.validateRewards(rewards)).toBe(false);
    });
  });

  describe('validateDateRange', () => {
    it('should accept valid date range', () => {
      expect(ExportValidator.validateDateRange('2024-01-01', '2024-12-31')).toBe(true);
    });

    it('should reject invalid date range', () => {
      expect(ExportValidator.validateDateRange('2024-12-31', '2024-01-01')).toBe(false);
    });

    it('should accept no date range', () => {
      expect(ExportValidator.validateDateRange()).toBe(true);
    });

    it('should accept only dateFrom', () => {
      expect(ExportValidator.validateDateRange('2024-01-01')).toBe(true);
    });

    it('should accept only dateTo', () => {
      expect(ExportValidator.validateDateRange(undefined, '2024-12-31')).toBe(true);
    });

    it('should reject invalid dateFrom', () => {
      expect(ExportValidator.validateDateRange('invalid-date', '2024-12-31')).toBe(false);
    });

    it('should reject invalid dateTo', () => {
      expect(ExportValidator.validateDateRange('2024-01-01', 'invalid-date')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should validate ISO date string', () => {
      expect(ExportValidator.isValidDate('2024-01-15')).toBe(true);
    });

    it('should validate ISO datetime string', () => {
      expect(ExportValidator.isValidDate('2024-01-15T10:30:00Z')).toBe(true);
    });

    it('should reject invalid date string', () => {
      expect(ExportValidator.isValidDate('invalid-date')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(ExportValidator.isValidDate('')).toBe(false);
    });
  });

  describe('validateTaxYear', () => {
    it('should validate current year', () => {
      const currentYear = new Date().getFullYear();
      expect(ExportValidator.validateTaxYear(currentYear)).toBe(true);
    });

    it('should validate past year', () => {
      expect(ExportValidator.validateTaxYear(2020)).toBe(true);
    });

    it('should reject future year', () => {
      const futureYear = new Date().getFullYear() + 1;
      expect(ExportValidator.validateTaxYear(futureYear)).toBe(false);
    });

    it('should reject year before 1900', () => {
      expect(ExportValidator.validateTaxYear(1899)).toBe(false);
    });

    it('should accept year 1900', () => {
      expect(ExportValidator.validateTaxYear(1900)).toBe(true);
    });
  });

  describe('getValidationErrors', () => {
    it('should return empty array for valid transactions', () => {
      const transactions = [
        {
          id: '1',
          date: '2024-01-15',
          type: 'claim',
          marketId: 123,
          amount: 500,
          outcome: 'Yes',
          status: 'completed',
        },
      ];

      const errors = ExportValidator.getValidationErrors(transactions, 'transactions');
      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid transactions', () => {
      const errors = ExportValidator.getValidationErrors({}, 'transactions');
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('array');
    });

    it('should return errors for invalid portfolio', () => {
      const errors = ExportValidator.getValidationErrors({}, 'portfolio');
      expect(errors).toHaveLength(1);
    });

    it('should return errors for invalid rewards', () => {
      const errors = ExportValidator.getValidationErrors('not an array', 'rewards');
      expect(errors).toHaveLength(1);
    });

    it('should handle unknown type gracefully', () => {
      const errors = ExportValidator.getValidationErrors({}, 'unknown');
      expect(errors).toHaveLength(0);
    });
  });
});
