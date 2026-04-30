/**
 * GDPR Compliance Service
 * 
 * Handles user data privacy, consent management, and data export/deletion
 */

export interface UserConsent {
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  timestamp: number;
  version: string;
}

export interface UserData {
  userId: string;
  walletAddress: string;
  predictions: Array<{
    marketId: number;
    outcome: string;
    amount: number;
    timestamp: number;
  }>;
  personalStats: {
    totalPredictions: number;
    totalStaked: number;
    totalWinnings: number;
    totalLosses: number;
    winRate: number;
  };
  activityLog: Array<{
    action: string;
    timestamp: number;
    details?: Record<string, any>;
  }>;
}

const CONSENT_VERSION = '1.0.0';
const CONSENT_STORAGE_KEY = 'gdpr_user_consent';
const ANALYTICS_ENABLED_KEY = 'analytics_enabled';

export class GDPRComplianceService {
  /**
   * Get user consent preferences
   */
  static getUserConsent(): UserConsent | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  /**
   * Save user consent preferences
   */
  static setUserConsent(consent: Omit<UserConsent, 'timestamp' | 'version'>): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const userConsent: UserConsent = {
        ...consent,
        timestamp: Date.now(),
        version: CONSENT_VERSION,
      };
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(userConsent));
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  /**
   * Check if analytics is enabled
   */
  static isAnalyticsEnabled(): boolean {
    const consent = this.getUserConsent();
    if (!consent) {
      // Default to false until user provides consent
      return false;
    }
    return consent.analytics;
  }

  /**
   * Check if marketing is enabled
   */
  static isMarketingEnabled(): boolean {
    const consent = this.getUserConsent();
    if (!consent) return false;
    return consent.marketing;
  }

  /**
   * Check if personalization is enabled
   */
  static isPersonalizationEnabled(): boolean {
    const consent = this.getUserConsent();
    if (!consent) return false;
    return consent.personalization;
  }

  /**
   * Accept all analytics
   */
  static acceptAll(): void {
    this.setUserConsent({
      analytics: true,
      marketing: true,
      personalization: true,
    });
  }

  /**
   * Reject all analytics
   */
  static rejectAll(): void {
    this.setUserConsent({
      analytics: false,
      marketing: false,
      personalization: false,
    });
  }

  /**
   * Accept only necessary analytics
   */
  static acceptNecessary(): void {
    this.setUserConsent({
      analytics: false,
      marketing: false,
      personalization: false,
    });
  }

  /**
   * Export user data (GDPR right to data portability)
   */
  static async exportUserData(userId: string): Promise<UserData> {
    // This would typically fetch from backend
    // For now, return mock data structure
    return {
      userId,
      walletAddress: '',
      predictions: [],
      personalStats: {
        totalPredictions: 0,
        totalStaked: 0,
        totalWinnings: 0,
        totalLosses: 0,
        winRate: 0,
      },
      activityLog: [],
    };
  }

  /**
   * Delete user data (GDPR right to be forgotten)
   */
  static async deleteUserData(userId: string): Promise<boolean> {
    try {
      if (typeof localStorage === 'undefined') return true;
      // This would typically call backend API
      // For now, just clear local storage
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      localStorage.removeItem(ANALYTICS_ENABLED_KEY);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get privacy policy version
   */
  static getPrivacyPolicyVersion(): string {
    return '1.0.0';
  }

  /**
   * Check if consent is up to date
   */
  static isConsentUpToDate(): boolean {
    const consent = this.getUserConsent();
    if (!consent) return false;
    return consent.version === CONSENT_VERSION;
  }

  /**
   * Request consent update
   */
  static requestConsentUpdate(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      // Mark that consent needs to be updated
      localStorage.setItem('consent_update_required', 'true');
    } catch {
      // Silently fail
    }
  }

  /**
   * Check if consent update is required
   */
  static isConsentUpdateRequired(): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      return localStorage.getItem('consent_update_required') === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Clear consent update flag
   */
  static clearConsentUpdateFlag(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem('consent_update_required');
    } catch {
      // Silently fail
    }
  }

  /**
   * Get data retention period in days
   */
  static getDataRetentionPeriod(): number {
    return 90; // 90 days default
  }

  /**
   * Check if data should be deleted based on retention policy
   */
  static shouldDeleteData(createdAt: number): boolean {
    const retentionMs = this.getDataRetentionPeriod() * 24 * 60 * 60 * 1000;
    return Date.now() - createdAt > retentionMs;
  }

  /**
   * Anonymize user data
   */
  static anonymizeUserData(userData: UserData): UserData {
    return {
      ...userData,
      userId: 'anonymous',
      walletAddress: 'anonymous',
      predictions: userData.predictions.map((p) => ({
        ...p,
        // Keep only essential data
      })),
      activityLog: userData.activityLog.map((log) => ({
        ...log,
        details: undefined,
      })),
    };
  }

  /**
   * Get GDPR compliance status
   */
  static getComplianceStatus(): {
    consentProvided: boolean;
    consentUpToDate: boolean;
    analyticsEnabled: boolean;
    marketingEnabled: boolean;
    personalizationEnabled: boolean;
  } {
    const consent = this.getUserConsent();
    return {
      consentProvided: !!consent,
      consentUpToDate: this.isConsentUpToDate(),
      analyticsEnabled: this.isAnalyticsEnabled(),
      marketingEnabled: this.isMarketingEnabled(),
      personalizationEnabled: this.isPersonalizationEnabled(),
    };
  }
}
