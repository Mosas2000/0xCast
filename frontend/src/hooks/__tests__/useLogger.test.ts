import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLogger } from '../useLogger';

describe('useLogger', () => {
  beforeEach(() => {
    const { logger } = require('../../utils/logger');
    logger.clearEntries();
  });

  it('should provide logger methods', () => {
    const { result } = renderHook(() => useLogger());

    expect(result.current.debug).toBeDefined();
    expect(result.current.info).toBeDefined();
    expect(result.current.warn).toBeDefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.fatal).toBeDefined();
  });

  it('should log with component context', () => {
    const { result } = renderHook(() => useLogger('TestComponent'));

    act(() => {
      result.current.info('Test message');
    });

    const entries = require('../../utils/logger').logger.getEntries();
    expect(entries[0].component).toBe('TestComponent');
    expect(entries[0].message).toBe('Test message');
  });

  it('should set request ID', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.setRequestId('test-request-id');
    });

    const entries = require('../../utils/logger').logger.getEntries();
    expect(entries[0].requestId).toBe('test-request-id');
  });

  it('should set user ID', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.setUserId('test-user-id');
    });

    const entries = require('../../utils/logger').logger.getEntries();
    expect(entries[0].userId).toBe('test-user-id');
  });

  it('should set transaction ID', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.setTransactionId('test-tx-id');
    });

    const entries = require('../../utils/logger').logger.getEntries();
    expect(entries[0].transactionId).toBe('test-tx-id');
  });

  it('should clear request ID', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.setRequestId('test-request-id');
      result.current.clearRequestId();
    });

    const entries = require('../../utils/logger').logger.getEntries();
    expect(entries[0].requestId).not.toBe('test-request-id');
  });

  it('should clear user ID', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.setUserId('test-user-id');
      result.current.clearUserId();
    });

    const entries = require('../../utils/logger').logger.getEntries();
    expect(entries[0].userId).toBeUndefined();
  });

  it('should clear transaction ID', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.setTransactionId('test-tx-id');
      result.current.clearTransactionId();
    });

    const entries = require('../../utils/logger').logger.getEntries();
    expect(entries[0].transactionId).toBeUndefined();
  });

  it('should get entries', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.info('Test message');
    });

    act(() => {
      const entries = result.current.getEntries();
      expect(entries).toHaveLength(1);
    });
  });

  it('should get entries by level', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.debug('Debug');
      result.current.info('Info');
    });

    act(() => {
      const debugEntries = result.current.getEntriesByLevel('debug');
      expect(debugEntries).toHaveLength(1);
    });
  });

  it('should get entries by component', () => {
    const { result } = renderHook(() => useLogger('ComponentA'));

    act(() => {
      result.current.info('Message 1');
    });

    act(() => {
      const componentEntries = result.current.getEntriesByComponent('ComponentA');
      expect(componentEntries).toHaveLength(1);
    });
  });

  it('should get entries by request', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.setRequestId('req-1');
      result.current.info('Message 1');
    });

    act(() => {
      const requestEntries = result.current.getEntriesByRequest('req-1');
      expect(requestEntries).toHaveLength(1);
    });
  });

  it('should get stats', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.debug('Debug');
      result.current.info('Info');
    });

    act(() => {
      const stats = result.current.getStats();
      expect(stats.total).toBe(2);
      expect(stats.byLevel.debug).toBe(1);
      expect(stats.byLevel.info).toBe(1);
    });
  });

  it('should track performance', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.trackPerformance('api_call', 150, 'ms');
    });

    const metrics = require('../../services/MonitoringService').monitoringService.getPerformanceMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe('api_call');
  });

  it('should track error', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.trackError('api_error', 'Network error');
    });

    const errors = require('../../services/MonitoringService').monitoringService.getErrorMetrics();
    expect(errors).toHaveLength(1);
    expect(errors[0].type).toBe('api_error');
  });

  it('should track user action', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.trackUserAction('button_click');
    });

    const actions = require('../../services/MonitoringService').monitoringService.getUserActions();
    expect(actions).toHaveLength(1);
    expect(actions[0].action).toBe('button_click');
  });

  it('should track contract call', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.trackContractCall('market-core', 'create-market', 250, true);
    });

    const metrics = require('../../services/MonitoringService').monitoringService.getPerformanceMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe('contract_market-core_create-market');
  });

  it('should track page view', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.trackPageView('/markets');
    });

    const actions = require('../../services/MonitoringService').monitoringService.getUserActions();
    expect(actions).toHaveLength(1);
    expect(actions[0].action).toBe('page_view');
  });

  it('should track button click', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.trackButtonClick('create-market');
    });

    const actions = require('../../services/MonitoringService').monitoringService.getUserActions();
    expect(actions).toHaveLength(1);
    expect(actions[0].action).toBe('button_click');
  });

  it('should track transaction', () => {
    const { result } = renderHook(() => useLogger());

    act(() => {
      result.current.trackTransaction('stake', 'success', 500);
    });

    const metrics = require('../../services/MonitoringService').monitoringService.getPerformanceMetrics();
    expect(metrics).toHaveLength(1);
    expect(metrics[0].name).toBe('transaction_stake');
  });
});
