import { GDPRComplianceService } from './GDPRComplianceService';
import { SecureStorageService } from './SecureStorageService';

export interface DeletionLogEntry {
  userId: string;
  scope: string;
  reason: string | undefined;
  deletedCount: number;
  errorCount: number;
  timestamp: number;
}

export interface DeletionRequest {
  userId: string;
  scope: 'all' | 'pii' | 'analytics' | 'marketing' | 'preferences';
  reason?: string;
}

export interface DeletionResult {
  success: boolean;
  deletedKeys: string[];
  errors: string[];
  timestamp: number;
}

const DELETION_LOG_KEY = 'gdpr_deletion_log';

export class DataDeletionService {
  private static readonly NECESSARY_KEYS = [
    'gdpr_user_consent',
    'gdpr_deletion_log',
    '0xcast_network',
  ];

  static async deleteUserData(request: DeletionRequest): Promise<DeletionResult> {
    const result: DeletionResult = {
      success: false,
      deletedKeys: [],
      errors: [],
      timestamp: Date.now(),
    };

    try {
      switch (request.scope) {
        case 'all':
          await this.deleteAll(result);
          break;
        case 'pii':
          await this.deletePII(result);
          break;
        case 'analytics':
          await this.deleteByCategory('analytics', result);
          break;
        case 'marketing':
          await this.deleteByCategory('marketing', result);
          break;
        case 'preferences':
          await this.deletePreferences(result);
          break;
      }

      this.logDeletion(request, result);
      result.success = result.errors.length === 0;
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : 'Unknown deletion error'
      );
    }

    return result;
  }

  private static async deleteAll(result: DeletionResult): Promise<void> {
    if (typeof localStorage === 'undefined') return;

    const keys = Object.keys(localStorage);

    for (const key of keys) {
      if (this.NECESSARY_KEYS.includes(key)) continue;

      try {
        localStorage.removeItem(key);
        result.deletedKeys.push(key);
      } catch (error) {
        result.errors.push(`Failed to delete key: ${key}`);
      }
    }

    GDPRComplianceService.rejectAll();
  }

  private static async deletePII(result: DeletionResult): Promise<void> {
    const piiData = SecureStorageService.getAllPIIData();

    for (const { key } of piiData) {
      try {
        SecureStorageService.removeItem(key);
        result.deletedKeys.push(key);
      } catch (error) {
        result.errors.push(`Failed to delete PII key: ${key}`);
      }
    }

    const piiKeys = [
      'wallet_address',
      'user_profile',
      'kyc_data',
      'referral_data',
    ];

    for (const key of piiKeys) {
      if (typeof localStorage !== 'undefined' && localStorage.getItem(key)) {
        try {
          localStorage.removeItem(key);
          result.deletedKeys.push(key);
        } catch (error) {
          result.errors.push(`Failed to delete key: ${key}`);
        }
      }
    }
  }

  private static async deleteByCategory(
    category: string,
    result: DeletionResult
  ): Promise<void> {
    SecureStorageService.clear(category);
    result.deletedKeys.push(`category:${category}`);

    const categoryKeys: Record<string, string[]> = {
      analytics: ['analytics_enabled', '0xcast_recent_searches', '0xcast_last_filters'],
      marketing: ['marketing_preferences', 'campaign_data'],
    };

    const keys = categoryKeys[category] || [];
    for (const key of keys) {
      if (typeof localStorage !== 'undefined' && localStorage.getItem(key)) {
        try {
          localStorage.removeItem(key);
          result.deletedKeys.push(key);
        } catch (error) {
          result.errors.push(`Failed to delete key: ${key}`);
        }
      }
    }
  }

  private static async deletePreferences(result: DeletionResult): Promise<void> {
    const preferenceKeys = [
      '0xcast_theme',
      'filter_presets',
      'notification_preferences',
      'scheduledExports',
      '0xcast_skip_network_confirm',
    ];

    for (const key of preferenceKeys) {
      if (typeof localStorage !== 'undefined' && localStorage.getItem(key)) {
        try {
          localStorage.removeItem(key);
          result.deletedKeys.push(key);
        } catch (error) {
          result.errors.push(`Failed to delete preference: ${key}`);
        }
      }
    }
  }

  private static logDeletion(
    request: DeletionRequest,
    result: DeletionResult
  ): void {
    try {
      if (typeof localStorage === 'undefined') return;

      const existing = localStorage.getItem(DELETION_LOG_KEY);
      const log: DeletionLogEntry[] = existing ? JSON.parse(existing) : [];

      log.push({
        userId: request.userId,
        scope: request.scope,
        reason: request.reason,
        deletedCount: result.deletedKeys.length,
        errorCount: result.errors.length,
        timestamp: result.timestamp,
      });

      const trimmed = log.slice(-50);
      localStorage.setItem(DELETION_LOG_KEY, JSON.stringify(trimmed));
    } catch {
      // Silently fail
    }
  }

  static getDeletionLog(): DeletionLogEntry[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const stored = localStorage.getItem(DELETION_LOG_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static canDeleteData(scope: DeletionRequest['scope']): boolean {
    const consent = GDPRComplianceService.getUserConsent();
    if (!consent && scope !== 'all') {
      return false;
    }
    return true;
  }
}
