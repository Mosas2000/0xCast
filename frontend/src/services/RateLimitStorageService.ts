import { RateLimitRecord } from '@/types/rateLimit';

const STORAGE_KEY = 'rate_limit_records';
const STORAGE_VERSION = '1.0';

export class RateLimitStorageService {
  saveRecords(records: Map<string, RateLimitRecord[]>): void {
    try {
      const data = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        records: Array.from(records.entries()),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save rate limit records:', error);
    }
  }

  loadRecords(): Map<string, RateLimitRecord[]> | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored);
      
      if (data.version !== STORAGE_VERSION) {
        this.clearRecords();
        return null;
      }

      const ageMs = Date.now() - data.timestamp;
      if (ageMs > 3600000) {
        this.clearRecords();
        return null;
      }

      return new Map(data.records);
    } catch (error) {
      console.error('Failed to load rate limit records:', error);
      return null;
    }
  }

  clearRecords(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear rate limit records:', error);
    }
  }
}

export const rateLimitStorageService = new RateLimitStorageService();
