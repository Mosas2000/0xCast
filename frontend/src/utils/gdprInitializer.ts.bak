import { DataRetentionService } from '@/services/DataRetentionService';
import { SecureStorageService } from '@/services/SecureStorageService';
import { SecureStorageV2Service } from '@/services/SecureStorageV2Service';
import { StorageMigrationService } from '@/services/StorageMigrationService';
import { GDPRComplianceService } from '@/services/GDPRComplianceService';

export class GDPRInitializer {
  private static initialized = false;
  private static cleanupInterval: number | null = null;

  static async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await SecureStorageV2Service.initialize();
      await this.runMigrationIfNeeded();
      await this.clearExpiredData();
      this.scheduleAutomaticCleanup();
      this.checkConsentStatus();

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize GDPR services:', error);
    }
  }

  private static async runMigrationIfNeeded(): Promise<void> {
    try {
      const needed = await StorageMigrationService.isMigrationNeeded();
      if (!needed) return;

      const result = await StorageMigrationService.migrateAll();

      if (!result.success && result.errors.length > 0) {
        console.warn('Some storage items could not be migrated:', result.failedKeys);
      }
    } catch (error) {
      console.error('Storage migration failed:', error);
    }
  }

  private static async clearExpiredData(): Promise<void> {
    try {
      SecureStorageService.clearExpired();
      const indexedDBCleaned = await SecureStorageV2Service.cleanupExpired();
      const retentionResult = DataRetentionService.cleanupExpiredData();

      const totalCleaned = indexedDBCleaned + retentionResult.deletedCount;
      if (totalCleaned > 0) {
        console.log(`Cleaned up ${totalCleaned} expired data items`);
      }
    } catch (error) {
      console.error('Failed to clear expired data:', error);
    }
  }

  private static scheduleAutomaticCleanup(): void {
    try {
      DataRetentionService.scheduleAutomaticCleanup();

      if (typeof window !== 'undefined') {
        this.cleanupInterval = window.setInterval(async () => {
          await this.clearExpiredData();
        }, 24 * 60 * 60 * 1000);
      }
    } catch (error) {
      console.error('Failed to schedule automatic cleanup:', error);
    }
  }

  private static checkConsentStatus(): void {
    try {
      if (GDPRComplianceService.isConsentUpdateRequired()) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gdpr:consent-update-required'));
        }
      }
    } catch (error) {
      console.error('Failed to check consent status:', error);
    }
  }

  static shutdown(): void {
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.initialized = false;
  }

  static isInitialized(): boolean {
    return this.initialized;
  }

  static async getStatus(): Promise<{
    initialized: boolean;
    compliance: ReturnType<typeof GDPRComplianceService.getComplianceStatus>;
    storage: Awaited<ReturnType<typeof SecureStorageV2Service.getStorageReport>>;
    migration: ReturnType<typeof StorageMigrationService.getMigrationStatus>;
  }> {
    return {
      initialized: this.initialized,
      compliance: GDPRComplianceService.getComplianceStatus(),
      storage: await SecureStorageV2Service.getStorageReport(),
      migration: StorageMigrationService.getMigrationStatus(),
    };
  }
}
