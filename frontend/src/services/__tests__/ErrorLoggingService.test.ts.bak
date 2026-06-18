import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ErrorLoggingService } from '../ErrorLoggingService';
import { ApiError, ErrorCode } from '../../utils/apiErrors';

describe('ErrorLoggingService', () => {
  let service: ErrorLoggingService;

  beforeEach(() => {
    service = new ErrorLoggingService();
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    service.clearLogs();
  });

  describe('logError', () => {
    it('should log an error', () => {
      const error = new Error('Test error');
      service.logError(error);

      const logs = service.getErrorLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Test error');
    });

    it('should log ApiError with code', () => {
      const error = new ApiError('Network error', ErrorCode.NETWORK_ERROR);
      service.logError(error);

      const logs = service.getErrorLogs();
      expect(logs[0].code).toBe(ErrorCode.NETWORK_ERROR);
    });

    it('should log error with context', () => {
      const error = new Error('Test error');
      const context = {
        component: 'TestComponent',
        action: 'testAction',
        additionalData: { key: 'value' },
      };

      service.logError(error, context);

      const logs = service.getErrorLogs();
      expect(logs[0].context).toEqual(context);
    });

    it('should log error with severity', () => {
      const error = new Error('Test error');
      service.logError(error, { component: 'Test' }, 'warning');

      const logs = service.getErrorLogs();
      expect(logs[0].severity).toBe('warning');
    });

    it('should default to error severity', () => {
      const error = new Error('Test error');
      service.logError(error);

      const logs = service.getErrorLogs();
      expect(logs[0].severity).toBe('error');
    });

    it('should include stack trace', () => {
      const error = new Error('Test error');
      service.logError(error);

      const logs = service.getErrorLogs();
      expect(logs[0].stack).toBeDefined();
    });

    it('should respect max log size', () => {
      const smallService = new ErrorLoggingService(5);

      for (let i = 0; i < 10; i++) {
        smallService.logError(new Error(`Error ${i}`));
      }

      const logs = smallService.getErrorLogs();
      expect(logs).toHaveLength(5);
      expect(logs[0].message).toBe('Error 5');
      expect(logs[4].message).toBe('Error 9');
    });
  });

  describe('getErrorLogs', () => {
    it('should return all logs', () => {
      service.logError(new Error('Error 1'));
      service.logError(new Error('Error 2'));
      service.logError(new Error('Error 3'));

      const logs = service.getErrorLogs();
      expect(logs).toHaveLength(3);
    });

    it('should return logs in chronological order', () => {
      service.logError(new Error('Error 1'));
      service.logError(new Error('Error 2'));

      const logs = service.getErrorLogs();
      expect(logs[0].message).toBe('Error 1');
      expect(logs[1].message).toBe('Error 2');
      expect(logs[0].timestamp).toBeLessThan(logs[1].timestamp);
    });
  });

  describe('clearLogs', () => {
    it('should clear all logs', () => {
      service.logError(new Error('Error 1'));
      service.logError(new Error('Error 2'));

      service.clearLogs();

      const logs = service.getErrorLogs();
      expect(logs).toHaveLength(0);
    });

    it('should clear localStorage', () => {
      service.logError(new Error('Error 1'));
      service.clearLogs();

      const stored = localStorage.getItem('error_logs');
      expect(stored).toBeNull();
    });
  });

  describe('getStatistics', () => {
    it('should return correct total errors', () => {
      service.logError(new Error('Error 1'));
      service.logError(new Error('Error 2'));

      const stats = service.getStatistics();
      expect(stats.totalErrors).toBe(2);
    });

    it('should count errors by code', () => {
      service.logError(new ApiError('Error 1', ErrorCode.NETWORK_ERROR));
      service.logError(new ApiError('Error 2', ErrorCode.NETWORK_ERROR));
      service.logError(new ApiError('Error 3', ErrorCode.TIMEOUT));

      const stats = service.getStatistics();
      expect(stats.errorsByCode[ErrorCode.NETWORK_ERROR]).toBe(2);
      expect(stats.errorsByCode[ErrorCode.TIMEOUT]).toBe(1);
    });

    it('should count errors by severity', () => {
      service.logError(new Error('Error 1'), undefined, 'error');
      service.logError(new Error('Error 2'), undefined, 'warning');
      service.logError(new Error('Error 3'), undefined, 'error');

      const stats = service.getStatistics();
      expect(stats.errorsBySeverity.error).toBe(2);
      expect(stats.errorsBySeverity.warning).toBe(1);
    });

    it('should count errors by component', () => {
      service.logError(new Error('Error 1'), { component: 'ComponentA' });
      service.logError(new Error('Error 2'), { component: 'ComponentA' });
      service.logError(new Error('Error 3'), { component: 'ComponentB' });

      const stats = service.getStatistics();
      expect(stats.errorsByComponent.ComponentA).toBe(2);
      expect(stats.errorsByComponent.ComponentB).toBe(1);
    });

    it('should track most recent error', () => {
      service.logError(new Error('Error 1'));
      const error2 = new Error('Error 2');
      service.logError(error2);

      const stats = service.getStatistics();
      expect(stats.mostRecentError?.message).toBe('Error 2');
    });

    it('should return null for most recent error when no logs', () => {
      const stats = service.getStatistics();
      expect(stats.mostRecentError).toBeNull();
    });
  });

  describe('persistence', () => {
    it('should persist logs to localStorage', () => {
      service.logError(new Error('Test error'));

      const stored = localStorage.getItem('error_logs');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].message).toBe('Test error');
    });

    it('should load logs from localStorage on initialization', () => {
      service.logError(new Error('Error 1'));

      const newService = new ErrorLoggingService();
      const logs = newService.getErrorLogs();

      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Error 1');
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('error_logs', 'invalid json');

      const newService = new ErrorLoggingService();
      const logs = newService.getErrorLogs();

      expect(logs).toHaveLength(0);
    });
  });

  describe('global error handler', () => {
    it('should register global error handler', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      new ErrorLoggingService();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
    });

    it('should register unhandled rejection handler', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      new ErrorLoggingService();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );
    });
  });

  describe('getErrorsByTimeRange', () => {
    it('should filter errors by time range', () => {
      const now = Date.now();
      service.logError(new Error('Error 1'));

      vi.setSystemTime(now + 10000);
      service.logError(new Error('Error 2'));

      vi.setSystemTime(now + 20000);
      service.logError(new Error('Error 3'));

      const errors = service.getErrorsByTimeRange(now + 5000, now + 15000);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Error 2');

      vi.useRealTimers();
    });
  });

  describe('getErrorsByComponent', () => {
    it('should filter errors by component', () => {
      service.logError(new Error('Error 1'), { component: 'ComponentA' });
      service.logError(new Error('Error 2'), { component: 'ComponentB' });
      service.logError(new Error('Error 3'), { component: 'ComponentA' });

      const errors = service.getErrorsByComponent('ComponentA');
      expect(errors).toHaveLength(2);
      expect(errors[0].message).toBe('Error 1');
      expect(errors[1].message).toBe('Error 3');
    });
  });

  describe('getErrorsBySeverity', () => {
    it('should filter errors by severity', () => {
      service.logError(new Error('Error 1'), undefined, 'error');
      service.logError(new Error('Error 2'), undefined, 'warning');
      service.logError(new Error('Error 3'), undefined, 'error');

      const errors = service.getErrorsBySeverity('error');
      expect(errors).toHaveLength(2);
      expect(errors[0].message).toBe('Error 1');
      expect(errors[1].message).toBe('Error 3');
    });
  });
});
