import { describe, it, expect, beforeEach } from 'vitest';
import { logger, type LogEntry, type LogLevel } from '../logger';

describe('logger', () => {
  beforeEach(() => {
    logger.clearEntries();
  });

  describe('log levels', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message');
      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe('debug');
      expect(entries[0].message).toBe('Debug message');
    });

    it('should log info messages', () => {
      logger.info('Info message');
      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe('info');
      expect(entries[0].message).toBe('Info message');
    });

    it('should log warn messages', () => {
      logger.warn('Warn message');
      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe('warn');
      expect(entries[0].message).toBe('Warn message');
    });

    it('should log error messages', () => {
      logger.error('Error message');
      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe('error');
      expect(entries[0].message).toBe('Error message');
    });

    it('should log fatal messages', () => {
      logger.fatal('Fatal message');
      const entries = logger.getEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].level).toBe('fatal');
      expect(entries[0].message).toBe('Fatal message');
    });
  });

  describe('context', () => {
    it('should include component in context', () => {
      logger.info('Test message', { component: 'TestComponent' });
      const entries = logger.getEntries();
      expect(entries[0].component).toBe('TestComponent');
    });

    it('should include action in context', () => {
      logger.info('Test message', { action: 'testAction' });
      const entries = logger.getEntries();
      expect(entries[0].action).toBe('testAction');
    });

    it('should include additional context', () => {
      logger.info('Test message', { key: 'value', number: 123 });
      const entries = logger.getEntries();
      expect(entries[0].context).toEqual({ key: 'value', number: 123 });
    });
  });

  describe('request ID', () => {
    it('should generate request ID', () => {
      logger.info('Test message');
      const entries = logger.getEntries();
      expect(entries[0].requestId).toBeDefined();
      expect(entries[0].requestId).toMatch(/^req-/);
    });

    it('should set custom request ID', () => {
      logger.setRequestId('custom-request-id');
      logger.info('Test message');
      const entries = logger.getEntries();
      expect(entries[0].requestId).toBe('custom-request-id');
    });

    it('should clear request ID', () => {
      logger.setRequestId('custom-request-id');
      logger.clearRequestId();
      logger.info('Test message');
      const entries = logger.getEntries();
      expect(entries[0].requestId).not.toBe('custom-request-id');
    });
  });

  describe('user ID', () => {
    it('should set user ID', () => {
      logger.setUserId('user-123');
      logger.info('Test message');
      const entries = logger.getEntries();
      expect(entries[0].userId).toBe('user-123');
    });

    it('should clear user ID', () => {
      logger.setUserId('user-123');
      logger.clearUserId();
      logger.info('Test message');
      const entries = logger.getEntries();
      expect(entries[0].userId).toBeUndefined();
    });
  });

  describe('transaction ID', () => {
    it('should set transaction ID', () => {
      logger.setTransactionId('tx-123');
      logger.info('Test message');
      const entries = logger.getEntries();
      expect(entries[0].transactionId).toBe('tx-123');
    });

    it('should clear transaction ID', () => {
      logger.setTransactionId('tx-123');
      logger.clearTransactionId();
      logger.info('Test message');
      const entries = logger.getEntries();
      expect(entries[0].transactionId).toBeUndefined();
    });
  });

  describe('getEntriesByLevel', () => {
    it('should filter entries by level', () => {
      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');
      logger.fatal('Fatal');

      const debugEntries = logger.getEntriesByLevel('debug');
      expect(debugEntries).toHaveLength(1);
      expect(debugEntries[0].level).toBe('debug');
    });
  });

  describe('getEntriesByComponent', () => {
    it('should filter entries by component', () => {
      logger.info('Message 1', { component: 'ComponentA' });
      logger.info('Message 2', { component: 'ComponentB' });
      logger.info('Message 3', { component: 'ComponentA' });

      const componentAEntries = logger.getEntriesByComponent('ComponentA');
      expect(componentAEntries).toHaveLength(2);
    });
  });

  describe('getEntriesByRequest', () => {
    it('should filter entries by request ID', () => {
      logger.setRequestId('req-1');
      logger.info('Message 1');

      logger.setRequestId('req-2');
      logger.info('Message 2');

      const req1Entries = logger.getEntriesByRequest('req-1');
      expect(req1Entries).toHaveLength(1);
      expect(req1Entries[0].message).toBe('Message 1');
    });
  });

  describe('getStats', () => {
    it('should return correct stats', () => {
      logger.debug('Debug');
      logger.info('Info');
      logger.info('Info 2');
      logger.warn('Warn');
      logger.error('Error');

      const stats = logger.getStats();
      expect(stats.total).toBe(5);
      expect(stats.byLevel.debug).toBe(1);
      expect(stats.byLevel.info).toBe(2);
      expect(stats.byLevel.warn).toBe(1);
      expect(stats.byLevel.error).toBe(1);
    });
  });

  describe('maxEntries', () => {
    it('should respect max entries limit', () => {
      const testLogger = new (require('../logger').Logger)({ maxEntries: 5 });

      for (let i = 0; i < 10; i++) {
        testLogger.info(`Message ${i}`);
      }

      const entries = testLogger.getEntries();
      expect(entries).toHaveLength(5);
      expect(entries[0].message).toBe('Message 5');
    });
  });

  describe('stack trace', () => {
    it('should include stack trace', () => {
      logger.error('Error with stack');
      const entries = logger.getEntries();
      expect(entries[0].stack).toBeDefined();
      expect(entries[0].stack).toContain('Error');
    });
  });

  describe('formatMessage', () => {
    it('should format message with all fields', () => {
      logger.setRequestId('req-123');
      logger.setUserId('user-456');
      logger.setTransactionId('tx-789');
      logger.info('Test message', { component: 'TestComponent', action: 'testAction' });

      const entries = logger.getEntries();
      expect(entries[0].message).toBe('Test message');
    });
  });
});
