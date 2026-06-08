import { SecureStorageV2Service } from './SecureStorageV2Service';

export interface MigrationResult {
  success: boolean;
  migratedKeys: string[];
  failedKeys: string[];
  totalMigrated: number;
  errors: Array<{ key: string; error: string }>;
}

export class StorageMigrationService {
  private static readonly MIGRATION_FLAG = 'storage_migration_completed';
  private static readonly MIGRATION_VERSION = '1.0';

  private static readonly SENSITIVE_KEYS = [
    'gdpr_user_consent',
    'gdpr_consent_history',
    'analytics_enabled',
    '0xcast-wallet-address',
    'oxcast_referral_code',
    'oxcast_tracking_id',
    'referral_timestamp',
    'rate_limit_records',
    'notifications',
    'notification_preferences',
    'error_logs',
    'liquidity_positions',
    'historical_rewards',
    'market_volumes',
  ];

  static async isMigrationNeeded(): Promise<boolean> {
    try {
      const flag = localStorage.getItem(this.MIGRATION_FLAG);
      if (!flag) return true;

      const migrationData = JSON.parse(flag);
      return migrationData.version !== this.MIGRATION_VERSION;
    } catch {
      return true;
    }
  }

  static async migrateAll(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedKeys: [],
      failedKeys: [],
      totalMigrated: 0,
      errors: [],
    };

    try {
      await SecureStorageV2Service.initialize();

      for (const key of this.SENSITIVE_KEYS) {
        try {
          const value = localStorage.getItem(key);
          if (value === null) continue;

          const category = this.getCategoryForKey(key);
          const expiresIn = this.getExpirationForKey(key);

          const success = await SecureStorageV2Service.setItem(key, value, {
            encrypt: true,
            category,
            expiresIn,
            requireConsent: false,
          });

          if (success) {
            localStorage.removeItem(key);
            result.migratedKeys.push(key);
            result.totalMigrated++;
          } else {
            result.failedKeys.push(key);
            result.errors.push({
              key,
              error: 'Failed to store in secure storage',
            });
          }
        } catch (error) {
          result.failedKeys.push(key);
          result.errors.push({
            key,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      if (result.failedKeys.length > 0) {
        result.success = false;
      }

      this.markMigrationComplete();

      return result;
    } catch (error) {
      result.success = false;
      result.errors.push({
        key: 'migration',
        error: error instanceof Error ? error.message : 'Migration failed',
      });
      return result;
    }
  }

  static async migrateKey(key: string): Promise<boolean> {
    try {
      await SecureStorageV2Service.initialize();

      const value = localStorage.getItem(key);
      if (value === null) return false;

      const category = this.getCategoryForKey(key);
      const expiresIn = this.getExpirationForKey(key);

      const success = await SecureStorageV2Service.setItem(key, value, {
        encrypt: true,
        category,
        expiresIn,
        requireConsent: false,
      });

      if (success) {
        localStorage.removeItem(key);
      }

      return success;
    } catch (error) {
      console.error(`Failed to migrate key ${key}:`, error);
      return false;
    }
  }

  static async rollbackMigration(): Promise<boolean> {
    try {
      await SecureStorageV2Service.initialize();

      for (const key of this.SENSITIVE_KEYS) {
        const value = await SecureStorageV2Service.getItem(key);
        if (value !== null) {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          await SecureStorageV2Service.removeItem(key);
        }
      }

      localStorage.removeItem(this.MIGRATION_FLAG);
      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      return false;
    }
  }

  private static getCategoryForKey(
    key: string
  ): 'necessary' | 'analytics' | 'marketing' | 'personalization' {
    if (key.includes('wallet') || key.includes('referral') || key.includes('liquidity')) {
      return 'necessary';
    }
    if (key.includes('analytics') || key.includes('error') || key.includes('tracking')) {
      return 'analytics';
    }
    if (key.includes('notification') || key.includes('preference')) {
      return 'personalization';
    }
    return 'necessary';
  }

  private static getExpirationForKey(key: string): number | undefined {
    if (key.includes('error')) {
      return 30 * 24 * 60 * 60 * 1000;
    }
    if (key.includes('analytics') || key.includes('tracking')) {
      return 30 * 24 * 60 * 60 * 1000;
    }
    if (key.includes('notification')) {
      return 90 * 24 * 60 * 60 * 1000;
    }
    return undefined;
  }

  private static markMigrationComplete(): void {
    try {
      localStorage.setItem(
        this.MIGRATION_FLAG,
        JSON.stringify({
          version: this.MIGRATION_VERSION,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Failed to mark migration complete:', error);
    }
  }

  static getMigrationStatus(): {
    completed: boolean;
    version: string | null;
    timestamp: number | null;
  } {
    try {
      const flag = localStorage.getItem(this.MIGRATION_FLAG);
      if (!flag) {
        return { completed: false, version: null, timestamp: null };
      }

      const data = JSON.parse(flag);
      return {
        completed: data.version === this.MIGRATION_VERSION,
        version: data.version,
        timestamp: data.timestamp,
      };
    } catch {
      return { completed: false, version: null, timestamp: null };
    }
  }

  static async verifyMigration(): Promise<{
    valid: boolean;
    missingKeys: string[];
    extraKeys: string[];
  }> {
    try {
      await SecureStorageV2Service.initialize();

      const missingKeys: string[] = [];
      const extraKeys: string[] = [];

      for (const key of this.SENSITIVE_KEYS) {
        const inLocalStorage = localStorage.getItem(key) !== null;
        const inSecureStorage = (await SecureStorageV2Service.getItem(key)) !== null;

        if (inLocalStorage && !inSecureStorage) {
          missingKeys.push(key);
        }

        if (inLocalStorage && inSecureStorage) {
          extraKeys.push(key);
        }
      }

      return {
        valid: missingKeys.length === 0 && extraKeys.length === 0,
        missingKeys,
        extraKeys,
      };
    } catch (error) {
      console.error('Migration verification failed:', error);
      return {
        valid: false,
        missingKeys: [],
        extraKeys: [],
      };
    }
  }
}
