export class StorageErrorHandler {
  static safeGetItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Failed to get item from localStorage: ${key}`, error);
      return defaultValue;
    }
  }

  static safeSetItem(key: string, value: unknown): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set item in localStorage: ${key}`, error);
      return false;
    }
  }

  static safeRemoveItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove item from localStorage: ${key}`, error);
      return false;
    }
  }

  static safeClear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage', error);
      return false;
    }
  }

  static isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  static getStorageSize(): number {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== null) {
          const value = localStorage.getItem(key) ?? '';
          total += key.length + value.length;
        }
      }
      return total;
    } catch {
      return 0;
    }
  }

  static isStorageFull(): boolean {
    const maxSize = 5 * 1024 * 1024;
    return this.getStorageSize() >= maxSize * 0.9;
  }

  static cleanupOldItems(maxAge: number): number {
    let cleaned = 0;
    const now = Date.now();

    try {
      const keysToCheck: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) keysToCheck.push(key);
      }

      for (const key of keysToCheck) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const item = JSON.parse(raw);
          if (item.timestamp && now - item.timestamp > maxAge) {
            localStorage.removeItem(key);
            cleaned++;
          }
        } catch {
          continue;
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old items', error);
    }

    return cleaned;
  }
}
