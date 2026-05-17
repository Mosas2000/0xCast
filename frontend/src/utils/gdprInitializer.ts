import { DataRetentionService } from '../services/DataRetentionService';
import { SecureStorageService } from '../services/SecureStorageService';
import { GDPRComplianceService } from '../services/GDPRComplianceService';

export class GDPRInitializer {
  private static initialized = false;
  private static cleanupInterval: number | null = null;

  static initialize(): void {
    if (this.initialized) {
      console.warn('GDPR services already initialized');
      return;
    }

    try {
      this.clearExpiredData();
      this.scheduleAutomaticCleanup();
      this.checkConsentStatus();
      
      this.initialized = true;
      console.log('GDPR compliance services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize GDPR services:', error);
    }
  }

  private static clearExpiredData(): void {
    try {
      SecureStorageService.clearExpired();
      const result = DataRetentionService.cleanupExpiredData();
      
      if (result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} expired data items`);
      }
    } catch (error) {
      console.error('Failed to clear expired data:', error);
    }
  }

  private static scheduleAutomaticCleanup(): void {
    try {
      DataRetentionService.scheduleAutomaticCleanup();
      
      if (typeof window !== 'undefined') {
        this.cleanupInterval = window.setInterval(() => {
          this.clearExpiredData();
        }, 24 * 60 * 60 * 1000);
      }
    } catch (error) {
      console.error('Failed to schedule automatic cleanup:', error);
    }
  }

  private static checkConsentStatus(): void {
    try {
      if (GDPRComplianceService.isConsentUpdateRequired()) {
        console.warn('User consent needs to be updated');
        
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
    console.log('GDPR services shut down');
  }

  static isInitialized(): boolean {
    return this.initialized;
  }

  static getStatus(): {
    initialized: boolean;
    compliance: ReturnType<typeof GDPRComplianceService.getComplianceStatus>;
    storage: ReturnType<typeof SecureStorageService.getStorageReport>;
  } {
    return {
      initialized: this.initialized,
      compliance: GDPRComplianceService.getComplianceStatus(),
      storage: SecureStorageService.getStorageReport(),
    };
  }
}
