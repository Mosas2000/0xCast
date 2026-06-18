import { describe, it, expect, beforeEach } from 'vitest';
import { StorageErrorHandler } from '../StorageErrorHandler';

describe('StorageErrorHandler', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('safeGetItem', () => {
    it('should get item from storage', () => {
      localStorage.setItem('test', JSON.stringify({ value: 'data' }));
      const result = StorageErrorHandler.safeGetItem('test', {});
      expect(result).toEqual({ value: 'data' });
    });

    it('should return default value when item not found', () => {
      const result = StorageErrorHandler.safeGetItem('missing', { default: true });
      expect(result).toEqual({ default: true });
    });

    it('should return default value on parse error', () => {
      localStorage.setItem('invalid', 'not json');
      const result = StorageErrorHandler.safeGetItem('invalid', {});
      expect(result).toEqual({});
    });
  });

  describe('safeSetItem', () => {
    it('should set item in storage', () => {
      const success = StorageErrorHandler.safeSetItem('test', { value: 'data' });
      expect(success).toBe(true);
      expect(localStorage.getItem('test')).toBe(JSON.stringify({ value: 'data' }));
    });
  });

  describe('safeRemoveItem', () => {
    it('should remove item from storage', () => {
      localStorage.setItem('test', 'value');
      const success = StorageErrorHandler.safeRemoveItem('test');
      expect(success).toBe(true);
      expect(localStorage.getItem('test')).toBeNull();
    });
  });

  describe('isAvailable', () => {
    it('should check if storage is available', () => {
      expect(StorageErrorHandler.isAvailable()).toBe(true);
    });
  });

  describe('getStorageSize', () => {
    it('should calculate storage size', () => {
      localStorage.setItem('test', 'value');
      const size = StorageErrorHandler.getStorageSize();
      expect(size).toBeGreaterThan(0);
    });
  });
});
