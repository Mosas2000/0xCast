import { GDPRComplianceService } from './GDPRComplianceService';
import type { JsonValue } from '@/types/common';

export interface RetentionPolicy {
  category: string;
  retentionDays: number;
  autoDelete: boolean;
  description: string;
}

export interface DataItem {
  id: string;
  category: string;
  createdAt: number;
  lastAccessed?: number;
  data: JsonValue;
}

export class DataRetentionService {
  private static readonly POLICIES: RetentionPolicy[] = [
    {
      category: 'user_activity',
      retentionDays: 90,
      autoDelete: true,
      description: 'User activity logs and interaction history',
    },
    {
      category: 'transaction_history',
      retentionDays: 365,
      autoDelete: false,
      description: 'Transaction records for compliance',
    },
    {
      category: 'analytics_data',
      retentionDays: 30,
      autoDelete: true,
      description: 'Analytics and usage statistics',
    },
    {
      category: 'marketing_data',
      retentionDays: 60,
      autoDelete: true,
      description: 'Marketing preferences and campaign data',
    },
    {
      category: 'session_data',
      retentionDays: 7,
      autoDelete: true,
      description: 'Temporary session information',
    },
  ];

  static getPolicy(category: string): RetentionPolicy | undefined {
    return this.POLICIES.find(p => p.category === category);
  }

  static getAllPolicies(): RetentionPolicy[] {
    return [...this.POLICIES];
  }

  static shouldRetain(item: DataItem): boolean {
    const policy = this.getPolicy(item.category);
    if (!policy) {
      return true;
    }

    const ageInDays = (Date.now() - item.createdAt) / (1000 * 60 * 60 * 24);
    return ageInDays < policy.retentionDays;
  }

  static shouldAutoDelete(item: DataItem): boolean {
    const policy = this.getPolicy(item.category);
    if (!policy || !policy.autoDelete) {
      return false;
    }

    return !this.shouldRetain(item);
  }

  static getExpirationDate(category: string, createdAt: number): Date {
    const policy = this.getPolicy(category);
    const retentionDays = policy?.retentionDays || GDPRComplianceService.getDataRetentionPeriod();
    
    const expirationMs = createdAt + (retentionDays * 24 * 60 * 60 * 1000);
    return new Date(expirationMs);
  }

  static getDaysUntilExpiration(category: string, createdAt: number): number {
    const expirationDate = this.getExpirationDate(category, createdAt);
    const daysRemaining = (expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(daysRemaining));
  }

  static cleanupExpiredData(): {
    deleted: number;
    errors: number;
  } {
    const result = {
      deleted: 0,
      errors: 0,
    };

    try {
      if (typeof localStorage === 'undefined') return result;

      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        try {
          const stored = localStorage.getItem(key);
          if (!stored) continue;

          let item: DataItem;
          try {
            const parsed = JSON.parse(stored);
            if (parsed.createdAt && parsed.category) {
              item = parsed;
            } else {
              continue;
            }
          } catch {
            continue;
          }

          if (this.shouldAutoDelete(item)) {
            localStorage.removeItem(key);
            result.deleted++;
          }
        } catch {
          result.errors++;
        }
      }
    } catch (error) {
      console.error('Failed to cleanup expired data:', error);
    }

    return result;
  }

  static scheduleCleanup(): void {
    if (typeof window === 'undefined') return;

    const runCleanup = () => {
      const result = this.cleanupExpiredData();
      console.log(`Data retention cleanup: ${result.deleted} items deleted, ${result.errors} errors`);
    };

    runCleanup();

    setInterval(runCleanup, 24 * 60 * 60 * 1000);
  }

  static getRetentionReport(): {
    totalItems: number;
    itemsByCategory: Record<string, number>;
    expiringSoon: number;
    expired: number;
  } {
    const report = {
      totalItems: 0,
      itemsByCategory: {} as Record<string, number>,
      expiringSoon: 0,
      expired: 0,
    };

    try {
      if (typeof localStorage === 'undefined') return report;

      const keys = Object.keys(localStorage);
      
      for (const key of keys) {
        try {
          const stored = localStorage.getItem(key);
          if (!stored) continue;

          const parsed = JSON.parse(stored);
          if (!parsed.createdAt || !parsed.category) continue;

          const item: DataItem = parsed;
          report.totalItems++;

          report.itemsByCategory[item.category] =
            (report.itemsByCategory[item.category] || 0) + 1;

          const daysUntilExpiration = this.getDaysUntilExpiration(
            item.category,
            item.createdAt
          );

          if (daysUntilExpiration === 0) {
            report.expired++;
          } else if (daysUntilExpiration <= 7) {
            report.expiringSoon++;
          }
        } catch {
          continue;
        }
      }
    } catch (error) {
      console.error('Failed to generate retention report:', error);
    }

    return report;
  }

  static extendRetention(itemId: string, additionalDays: number): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;

      const stored = localStorage.getItem(itemId);
      if (!stored) return false;

      const item: DataItem = JSON.parse(stored);
      item.createdAt = Date.now() - ((this.getPolicy(item.category)?.retentionDays || 90) - additionalDays) * 24 * 60 * 60 * 1000;

      localStorage.setItem(itemId, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Failed to extend retention:', error);
      return false;
    }
  }
}
