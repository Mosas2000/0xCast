import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useExport } from './useExport';
import * as ExportServiceModule from '../services/ExportService';

vi.mock('../services/ExportService', () => ({
  ExportService: {
    generateTransactionExport: vi.fn(),
    generatePortfolioExport: vi.fn(),
    generatePositionsExport: vi.fn(),
    generateRewardsExport: vi.fn(),
    generateTaxReport: vi.fn(),
    downloadExport: vi.fn(),
  },
}));

describe('useExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useExport());

    expect(result.current.isExporting).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.progress.status).toBe('pending');
  });

  it('should handle transaction export', async () => {
    const mockTransactions = [{ id: '1', amount: 100 }];
    const mockExportContent = 'id,amount\n1,100';

    vi.mocked(ExportServiceModule.ExportService.generateTransactionExport).mockResolvedValue(
      mockExportContent
    );

    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportTransactions(mockTransactions, {
        format: 'csv',
      });
    });

    expect(result.current.progress.status).toBe('completed');
    expect(result.current.error).toBeNull();
    expect(ExportServiceModule.ExportService.downloadExport).toHaveBeenCalled();
  });

  it('should handle portfolio export', async () => {
    const mockPortfolio = { totalValue: 5000 };
    const mockExportContent = '{"totalValue": 5000}';

    vi.mocked(ExportServiceModule.ExportService.generatePortfolioExport).mockResolvedValue(
      mockExportContent
    );

    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportPortfolio(mockPortfolio, {
        format: 'json',
      });
    });

    expect(result.current.progress.status).toBe('completed');
    expect(ExportServiceModule.ExportService.downloadExport).toHaveBeenCalled();
  });

  it('should handle positions export', async () => {
    const mockPositions = [{ marketId: 1, yesStake: 100 }];
    const mockExportContent = 'marketId,yesStake\n1,100';

    vi.mocked(ExportServiceModule.ExportService.generatePositionsExport).mockResolvedValue(
      mockExportContent
    );

    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportPositions(mockPositions, {
        format: 'csv',
      });
    });

    expect(result.current.progress.status).toBe('completed');
  });

  it('should handle rewards export', async () => {
    const mockRewards = [{ id: '1', amount: 50 }];
    const mockExportContent = 'id,amount\n1,50';

    vi.mocked(ExportServiceModule.ExportService.generateRewardsExport).mockResolvedValue(
      mockExportContent
    );

    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportRewards(mockRewards, {
        format: 'csv',
      });
    });

    expect(result.current.progress.status).toBe('completed');
  });

  it('should handle tax report export', async () => {
    const mockTransactions = [{ id: '1' }];
    const mockExportContent = '{"year": 2024}';

    vi.mocked(ExportServiceModule.ExportService.generateTaxReport).mockResolvedValue(
      mockExportContent
    );

    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportTaxReport(mockTransactions, 2024, {
        format: 'json',
      });
    });

    expect(result.current.progress.status).toBe('completed');
  });

  it('should handle export errors', async () => {
    const errorMessage = 'Export failed';
    vi.mocked(ExportServiceModule.ExportService.generateTransactionExport).mockRejectedValue(
      new Error(errorMessage)
    );

    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportTransactions([], { format: 'csv' });
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.progress.status).toBe('failed');
  });

  it('should update progress during export', async () => {
    const mockTransactions = Array(100).fill({ id: '1' });
    const mockExportContent = 'test';

    vi.mocked(ExportServiceModule.ExportService.generateTransactionExport).mockResolvedValue(
      mockExportContent
    );

    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportTransactions(mockTransactions, {
        format: 'csv',
      });
    });

    expect(result.current.progress.totalRecords).toBe(100);
    expect(result.current.progress.progress).toBeGreaterThan(0);
  });

  it('should reset state correctly', async () => {
    vi.mocked(ExportServiceModule.ExportService.generateTransactionExport).mockRejectedValue(
      new Error('Test error')
    );

    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportTransactions([], { format: 'csv' });
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.isExporting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.progress.status).toBe('pending');
  });

  it('should set isExporting to true during export', async () => {
    const mockTransactions = [{ id: '1' }];

    let capturedIsExporting: boolean[] = [];

    vi.mocked(ExportServiceModule.ExportService.generateTransactionExport).mockImplementation(
      async () => {
        capturedIsExporting.push(true);
        return 'test';
      }
    );

    const { result } = renderHook(() => useExport());

    await act(async () => {
      await result.current.exportTransactions(mockTransactions, {
        format: 'csv',
      });
    });

    expect(result.current.isExporting).toBe(false);
  });
});
