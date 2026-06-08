import { describe, it, expect, vi } from 'vitest';
import { ErrorHandler } from '../ErrorHandler';

describe('ErrorHandler', () => {
  describe('execute', () => {
    it('should execute function successfully', async () => {
      const handler = new ErrorHandler();
      const result = await handler.execute(async () => 'success');
      expect(result).toBe('success');
    });

    it('should return null on error when throwErrors is false', async () => {
      const handler = new ErrorHandler({ throwErrors: false });
      const result = await handler.execute(async () => {
        throw new Error('test error');
      });
      expect(result).toBeNull();
    });

    it('should throw error when throwErrors is true', async () => {
      const handler = new ErrorHandler({ throwErrors: true });
      await expect(
        handler.execute(async () => {
          throw new Error('test error');
        })
      ).rejects.toThrow('test error');
    });

    it('should retry on failure', async () => {
      const handler = new ErrorHandler({ retryAttempts: 2 });
      let attempts = 0;

      const result = await handler.execute(async () => {
        attempts++;
        if (attempts < 3) throw new Error('retry');
        return 'success';
      });

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should call onError callback', async () => {
      const onError = vi.fn();
      const handler = new ErrorHandler({ onError });

      await handler.execute(async () => {
        throw new Error('test');
      });

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('executeSync', () => {
    it('should execute synchronous function', () => {
      const handler = new ErrorHandler();
      const result = handler.executeSync(() => 'success');
      expect(result).toBe('success');
    });

    it('should handle synchronous errors', () => {
      const handler = new ErrorHandler({ throwErrors: false });
      const result = handler.executeSync(() => {
        throw new Error('sync error');
      });
      expect(result).toBeNull();
    });
  });
});
