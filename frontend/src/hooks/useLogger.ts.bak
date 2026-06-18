import { useCallback, useMemo } from 'react';
import { logger, type LogEntry, type LogLevel } from '@/utils/logger';
import { monitoringService } from '@/services/MonitoringService';
import type { LogData } from '@/types/common';

interface UseLoggerReturn {
  debug: (message: string, context?: LogData) => void;
  info: (message: string, context?: LogData) => void;
  warn: (message: string, context?: LogData) => void;
  error: (message: string, context?: LogData) => void;
  fatal: (message: string, context?: LogData) => void;
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
    context?: LogData
  ) => void;
  trackError: (type: string, message: string, context?: LogData) => void;
  trackUserAction: (action: string, context?: LogData) => void;
  trackContractCall: (
    contract: string,
    functionName: string,
    duration: number,
    success: boolean,
    context?: LogData
  ) => void;
  trackPageView: (page: string, context?: LogData) => void;
  trackButtonClick: (button: string, context?: LogData) => void;
  trackTransaction: (
    type: string,
    status: string,
    duration: number,
    context?: LogData
  ) => void;
}

export function useLogger(component?: string): UseLoggerReturn {
  const context = useMemo(() => {
    return component ? { component } : undefined;
  }, [component]);

  const debug = useCallback(
    (message: string, ctx?: LogData) => {
      logger.debug(message, { ...context, ...ctx });
    },
    [context]
  );

  const info = useCallback(
    (message: string, ctx?: LogData) => {
      logger.info(message, { ...context, ...ctx });
    },
    [context]
  );

  const warn = useCallback(
    (message: string, ctx?: LogData) => {
      logger.warn(message, { ...context, ...ctx });
    },
    [context]
  );

  const error = useCallback(
    (message: string, ctx?: LogData) => {
      logger.error(message, { ...context, ...ctx });
    },
    [context]
  );

  const fatal = useCallback(
    (message: string, ctx?: LogData) => {
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
      ctx?: LogData
    ) => {
      monitoringService.trackPerformance(name, value, unit, { ...context, ...ctx });
    },
    [context]
  );

  const trackError = useCallback(
    (type: string, message: string, ctx?: LogData) => {
      monitoringService.trackError(type, message, { ...context, ...ctx });
    },
    [context]
  );

  const trackUserAction = useCallback(
    (action: string, ctx?: LogData) => {
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
      ctx?: LogData
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
    (page: string, ctx?: LogData) => {
      monitoringService.trackPageView(page, { ...context, ...ctx });
    },
    [context]
  );

  const trackButtonClick = useCallback(
    (button: string, ctx?: LogData) => {
      monitoringService.trackButtonClick(button, { ...context, ...ctx });
    },
    [context]
  );

  const trackTransaction = useCallback(
    (type: string, status: string, duration: number, ctx?: LogData) => {
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
