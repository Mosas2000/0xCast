import { GDPRComplianceService } from './GDPRComplianceService';
import { PIIDetectionService } from './PIIDetectionService';
import type { JsonValue } from '@/types/common';

export interface StorageOptions {
  requireConsent?: boolean;
  encrypt?: boolean;
  expiresIn?: number;
  category?: 'necessary' | 'analytics' | 'marketing' | 'personalization';
}

export interface StorageEntry {
  value: JsonValue;
  timestamp: number;
  expiresAt?: number;
  category: string;
  hasPII: boolean;
}

export class SecureStorageService {
  private static readonly PREFIX = 'secure_';

  static setItem(key: string, value: JsonValue, options: StorageOptions = {}): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;

      const {
        requireConsent = true,
        expiresIn,
        category = 'necessary'
      } = options;

      const detection = PIIDetectionService.detectPII(
        typeof value === 'object' && value !== null && !Array.isArray(value)
          ? (value as Record<string, string | number | boolean | null | undefined>)
          : { value: String(value) }
      );

      if (detection.requiresConsent && requireConsent) {
        const hasConsent = this.checkCategoryConsent(category);
        if (!hasConsent) {
          console.warn(`Storage blocked: No consent for ${category} data`);
          return false;
        }
      }

      const entry: StorageEntry = {
        value,
        timestamp: Date.now(),
        expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
        category,
        hasPII: detection.hasPII,
      };

      localStorage.setItem(
        this.PREFIX + key,
        JSON.stringify(entry)
      );

      return true;
    } catch (error) {
      console.error('Failed to store data:', error);
      return false;
    }
  }

  static getItem<T = any>(key: string): T | null {
    try {
      if (typeof localStorage === 'undefined') return null;

      const stored = localStorage.getItem(this.PREFIX + key);
      if (!stored) return null;

      const entry: StorageEntry = JSON.parse(stored);

      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        this.removeItem(key);
        return null;
      }

      const retentionPeriod = GDPRComplianceService.getDataRetentionPeriod() * 24 * 60 * 60 * 1000;
      if (Date.now() - entry.timestamp > retentionPeriod) {
        this.removeItem(key);
        return null;
      }

      return entry.value;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  }

  static removeItem(key: string): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      localStorage.removeItem(this.PREFIX + key);
      return true;
    } catch (error) {
      console.error('Failed to remove data:', error);
      return false;
    }
  }

  static clear(category?: string): void {
    try {
      if (typeof localStorage === 'undefined') return;

      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (!key.startsWith(this.PREFIX)) continue;

        if (category) {
          const entry = this.getEntry(key.substring(this.PREFIX.length));
          if (entry && entry.category === category) {
            localStorage.removeItem(key);
          }
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  static clearExpired(): void {
    try {
      if (typeof localStorage === 'undefined') return;

      const keys = Object.keys(localStorage);
      const now = Date.now();
      const retentionPeriod = GDPRComplianceService.getDataRetentionPeriod() * 24 * 60 * 60 * 1000;

      for (const key of keys) {
        if (!key.startsWith(this.PREFIX)) continue;

        try {
          const stored = localStorage.getItem(key);
          if (!stored) continue;

          const entry: StorageEntry = JSON.parse(stored);

          if (entry.expiresAt && now > entry.expiresAt) {
            localStorage.removeItem(key);
            continue;
          }

          if (now - entry.timestamp > retentionPeriod) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Failed to clear expired data:', error);
    }
  }

  static getAllPIIData(): Array<{ key: string; entry: StorageEntry }> {
    const result: Array<{ key: string; entry: StorageEntry }> = [];

    try {
      if (typeof localStorage === 'undefined') return result;

      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (!key.startsWith(this.PREFIX)) continue;

        const entry = this.getEntry(key.substring(this.PREFIX.length));
        if (entry && entry.hasPII) {
          result.push({
            key: key.substring(this.PREFIX.length),
            entry,
          });
        }
      }
    } catch (error) {
      console.error('Failed to get PII data:', error);
    }

    return result;
  }

  static deleteAllPIIData(): boolean {
    try {
      const piiData = this.getAllPIIData();
      for (const { key } of piiData) {
        this.removeItem(key);
      }
      return true;
    } catch (error) {
      console.error('Failed to delete PII data:', error);
      return false;
    }
  }

  private static getEntry(key: string): StorageEntry | null {
    try {
      if (typeof localStorage === 'undefined') return null;

      const stored = localStorage.getItem(this.PREFIX + key);
      if (!stored) return null;

      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  private static checkCategoryConsent(category: string): boolean {
    switch (category) {
      case 'necessary':
        return true;
      case 'analytics':
        return GDPRComplianceService.isAnalyticsEnabled();
      case 'marketing':
        return GDPRComplianceService.isMarketingEnabled();
      case 'personalization':
        return GDPRComplianceService.isPersonalizationEnabled();
      default:
        return false;
    }
  }

  static getStorageReport(): {
    totalEntries: number;
    piiEntries: number;
    expiredEntries: number;
    categoryCounts: Record<string, number>;
  } {
    const report = {
      totalEntries: 0,
      piiEntries: 0,
      expiredEntries: 0,
      categoryCounts: {} as Record<string, number>,
    };

    try {
      if (typeof localStorage === 'undefined') return report;

      const keys = Object.keys(localStorage);
      const now = Date.now();
      const retentionPeriod = GDPRComplianceService.getDataRetentionPeriod() * 24 * 60 * 60 * 1000;

      for (const key of keys) {
        if (!key.startsWith(this.PREFIX)) continue;

        report.totalEntries++;

        try {
          const stored = localStorage.getItem(key);
          if (!stored) continue;

          const entry: StorageEntry = JSON.parse(stored);

          if (entry.hasPII) {
            report.piiEntries++;
          }

          if (
            (entry.expiresAt && now > entry.expiresAt) ||
            (now - entry.timestamp > retentionPeriod)
          ) {
            report.expiredEntries++;
          }

          report.categoryCounts[entry.category] =
            (report.categoryCounts[entry.category] || 0) + 1;
        } catch {
          continue;
        }
      }
    } catch (error) {
      console.error('Failed to generate storage report:', error);
    }

    return report;
  }
}
