import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GDPRComplianceService } from '../GDPRComplianceService';

describe('GDPRComplianceService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('consent management', () => {
    it('returns null when no consent is stored', () => {
      const consent = GDPRComplianceService.getUserConsent();
      expect(consent).toBeNull();
    });

    it('saves and retrieves user consent', () => {
      GDPRComplianceService.setUserConsent({
        analytics: true,
        marketing: false,
        personalization: true,
      });

      const consent = GDPRComplianceService.getUserConsent();
      expect(consent).not.toBeNull();
      expect(consent?.analytics).toBe(true);
      expect(consent?.marketing).toBe(false);
      expect(consent?.personalization).toBe(true);
    });

    it('includes timestamp and version in saved consent', () => {
      GDPRComplianceService.setUserConsent({
        analytics: true,
        marketing: true,
        personalization: true,
      });

      const consent = GDPRComplianceService.getUserConsent();
      expect(consent?.timestamp).toBeDefined();
      expect(consent?.version).toBe('1.0.0');
    });
  });

  describe('consent checks', () => {
    it('returns false for analytics when not consented', () => {
      expect(GDPRComplianceService.isAnalyticsEnabled()).toBe(false);
    });

    it('returns true for analytics when consented', () => {
      GDPRComplianceService.setUserConsent({
        analytics: true,
        marketing: false,
        personalization: false,
      });

      expect(GDPRComplianceService.isAnalyticsEnabled()).toBe(true);
    });

    it('returns true for marketing when consented', () => {
      GDPRComplianceService.setUserConsent({
        analytics: false,
        marketing: true,
        personalization: false,
      });

      expect(GDPRComplianceService.isMarketingEnabled()).toBe(true);
    });

    it('returns true for personalization when consented', () => {
      GDPRComplianceService.setUserConsent({
        analytics: false,
        marketing: false,
        personalization: true,
      });

      expect(GDPRComplianceService.isPersonalizationEnabled()).toBe(true);
    });
  });

  describe('preset consent options', () => {
    it('accepts all consent types', () => {
      GDPRComplianceService.acceptAll();

      expect(GDPRComplianceService.isAnalyticsEnabled()).toBe(true);
      expect(GDPRComplianceService.isMarketingEnabled()).toBe(true);
      expect(GDPRComplianceService.isPersonalizationEnabled()).toBe(true);
    });

    it('rejects all consent types', () => {
      GDPRComplianceService.rejectAll();

      expect(GDPRComplianceService.isAnalyticsEnabled()).toBe(false);
      expect(GDPRComplianceService.isMarketingEnabled()).toBe(false);
      expect(GDPRComplianceService.isPersonalizationEnabled()).toBe(false);
    });

    it('accepts only necessary (rejects optional)', () => {
      GDPRComplianceService.acceptNecessary();

      expect(GDPRComplianceService.isAnalyticsEnabled()).toBe(false);
      expect(GDPRComplianceService.isMarketingEnabled()).toBe(false);
      expect(GDPRComplianceService.isPersonalizationEnabled()).toBe(false);
    });
  });

  describe('consent versioning', () => {
    it('returns correct privacy policy version', () => {
      const version = GDPRComplianceService.getPrivacyPolicyVersion();
      expect(version).toBe('1.0.0');
    });

    it('detects outdated consent', () => {
      GDPRComplianceService.setUserConsent({
        analytics: true,
        marketing: true,
        personalization: true,
      });

      expect(GDPRComplianceService.isConsentUpToDate()).toBe(true);
    });

    it('marks consent update as required', () => {
      GDPRComplianceService.requestConsentUpdate();
      expect(GDPRComplianceService.isConsentUpdateRequired()).toBe(true);
    });

    it('clears consent update flag', () => {
      GDPRComplianceService.requestConsentUpdate();
      GDPRComplianceService.clearConsentUpdateFlag();
      expect(GDPRComplianceService.isConsentUpdateRequired()).toBe(false);
    });
  });

  describe('data retention', () => {
    it('returns data retention period', () => {
      const period = GDPRComplianceService.getDataRetentionPeriod();
      expect(period).toBe(90);
    });

    it('determines if data should be deleted', () => {
      const oldTimestamp = Date.now() - 100 * 24 * 60 * 60 * 1000; // 100 days ago
      const newTimestamp = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days ago

      expect(GDPRComplianceService.shouldDeleteData(oldTimestamp)).toBe(true);
      expect(GDPRComplianceService.shouldDeleteData(newTimestamp)).toBe(false);
    });
  });

  describe('data export', () => {
    it('exports user data', async () => {
      const userData = await GDPRComplianceService.exportUserData('user_123');

      expect(userData.userId).toBe('user_123');
      expect(userData.predictions).toBeDefined();
      expect(userData.personalStats).toBeDefined();
      expect(userData.activityLog).toBeDefined();
    });
  });

  describe('data deletion', () => {
    it('deletes user data', async () => {
      GDPRComplianceService.setUserConsent({
        analytics: true,
        marketing: true,
        personalization: true,
      });

      const result = await GDPRComplianceService.deleteUserData('user_123');

      expect(result).toBe(true);
      expect(GDPRComplianceService.getUserConsent()).toBeNull();
    });
  });

  describe('data anonymization', () => {
    it('anonymizes user data', async () => {
      const userData = await GDPRComplianceService.exportUserData('user_123');
      const anonymized = GDPRComplianceService.anonymizeUserData(userData);

      expect(anonymized.userId).toBe('anonymous');
      expect(anonymized.walletAddress).toBe('anonymous');
    });
  });

  describe('compliance status', () => {
    it('returns compliance status when no consent', () => {
      const status = GDPRComplianceService.getComplianceStatus();

      expect(status.consentProvided).toBe(false);
      expect(status.analyticsEnabled).toBe(false);
      expect(status.marketingEnabled).toBe(false);
      expect(status.personalizationEnabled).toBe(false);
    });

    it('returns compliance status when consent provided', () => {
      GDPRComplianceService.setUserConsent({
        analytics: true,
        marketing: false,
        personalization: true,
      });

      const status = GDPRComplianceService.getComplianceStatus();

      expect(status.consentProvided).toBe(true);
      expect(status.analyticsEnabled).toBe(true);
      expect(status.marketingEnabled).toBe(false);
      expect(status.personalizationEnabled).toBe(true);
    });
  });
});
