import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScheduledExports } from './useScheduledExports';
import type { ScheduledExport } from '../types/export';

describe('useScheduledExports', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty exports', () => {
    const { result } = renderHook(() => useScheduledExports());

    expect(result.current.exports).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should add scheduled export', async () => {
    const { result } = renderHook(() => useScheduledExports());

    const newExport: ScheduledExport = {
      id: '',
      exportType: 'transactions',
      format: 'csv',
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        time: { hours: 9, minutes: 0 },
      },
      createdAt: '',
      lastRunAt: null,
      nextRunAt: '',
      isActive: true,
    };

    await act(async () => {
      await result.current.addScheduledExport(newExport);
    });

    expect(result.current.exports).toHaveLength(1);
    expect(result.current.exports[0].exportType).toBe('transactions');
  });

  it('should remove scheduled export', async () => {
    const { result } = renderHook(() => useScheduledExports());

    const newExport: ScheduledExport = {
      id: '',
      exportType: 'transactions',
      format: 'csv',
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        time: { hours: 9, minutes: 0 },
      },
      createdAt: '',
      lastRunAt: null,
      nextRunAt: '',
      isActive: true,
    };

    let exportId = '';

    await act(async () => {
      await result.current.addScheduledExport(newExport);
    });

    exportId = result.current.exports[0].id;

    await act(async () => {
      await result.current.removeScheduledExport(exportId);
    });

    expect(result.current.exports).toHaveLength(0);
  });

  it('should pause scheduled export', async () => {
    const { result } = renderHook(() => useScheduledExports());

    const newExport: ScheduledExport = {
      id: '',
      exportType: 'transactions',
      format: 'csv',
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        time: { hours: 9, minutes: 0 },
      },
      createdAt: '',
      lastRunAt: null,
      nextRunAt: '',
      isActive: true,
    };

    await act(async () => {
      await result.current.addScheduledExport(newExport);
    });

    const exportId = result.current.exports[0].id;

    await act(async () => {
      await result.current.pauseExport(exportId);
    });

    expect(result.current.exports[0].isActive).toBe(false);
  });

  it('should resume scheduled export', async () => {
    const { result } = renderHook(() => useScheduledExports());

    const newExport: ScheduledExport = {
      id: '',
      exportType: 'transactions',
      format: 'csv',
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        time: { hours: 9, minutes: 0 },
      },
      createdAt: '',
      lastRunAt: null,
      nextRunAt: '',
      isActive: false,
    };

    await act(async () => {
      await result.current.addScheduledExport(newExport);
    });

    const exportId = result.current.exports[0].id;

    await act(async () => {
      await result.current.resumeExport(exportId);
    });

    expect(result.current.exports[0].isActive).toBe(true);
  });

  it('should update scheduled export', async () => {
    const { result } = renderHook(() => useScheduledExports());

    const newExport: ScheduledExport = {
      id: '',
      exportType: 'transactions',
      format: 'csv',
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        time: { hours: 9, minutes: 0 },
      },
      createdAt: '',
      lastRunAt: null,
      nextRunAt: '',
      isActive: true,
    };

    await act(async () => {
      await result.current.addScheduledExport(newExport);
    });

    const exportId = result.current.exports[0].id;

    await act(async () => {
      await result.current.updateScheduledExport(exportId, {
        format: 'json',
      });
    });

    expect(result.current.exports[0].format).toBe('json');
  });

  it('should calculate next run time for daily frequency', () => {
    const { result } = renderHook(() => useScheduledExports());

    const nextRun = result.current.getNextRunTime({
      frequency: 'daily',
      time: { hours: 9, minutes: 0 },
    });

    expect(nextRun).toBeInstanceOf(Date);
  });

  it('should calculate next run time for weekly frequency', () => {
    const { result } = renderHook(() => useScheduledExports());

    const nextRun = result.current.getNextRunTime({
      frequency: 'weekly',
      dayOfWeek: 1,
      time: { hours: 9, minutes: 0 },
    });

    expect(nextRun).toBeInstanceOf(Date);
  });

  it('should calculate next run time for monthly frequency', () => {
    const { result } = renderHook(() => useScheduledExports());

    const nextRun = result.current.getNextRunTime({
      frequency: 'monthly',
      dayOfMonth: 15,
      time: { hours: 9, minutes: 0 },
    });

    expect(nextRun).toBeInstanceOf(Date);
  });

  it('should persist exports to localStorage', async () => {
    const { result } = renderHook(() => useScheduledExports());

    const newExport: ScheduledExport = {
      id: '',
      exportType: 'transactions',
      format: 'csv',
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        time: { hours: 9, minutes: 0 },
      },
      createdAt: '',
      lastRunAt: null,
      nextRunAt: '',
      isActive: true,
    };

    await act(async () => {
      await result.current.addScheduledExport(newExport);
    });

    const stored = localStorage.getItem('scheduledExports');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toHaveLength(1);
  });

  it('should generate unique IDs for exports', async () => {
    const { result } = renderHook(() => useScheduledExports());

    const newExport: ScheduledExport = {
      id: '',
      exportType: 'transactions',
      format: 'csv',
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        time: { hours: 9, minutes: 0 },
      },
      createdAt: '',
      lastRunAt: null,
      nextRunAt: '',
      isActive: true,
    };

    await act(async () => {
      await result.current.addScheduledExport(newExport);
      await result.current.addScheduledExport(newExport);
    });

    const ids = result.current.exports.map(e => e.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(2);
  });

  it('should handle export addition errors gracefully', async () => {
    const { result } = renderHook(() => useScheduledExports());

    const newExport: ScheduledExport = {
      id: '',
      exportType: 'transactions',
      format: 'csv',
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        time: { hours: 9, minutes: 0 },
      },
      createdAt: '',
      lastRunAt: null,
      nextRunAt: '',
      isActive: true,
    };

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    try {
      await act(async () => {
        await result.current.addScheduledExport(newExport);
      });
    } catch {
      expect(result.current.error).toBeTruthy();
    }

    vi.restoreAllMocks();
  });

  it('should maintain export order', async () => {
    const { result } = renderHook(() => useScheduledExports());

    const export1: ScheduledExport = {
      id: '',
      exportType: 'transactions',
      format: 'csv',
      schedule: {
        frequency: 'daily',
        time: { hours: 9, minutes: 0 },
      },
      createdAt: '',
      lastRunAt: null,
      nextRunAt: '',
      isActive: true,
    };

    const export2: ScheduledExport = {
      id: '',
      exportType: 'portfolio',
      format: 'json',
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 1,
        time: { hours: 10, minutes: 0 },
      },
      createdAt: '',
      lastRunAt: null,
      nextRunAt: '',
      isActive: true,
    };

    await act(async () => {
      await result.current.addScheduledExport(export1);
      await result.current.addScheduledExport(export2);
    });

    expect(result.current.exports[0].exportType).toBe('transactions');
    expect(result.current.exports[1].exportType).toBe('portfolio');
  });
});
