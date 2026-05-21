import { useState, useCallback } from 'react';
import type { ExportOptions, ExportProgress } from '@/types/export';
import type { TransactionData, Portfolio, Position, RewardData } from '@/types/transactions';
import { ExportService } from '@/services/ExportService';
import { getFileNameWithTimestamp } from '@/utils/exportHelpers';

interface UseExportReturn {
  isExporting: boolean;
  progress: ExportProgress;
  error: string | null;
  exportTransactions: (transactions: TransactionData[], options: ExportOptions) => Promise<void>;
  exportPortfolio: (portfolio: Portfolio, options: ExportOptions) => Promise<void>;
  exportPositions: (positions: Position[], options: ExportOptions) => Promise<void>;
  exportRewards: (rewards: RewardData[], options: ExportOptions) => Promise<void>;
  exportTaxReport: (transactions: TransactionData[], year: number, options: ExportOptions) => Promise<void>;
  reset: () => void;
}

const initialProgress: ExportProgress = {
  status: 'pending',
  progress: 0,
  totalRecords: 0,
  processedRecords: 0,
};

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress>(initialProgress);
  const [error, setError] = useState<string | null>(null);

  const updateProgress = useCallback((processed: number, total: number) => {
    setProgress(prev => ({
      ...prev,
      processedRecords: processed,
      totalRecords: total,
      progress: Math.round((processed / total) * 100),
    }));
  }, []);

  const exportTransactions = useCallback(
    async (transactions: TransactionData[], options: ExportOptions) => {
      try {
        setIsExporting(true);
        setError(null);
        setProgress({
          ...initialProgress,
          status: 'processing',
          totalRecords: transactions.length,
        });

        updateProgress(0, transactions.length);

        const content = await ExportService.generateTransactionExport(transactions, options.format);

        updateProgress(transactions.length, transactions.length);

        const fileName = getFileNameWithTimestamp('transactions', options.format);
        ExportService.downloadExport(content, fileName, options.format);

        setProgress(prev => ({
          ...prev,
          status: 'completed',
          downloadUrl: fileName,
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Export failed';
        setError(errorMessage);
        setProgress(prev => ({
          ...prev,
          status: 'failed',
          error: errorMessage,
        }));
      } finally {
        setIsExporting(false);
      }
    },
    [updateProgress]
  );

  const exportPortfolio = useCallback(
    async (portfolio: Portfolio, options: ExportOptions) => {
      try {
        setIsExporting(true);
        setError(null);
        setProgress({
          ...initialProgress,
          status: 'processing',
          totalRecords: 1,
        });

        const content = await ExportService.generatePortfolioExport(portfolio, options.format);

        const fileName = getFileNameWithTimestamp('portfolio', options.format);
        ExportService.downloadExport(content, fileName, options.format);

        setProgress(prev => ({
          ...prev,
          status: 'completed',
          downloadUrl: fileName,
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Export failed';
        setError(errorMessage);
        setProgress(prev => ({
          ...prev,
          status: 'failed',
          error: errorMessage,
        }));
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  const exportPositions = useCallback(
    async (positions: Position[], options: ExportOptions) => {
      try {
        setIsExporting(true);
        setError(null);
        setProgress({
          ...initialProgress,
          status: 'processing',
          totalRecords: positions.length,
        });

        updateProgress(0, positions.length);

        const content = await ExportService.generatePositionsExport(positions, options.format);

        updateProgress(positions.length, positions.length);

        const fileName = getFileNameWithTimestamp('positions', options.format);
        ExportService.downloadExport(content, fileName, options.format);

        setProgress(prev => ({
          ...prev,
          status: 'completed',
          downloadUrl: fileName,
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Export failed';
        setError(errorMessage);
        setProgress(prev => ({
          ...prev,
          status: 'failed',
          error: errorMessage,
        }));
      } finally {
        setIsExporting(false);
      }
    },
    [updateProgress]
  );

  const exportRewards = useCallback(
    async (rewards: RewardData[], options: ExportOptions) => {
      try {
        setIsExporting(true);
        setError(null);
        setProgress({
          ...initialProgress,
          status: 'processing',
          totalRecords: rewards.length,
        });

        updateProgress(0, rewards.length);

        const content = await ExportService.generateRewardsExport(rewards, options.format);

        updateProgress(rewards.length, rewards.length);

        const fileName = getFileNameWithTimestamp('rewards', options.format);
        ExportService.downloadExport(content, fileName, options.format);

        setProgress(prev => ({
          ...prev,
          status: 'completed',
          downloadUrl: fileName,
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Export failed';
        setError(errorMessage);
        setProgress(prev => ({
          ...prev,
          status: 'failed',
          error: errorMessage,
        }));
      } finally {
        setIsExporting(false);
      }
    },
    [updateProgress]
  );

  const exportTaxReport = useCallback(
    async (transactions: TransactionData[], year: number, options: ExportOptions) => {
      try {
        setIsExporting(true);
        setError(null);
        setProgress({
          ...initialProgress,
          status: 'processing',
          totalRecords: transactions.length,
        });

        updateProgress(0, transactions.length);

        const content = await ExportService.generateTaxReport(transactions, year, options.format);

        updateProgress(transactions.length, transactions.length);

        const fileName = getFileNameWithTimestamp(`tax-report-${year}`, options.format);
        ExportService.downloadExport(content, fileName, options.format);

        setProgress(prev => ({
          ...prev,
          status: 'completed',
          downloadUrl: fileName,
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Export failed';
        setError(errorMessage);
        setProgress(prev => ({
          ...prev,
          status: 'failed',
          error: errorMessage,
        }));
      } finally {
        setIsExporting(false);
      }
    },
    [updateProgress]
  );

  const reset = useCallback(() => {
    setIsExporting(false);
    setProgress(initialProgress);
    setError(null);
  }, []);

  return {
    isExporting,
    progress,
    error,
    exportTransactions,
    exportPortfolio,
    exportPositions,
    exportRewards,
    exportTaxReport,
    reset,
  };
}
