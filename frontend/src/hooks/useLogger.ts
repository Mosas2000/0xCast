import { useCallback, useMemo } from 'react';
import { logger, type LogEntry, type LogLevel } from '@/utils/logger';
import { monitoringService } from '@/services/MonitoringService';

interface UseLoggerReturn {
  debug: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>) => void;
  fatal: (message: string, context?: Record<string, unknown>) => void;
  setRequestId: (id: string) => void;
  setUserId: (id: string) => void;
  setTransactionId: (id: string) => void;
  clearRequestId: () => void;
  clearUserId: () => void;
  clearTransactionId: () => void;
  getEntries: () => LogEntry[];
  getEntriesByLevel: (level: LogLevel) => LogEntry[];
  getEntriesByComponent: (component: string) => LogEntry[];
  getEntriesByRequest: (requestId: string) => LogEntry[];
  getStats: () => { total: number; byLevel: Record<string, number> };
  trackPerformance: (
    name: string,
    value: number,
    unit?: 'ms' | 'bytes' | 'count',
    context?: Record<string, unknown>
  ) => void;
  trackError: (type: string, message: string, context?: Record<string, unknown>) => void;
  trackUserAction: (action: string, context?: Record<string, unknown>) => void;
  trackContractCall: (
    contract: string,
    functionName: string,
    duration: number,
    success: boolean,
    context?: Record<string, unknown>
  ) => void;
  trackPageView: (page: string, context?: Record<string, unknown>) => void;
  trackButtonClick: (button: string, context?: Record<string, unknown>) => void;
  trackTransaction: (
    type: string,
    status: string,
    duration: number,
    context?: Record<string, unknown>
  ) => void;
}

export function useLogger(component?: string): UseLoggerReturn {
  const context = useMemo(() => {
    return component ? { component } : undefined;
  }, [component]);

  const debug = useCallback(
    (message: string, ctx?: Record<string, unknown>) => {
      logger.debug(message, { ...context, ...ctx });
    },
    [context]
  );

  const info = useCallback(
    (message: string, ctx?: Record<string, unknown>) => {
      logger.info(message, { ...context, ...ctx });
    },
    [context]
  );

  const warn = useCallback(
    (message: string, ctx?: Record<string, unknown>) => {
      logger.warn(message, { ...context, ...ctx });
    },
    [context]
  );

  const error = useCallback(
    (message: string, ctx?: Record<string, unknown>) => {
      logger.error(message, { ...context, ...ctx });
    },
    [context]
  );

  const fatal = useCallback(
    (message: string, ctx?: Record<string, unknown>) => {
      logger.fatal(message, { ...context, ...ctx });
    },
    [context]
  );

  const setRequestId = useCallback(
    (id: string) => {
      logger.setRequestId(id);
    },
    []
  );

  const setUserId = useCallback(
    (id: string) => {
      logger.setUserId(id);
    },
    []
  );

  const setTransactionId = useCallback(
    (id: string) => {
      logger.setTransactionId(id);
    },
    []
  );

  const clearRequestId = useCallback(() => {
    logger.clearRequestId();
  }, []);

  const clearUserId = useCallback(() => {
    logger.clearUserId();
  }, []);

  const clearTransactionId = useCallback(() => {
    logger.clearTransactionId();
  }, []);

  const getEntries = useCallback(() => {
    return logger.getEntries();
  }, []);

  const getEntriesByLevel = useCallback(
    (level: LogLevel) => {
      return logger.getEntriesByLevel(level);
    },
    []
  );

  const getEntriesByComponent = useCallback(
    (component: string) => {
      return logger.getEntriesByComponent(component);
    },
    []
  );

  const getEntriesByRequest = useCallback(
    (requestId: string) => {
      return logger.getEntriesByRequest(requestId);
    },
    []
  );

  const getStats = useCallback(() => {
    return logger.getStats();
  }, []);

  const trackPerformance = useCallback(
    (
      name: string,
      value: number,
      unit: 'ms' | 'bytes' | 'count' = 'ms',
      ctx?: Record<string, unknown>
    ) => {
      monitoringService.trackPerformance(name, value, unit, { ...context, ...ctx });
    },
    [context]
  );

  const trackError = useCallback(
    (type: string, message: string, ctx?: Record<string, unknown>) => {
      monitoringService.trackError(type, message, { ...context, ...ctx });
    },
    [context]
  );

  const trackUserAction = useCallback(
    (action: string, ctx?: Record<string, unknown>) => {
      monitoringService.trackUserAction(action, { ...context, ...ctx });
    },
    [context]
  );

  const trackContractCall = useCallback(
    (
      contract: string,
      functionName: string,
      duration: number,
      success: boolean,
      ctx?: Record<string, unknown>
    ) => {
      monitoringService.trackContractCall(
        contract,
        functionName,
        duration,
        success,
        { ...context, ...ctx }
      );
    },
    [context]
  );

  const trackPageView = useCallback(
    (page: string, ctx?: Record<string, unknown>) => {
      monitoringService.trackPageView(page, { ...context, ...ctx });
    },
    [context]
  );

  const trackButtonClick = useCallback(
    (button: string, ctx?: Record<string, unknown>) => {
      monitoringService.trackButtonClick(button, { ...context, ...ctx });
    },
    [context]
  );

  const trackTransaction = useCallback(
    (type: string, status: string, duration: number, ctx?: Record<string, unknown>) => {
      monitoringService.trackTransaction(type, status, duration, { ...context, ...ctx });
    },
    [context]
  );

  return {
    debug,
    info,
    warn,
    error,
    fatal,
    setRequestId,
    setUserId,
    setTransactionId,
    clearRequestId,
    clearUserId,
    clearTransactionId,
    getEntries,
    getEntriesByLevel,
    getEntriesByComponent,
    getEntriesByRequest,
    getStats,
    trackPerformance,
    trackError,
    trackUserAction,
    trackContractCall,
    trackPageView,
    trackButtonClick,
    trackTransaction,
  };
}
