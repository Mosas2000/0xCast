import { useCallback, useMemo } from 'react';
import { logger, type LogEntry, type LogLevel } from '../utils/logger';
import { monitoringService } from '../services/MonitoringService';

interface UseLoggerReturn {
  debug: (message: string, context?: Record<string, any>) => void;
  info: (message: string, context?: Record<string, any>) => void;
  warn: (message: string, context?: Record<string, any>) => void;
  error: (message: string, context?: Record<string, any>) => void;
  fatal: (message: string, context?: Record<string, any>) => void;
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
    context?: Record<string, any>
  ) => void;
  trackError: (type: string, message: string, context?: Record<string, any>) => void;
  trackUserAction: (action: string, context?: Record<string, any>) => void;
  trackContractCall: (
    contract: string,
    function: string,
    duration: number,
    success: boolean,
    context?: Record<string, any>
  ) => void;
  trackPageView: (page: string, context?: Record<string, any>) => void;
  trackButtonClick: (button: string, context?: Record<string, any>) => void;
  trackTransaction: (
    type: string,
    status: string,
    duration: number,
    context?: Record<string, any>
  ) => void;
}

export function useLogger(component?: string): UseLoggerReturn {
  const context = useMemo(() => {
    return component ? { component } : undefined;
  }, [component]);

  const debug = useCallback(
    (message: string, ctx?: Record<string, any>) => {
      logger.debug(message, { ...context, ...ctx });
    },
    [context]
  );

  const info = useCallback(
    (message: string, ctx?: Record<string, any>) => {
      logger.info(message, { ...context, ...ctx });
    },
    [context]
  );

  const warn = useCallback(
    (message: string, ctx?: Record<string, any>) => {
      logger.warn(message, { ...context, ...ctx });
    },
    [context]
  );

  const error = useCallback(
    (message: string, ctx?: Record<string, any>) => {
      logger.error(message, { ...context, ...ctx });
    },
    [context]
  );

  const fatal = useCallback(
    (message: string, ctx?: Record<string, any>) => {
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
      ctx?: Record<string, any>
    ) => {
      monitoringService.trackPerformance(name, value, unit, { ...context, ...ctx });
    },
    [context]
  );

  const trackError = useCallback(
    (type: string, message: string, ctx?: Record<string, any>) => {
      monitoringService.trackError(type, message, { ...context, ...ctx });
    },
    [context]
  );

  const trackUserAction = useCallback(
    (action: string, ctx?: Record<string, any>) => {
      monitoringService.trackUserAction(action, { ...context, ...ctx });
    },
    [context]
  );

  const trackContractCall = useCallback(
    (
      contract: string,
      function: string,
      duration: number,
      success: boolean,
      ctx?: Record<string, any>
    ) => {
      monitoringService.trackContractCall(
        contract,
        function,
        duration,
        success,
        { ...context, ...ctx }
      );
    },
    [context]
  );

  const trackPageView = useCallback(
    (page: string, ctx?: Record<string, any>) => {
      monitoringService.trackPageView(page, { ...context, ...ctx });
    },
    [context]
  );

  const trackButtonClick = useCallback(
    (button: string, ctx?: Record<string, any>) => {
      monitoringService.trackButtonClick(button, { ...context, ...ctx });
    },
    [context]
  );

  const trackTransaction = useCallback(
    (type: string, status: string, duration: number, ctx?: Record<string, any>) => {
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
