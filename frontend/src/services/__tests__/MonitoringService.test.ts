import { describe, it, expect, beforeEach } from 'vitest';
import { monitoringService } from '../MonitoringService';

describe('MonitoringService', () => {
  beforeEach(() => {
    monitoringService.clearAllMetrics();
  });

  describe('trackPerformance', () => {
    it('should track performance metric', () => {
      monitoringService.trackPerformance('api_call', 150, 'ms');
      const metrics = monitoringService.getPerformanceMetrics();

      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('api_call');
      expect(metrics[0].value).toBe(150);
      expect(metrics[0].unit).toBe('ms');
    });

    it('should track bytes', () => {
      monitoringService.trackPerformance('data_size', 1024, 'bytes');
      const metrics = monitoringService.getPerformanceMetrics();

      expect(metrics[0].unit).toBe('bytes');
      expect(metrics[0].value).toBe(1024);
    });

    it('should track count', () => {
      monitoringService.trackPerformance('request_count', 100, 'count');
      const metrics = monitoringService.getPerformanceMetrics();

      expect(metrics[0].unit).toBe('count');
      expect(metrics[0].value).toBe(100);
    });

    it('should include context', () => {
      monitoringService.trackPerformance('api_call', 150, 'ms', {
        endpoint: '/api/users',
        method: 'GET',
      });

      const metrics = monitoringService.getPerformanceMetrics();
      expect(metrics[0].context).toEqual({
        endpoint: '/api/users',
        method: 'GET',
      });
    });
  });

  describe('trackError', () => {
    it('should track error', () => {
      monitoringService.trackError('api_error', 'Network error');
      const metrics = monitoringService.getErrorMetrics();

      expect(metrics).toHaveLength(1);
      expect(metrics[0].type).toBe('api_error');
      expect(metrics[0].message).toBe('Network error');
      expect(metrics[0].count).toBe(1);
    });

    it('should increment count for duplicate errors', () => {
      monitoringService.trackError('api_error', 'Network error');
      monitoringService.trackError('api_error', 'Network error');

      const metrics = monitoringService.getErrorMetrics();
      expect(metrics[0].count).toBe(2);
    });

    it('should update last seen time', () => {
      const firstTime = Date.now();
      monitoringService.trackError('api_error', 'Network error');

      setTimeout(() => {
        monitoringService.trackError('api_error', 'Network error');
        const metrics = monitoringService.getErrorMetrics();
        expect(metrics[0].lastSeen).toBeGreaterThan(firstTime);
      }, 100);
    });
  });

  describe('trackUserAction', () => {
    it('should track user action', () => {
      monitoringService.trackUserAction('button_click', { button: 'submit' });
      const actions = monitoringService.getUserActions();

      expect(actions).toHaveLength(1);
      expect(actions[0].action).toBe('button_click');
      expect(actions[0].context).toEqual({ button: 'submit' });
    });
  });

  describe('trackContractCall', () => {
    it('should track successful contract call', () => {
      monitoringService.trackContractCall('market-core', 'create-market', 250, true);
      const metrics = monitoringService.getPerformanceMetrics();

      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('contract_market-core_create-market');
      expect(metrics[0].value).toBe(250);
    });

    it('should track failed contract call', () => {
      monitoringService.trackContractCall('market-core', 'create-market', 250, false);
      const metrics = monitoringService.getPerformanceMetrics();
      const errors = monitoringService.getErrorMetrics();

      expect(metrics).toHaveLength(1);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('contract_call_failed');
    });
  });

  describe('trackPageView', () => {
    it('should track page view', () => {
      monitoringService.trackPageView('/markets', { marketId: 1 });
      const actions = monitoringService.getUserActions();

      expect(actions).toHaveLength(1);
      expect(actions[0].action).toBe('page_view');
      expect(actions[0].context).toEqual({ page: '/markets', marketId: 1 });
    });
  });

  describe('trackButtonClick', () => {
    it('should track button click', () => {
      monitoringService.trackButtonClick('create-market');
      const actions = monitoringService.getUserActions();

      expect(actions).toHaveLength(1);
      expect(actions[0].action).toBe('button_click');
      expect(actions[0].context).toEqual({ button: 'create-market' });
    });
  });

  describe('trackTransaction', () => {
    it('should track successful transaction', () => {
      monitoringService.trackTransaction('stake', 'success', 500);
      const metrics = monitoringService.getPerformanceMetrics();

      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('transaction_stake');
      expect(metrics[0].value).toBe(500);
    });

    it('should track failed transaction', () => {
      monitoringService.trackTransaction('stake', 'failed', 500);
      const errors = monitoringService.getErrorMetrics();

      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('transaction_failed');
    });
  });

  describe('getPerformanceStats', () => {
    it('should return performance statistics', () => {
      monitoringService.trackPerformance('api_call', 100, 'ms');
      monitoringService.trackPerformance('api_call', 200, 'ms');
      monitoringService.trackPerformance('db_call', 50, 'ms');

      const stats = monitoringService.getPerformanceStats();

      expect(stats.total).toBe(3);
      expect(stats.byName.api_call).toBe(2);
      expect(stats.byName.db_call).toBe(1);
      expect(stats.avgByName.api_call).toBe(150);
      expect(stats.avgByName.db_call).toBe(50);
    });
  });

  describe('getErrorStats', () => {
    it('should return error statistics', () => {
      monitoringService.trackError('api_error', 'Network error');
      monitoringService.trackError('api_error', 'Network error');
      monitoringService.trackError('contract_error', 'Contract not found');

      const stats = monitoringService.getErrorStats();

      expect(stats.total).toBe(2);
      expect(stats.byType.api_error).toBe(2);
      expect(stats.byType.contract_error).toBe(1);
      expect(stats.byMessage['Network error']).toBe(2);
      expect(stats.byMessage['Contract not found']).toBe(1);
    });
  });

  describe('getRecentUserActions', () => {
    it('should return recent user actions', () => {
      monitoringService.trackUserAction('action1');
      monitoringService.trackUserAction('action2');
      monitoringService.trackUserAction('action3');

      const recent = monitoringService.getRecentUserActions(2);

      expect(recent).toHaveLength(2);
      expect(recent[0].action).toBe('action2');
      expect(recent[1].action).toBe('action3');
    });
  });

  describe('clearAllMetrics', () => {
    it('should clear all metrics', () => {
      monitoringService.trackPerformance('api_call', 100);
      monitoringService.trackError('api_error', 'Error');
      monitoringService.trackUserAction('action');

      monitoringService.clearAllMetrics();

      expect(monitoringService.getPerformanceMetrics()).toHaveLength(0);
      expect(monitoringService.getErrorMetrics()).toHaveLength(0);
      expect(monitoringService.getUserActions()).toHaveLength(0);
    });
  });

  describe('maxMetrics', () => {
    it('should respect max metrics limit', () => {
      const testService = new (require('../MonitoringService').MonitoringService)({
        maxMetrics: 5,
      });

      for (let i = 0; i < 10; i++) {
        testService.trackPerformance(`metric_${i}`, i);
      }

      const metrics = testService.getPerformanceMetrics();
      expect(metrics).toHaveLength(5);
    });
  });
});
