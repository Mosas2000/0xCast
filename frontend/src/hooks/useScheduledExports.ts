import { useState, useCallback, useEffect } from 'react';
import type { ScheduledExport, ExportSchedule } from '../types/export';
import { GDPRComplianceService } from '../services/GDPRComplianceService';
import { SecureStorageV2Service } from '../services/SecureStorageV2Service';

interface UseScheduledExportsReturn {
  exports: ScheduledExport[];
  isLoading: boolean;
  error: string | null;
  addScheduledExport: (exportConfig: ScheduledExport) => Promise<void>;
  removeScheduledExport: (exportId: string) => Promise<void>;
  updateScheduledExport: (exportId: string, config: Partial<ScheduledExport>) => Promise<void>;
  getNextRunTime: (schedule: ExportSchedule) => Date;
  pauseExport: (exportId: string) => Promise<void>;
  resumeExport: (exportId: string) => Promise<void>;
}

export function useScheduledExports(): UseScheduledExportsReturn {
  const [exports, setExports] = useState<ScheduledExport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadScheduledExports();
  }, []);

  const loadScheduledExports = async () => {
    try {
      setIsLoading(true);

      const secure = await SecureStorageV2Service.getItem<ScheduledExport[]>('scheduledExports');
      if (secure) {
        setExports(secure);
        return;
      }

      const stored = localStorage.getItem('scheduledExports');
      if (stored) {
        setExports(JSON.parse(stored));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load scheduled exports';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const persistExports = useCallback((updatedExports: ScheduledExport[]) => {
    if (GDPRComplianceService.isPersonalizationEnabled()) {
      localStorage.setItem('scheduledExports', JSON.stringify(updatedExports));

      SecureStorageV2Service.setItem('scheduledExports', updatedExports, {
        encrypt: true,
        category: 'personalization',
        expiresIn: 365 * 24 * 60 * 60 * 1000,
      }).catch(error => {
        console.warn('Failed to store scheduled exports in secure storage:', error);
      });
    }
    setExports(updatedExports);
  }, []);

  const addScheduledExport = useCallback(
    async (exportConfig: ScheduledExport) => {
      try {
        setError(null);
        const newExport: ScheduledExport = {
          ...exportConfig,
          id: `export_${Date.now()}`,
          createdAt: new Date().toISOString(),
          lastRunAt: null,
          nextRunAt: calculateNextRun(exportConfig.schedule),
          isActive: true,
        };

        const updated = [...exports, newExport];
        persistExports(updated);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add scheduled export';
        setError(errorMessage);
        throw err;
      }
    },
    [exports, persistExports]
  );

  const removeScheduledExport = useCallback(
    async (exportId: string) => {
      try {
        setError(null);
        const updated = exports.filter(e => e.id !== exportId);
        persistExports(updated);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to remove scheduled export';
        setError(errorMessage);
        throw err;
      }
    },
    [exports, persistExports]
  );

  const updateScheduledExport = useCallback(
    async (exportId: string, config: Partial<ScheduledExport>) => {
      try {
        setError(null);
        const updated = exports.map(e =>
          e.id === exportId
            ? {
                ...e,
                ...config,
                nextRunAt: config.schedule ? calculateNextRun(config.schedule) : e.nextRunAt,
              }
            : e
        );
        persistExports(updated);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update scheduled export';
        setError(errorMessage);
        throw err;
      }
    },
    [exports, persistExports]
  );

  const pauseExport = useCallback(
    async (exportId: string) => {
      try {
        setError(null);
        const updated = exports.map(e =>
          e.id === exportId ? { ...e, isActive: false } : e
        );
        persistExports(updated);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to pause export';
        setError(errorMessage);
        throw err;
      }
    },
    [exports, persistExports]
  );

  const resumeExport = useCallback(
    async (exportId: string) => {
      try {
        setError(null);
        const updated = exports.map(e =>
          e.id === exportId
            ? { ...e, isActive: true, nextRunAt: calculateNextRun(e.schedule) }
            : e
        );
        persistExports(updated);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to resume export';
        setError(errorMessage);
        throw err;
      }
    },
    [exports, persistExports]
  );

  const getNextRunTime = useCallback((schedule: ExportSchedule): Date => {
    return new Date(calculateNextRun(schedule));
  }, []);

  return {
    exports,
    isLoading,
    error,
    addScheduledExport,
    removeScheduledExport,
    updateScheduledExport,
    getNextRunTime,
    pauseExport,
    resumeExport,
  };
}

function calculateNextRun(schedule: ExportSchedule): string {
  const now = new Date();
  const next = new Date(now);

  switch (schedule.frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      next.setHours(schedule.time?.hours || 0, schedule.time?.minutes || 0, 0, 0);
      break;
    case 'weekly':
      next.setDate(next.getDate() + (((schedule.dayOfWeek || 0) + 7 - now.getDay()) % 7) + (next.getDay() === schedule.dayOfWeek ? 7 : 0));
      next.setHours(schedule.time?.hours || 0, schedule.time?.minutes || 0, 0, 0);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      next.setDate(schedule.dayOfMonth || 1);
      next.setHours(schedule.time?.hours || 0, schedule.time?.minutes || 0, 0, 0);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      next.setDate(schedule.dayOfMonth || 1);
      next.setHours(schedule.time?.hours || 0, schedule.time?.minutes || 0, 0, 0);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      next.setMonth(schedule.month || 0);
      next.setDate(schedule.dayOfMonth || 1);
      next.setHours(schedule.time?.hours || 0, schedule.time?.minutes || 0, 0, 0);
      break;
  }

  return next.toISOString();
}
