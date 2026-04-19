import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportService } from './ExportService';
import type { ExportTransaction, ExportPosition, ExportPortfolio, ExportReward } from '../types/export';

describe('ExportService', () => {
  const mockTransactions: ExportTransaction[] = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'claim',
      marketId: 123,
      amount: 500,
      outcome: 'Yes',
      status: 'completed',
      txHash: '0xabc123',
    },
    {
      id: '2',
      date: '2024-01-20',
      type: 'stake',
      marketId: 124,
      amount: 100,
      outcome: 'No',
      status: 'pending',
      txHash: '0xdef456',
    },
  ];

  const mockPositions: ExportPosition[] = [
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

  const mockPortfolio: ExportPortfolio = {
    totalValue: 5000,
    totalInvested: 4000,
    totalWinnings: 1500,
    positions: 5,
    markets: 3,
    exportDate: '2024-01-20',
    positions_data: mockPositions,
  };

  const mockRewards: ExportReward[] = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'referral_bonus',
      amount: 100,
      source: 'referral',
      description: 'Referral reward for user signup',
    },
    {
      id: '2',
      date: '2024-01-18',
      type: 'trading_reward',
      amount: 50,
      source: 'trading',
      description: 'Trading incentive',
    },
  ];

  describe('generateTransactionExport', () => {
    it('should generate CSV export for transactions', async () => {
      const csv = await ExportService.generateTransactionExport(mockTransactions, 'csv');

      expect(csv).toContain('Date');
      expect(csv).toContain('Type');
      expect(csv).toContain('2024-01-15');
      expect(csv).toContain('claim');
    });

    it('should generate JSON export for transactions', async () => {
      const json = await ExportService.generateTransactionExport(mockTransactions, 'json');
      const parsed = JSON.parse(json);

      expect(parsed.type).toBe('transactions');
      expect(parsed.data).toHaveLength(2);
      expect(parsed.data[0].id).toBe('1');
    });

    it('should throw error for unsupported format', async () => {
      await expect(
        ExportService.generateTransactionExport(mockTransactions, 'pdf' as any)
      ).rejects.toThrow('Unsupported export format');
    });
  });

  describe('generatePortfolioExport', () => {
    it('should generate CSV export for portfolio', async () => {
      const csv = await ExportService.generatePortfolioExport(mockPortfolio, 'csv');

      expect(csv).toContain('Total Value');
      expect(csv).toContain('5000');
    });

    it('should generate JSON export for portfolio', async () => {
      const json = await ExportService.generatePortfolioExport(mockPortfolio, 'json');
      const parsed = JSON.parse(json);

      expect(parsed.type).toBe('portfolio');
      expect(parsed.summary.totalValue).toBe(5000);
      expect(parsed.positions).toHaveLength(1);
    });
  });

  describe('generatePositionsExport', () => {
    it('should generate CSV export for positions', async () => {
      const csv = await ExportService.generatePositionsExport(mockPositions, 'csv');

      expect(csv).toContain('Market ID');
      expect(csv).toContain('Will Bitcoin reach $100k?');
    });

    it('should generate JSON export for positions', async () => {
      const json = await ExportService.generatePositionsExport(mockPositions, 'json');
      const parsed = JSON.parse(json);

      expect(parsed.type).toBe('positions');
      expect(parsed.data).toHaveLength(1);
    });
  });

  describe('generateRewardsExport', () => {
    it('should generate CSV export for rewards', async () => {
      const csv = await ExportService.generateRewardsExport(mockRewards, 'csv');

      expect(csv).toContain('Date');
      expect(csv).toContain('Type');
      expect(csv).toContain('referral_bonus');
    });

    it('should generate JSON export for rewards', async () => {
      const json = await ExportService.generateRewardsExport(mockRewards, 'json');
      const parsed = JSON.parse(json);

      expect(parsed.type).toBe('rewards');
      expect(parsed.totalAmount).toBe(150);
      expect(parsed.data).toHaveLength(2);
    });
  });

  describe('generateTaxReport', () => {
    it('should generate tax report for specific year', async () => {
      const json = await ExportService.generateTaxReport(mockTransactions, 2024, 'json');
      const parsed = JSON.parse(json);

      expect(parsed.type).toBe('tax_report');
      expect(parsed.year).toBe(2024);
    });

    it('should calculate tax income from claims', async () => {
      const json = await ExportService.generateTaxReport(mockTransactions, 2024, 'json');
      const parsed = JSON.parse(json);

      expect(parsed.totalIncome).toBe(500);
    });

    it('should calculate tax losses from stakes', async () => {
      const json = await ExportService.generateTaxReport(mockTransactions, 2024, 'json');
      const parsed = JSON.parse(json);

      expect(parsed.totalLosses).toBe(100);
    });

    it('should calculate net gain loss correctly', async () => {
      const json = await ExportService.generateTaxReport(mockTransactions, 2024, 'json');
      const parsed = JSON.parse(json);

      expect(parsed.netGainLoss).toBe(400);
    });

    it('should filter transactions by year', async () => {
      const futureTransaction: ExportTransaction = {
        ...mockTransactions[0],
        id: '3',
        date: '2025-01-15',
      };

      const json = await ExportService.generateTaxReport([...mockTransactions, futureTransaction], 2024, 'json');
      const parsed = JSON.parse(json);

      expect(parsed.transactions).toHaveLength(2);
    });

    it('should generate CSV tax report', async () => {
      const csv = await ExportService.generateTaxReport(mockTransactions, 2024, 'csv');

      expect(csv).toContain('Year');
      expect(csv).toContain('2024');
      expect(csv).toContain('Total Income');
    });
  });

  describe('downloadExport', () => {
    it('should call downloadFile with correct parameters', () => {
      const downloadFileSpy = vi.spyOn(ExportService as any, 'downloadFile');

      ExportService.downloadExport('test,data', 'test.csv', 'csv');

      expect(downloadFileSpy).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'text/csv');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty transaction list', async () => {
      const csv = await ExportService.generateTransactionExport([], 'csv');

      expect(csv).toContain('Date');
    });

    it('should handle transactions with missing txHash', async () => {
      const transactionWithoutHash = { ...mockTransactions[0], txHash: null };
      const csv = await ExportService.generateTransactionExport([transactionWithoutHash], 'csv');

      expect(csv).toBeTruthy();
    });

    it('should handle very large currency amounts', async () => {
      const largeTransaction = {
        ...mockTransactions[0],
        amount: 999999999.99,
      };
      const json = await ExportService.generateTransactionExport([largeTransaction], 'json');

      expect(json).toContain('999999999.99');
    });

    it('should handle zero amounts', async () => {
      const zeroTransaction = {
        ...mockTransactions[0],
        amount: 0,
      };
      const csv = await ExportService.generateTransactionExport([zeroTransaction], 'csv');

      expect(csv).toBeTruthy();
    });
  });
});
