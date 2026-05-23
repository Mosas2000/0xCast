import { PIIDetectionService, type PIIValue } from './PIIDetectionService';
import { SecureStorageV2Service } from './SecureStorageV2Service';

export type ActivityDetails = Record<string, string | number | boolean | null | undefined>;

export interface ConsentHistoryEntry {
  timestamp: number;
  previous: {
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
  } | null;
  current: {
    analytics: boolean;
    marketing: boolean;
    personalization: boolean;
  };
}

export interface UserConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
  timestamp: number;
  version: string;
  ipAddress?: string;
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
    details?: ActivityDetails;
  }>;
}

export interface DataProcessingActivity {
  name: string;
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'legitimate_interest';
  dataCategories: string[];
  retentionPeriod: string;
  thirdParties: string[];
}

export interface ConsentCheckResult {
  allowed: boolean;
  reason?: string;
  requiredConsent?: keyof Omit<UserConsent, 'timestamp' | 'version' | 'ipAddress'>;
}

const CONSENT_VERSION = '1.1.0';
const CONSENT_STORAGE_KEY = 'gdpr_user_consent';
const ANALYTICS_ENABLED_KEY = 'analytics_enabled';
const CONSENT_HISTORY_KEY = 'gdpr_consent_history';

const DATA_PROCESSING_ACTIVITIES: DataProcessingActivity[] = [
  {
    name: 'Wallet Connection',
    purpose: 'Authenticate user and enable blockchain interactions',
    legalBasis: 'contract',
    dataCategories: ['wallet_address'],
    retentionPeriod: 'Duration of session',
    thirdParties: ['Stacks blockchain network'],
  },
  {
    name: 'Transaction History',
    purpose: 'Display user prediction history and portfolio',
    legalBasis: 'contract',
    dataCategories: ['wallet_address', 'transaction_data'],
    retentionPeriod: '365 days',
    thirdParties: ['Stacks blockchain network'],
  },
  {
    name: 'Analytics',
    purpose: 'Improve application performance and user experience',
    legalBasis: 'consent',
    dataCategories: ['usage_data', 'interaction_data'],
    retentionPeriod: '30 days',
    thirdParties: [],
  },
  {
    name: 'Personalization',
    purpose: 'Customize user interface and recommendations',
    legalBasis: 'consent',
    dataCategories: ['preferences', 'behavior_data'],
    retentionPeriod: '90 days',
    thirdParties: [],
  },
  {
    name: 'Marketing',
    purpose: 'Send relevant updates and promotional content',
    legalBasis: 'consent',
    dataCategories: ['contact_preferences'],
    retentionPeriod: '60 days',
    thirdParties: [],
  },
  {
    name: 'KYC Verification',
    purpose: 'Verify user identity for regulatory compliance',
    legalBasis: 'legal_obligation',
    dataCategories: ['identity_documents', 'personal_information'],
    retentionPeriod: '5 years',
    thirdParties: ['KYC verification provider'],
  },
  {
    name: 'Referral Tracking',
    purpose: 'Track referral codes and reward referrers',
    legalBasis: 'legitimate_interest',
    dataCategories: ['referral_code', 'tracking_id'],
    retentionPeriod: '90 days',
    thirdParties: [],
  },
];

export class GDPRComplianceService {
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

  static async getUserConsentSecure(): Promise<UserConsent | null> {
    try {
      return await SecureStorageV2Service.getItem<UserConsent>(CONSENT_STORAGE_KEY);
    } catch {
      return this.getUserConsent();
    }
  }

  static setUserConsent(
    consent: Omit<UserConsent, 'timestamp' | 'version'>
  ): void {
    try {
      if (typeof localStorage === 'undefined') return;

      const previous = this.getUserConsent();

      const userConsent: UserConsent = {
        ...consent,
        necessary: true,
        timestamp: Date.now(),
        version: CONSENT_VERSION,
      };

      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(userConsent));

      this.recordConsentHistory(previous, userConsent);

      SecureStorageV2Service.setItem(CONSENT_STORAGE_KEY, userConsent, {
        encrypt: true,
        category: 'necessary',
        requireConsent: false,
      }).catch(error => {
        console.error('Failed to store consent in secure storage:', error);
      });
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  private static recordConsentHistory(
    previous: UserConsent | null,
    current: UserConsent
  ): void {
    try {
      if (typeof localStorage === 'undefined') return;

      const stored = localStorage.getItem(CONSENT_HISTORY_KEY);
      const history: ConsentHistoryEntry[] = stored ? JSON.parse(stored) : [];

      history.push({
        timestamp: current.timestamp,
        previous: previous
          ? {
              analytics: previous.analytics,
              marketing: previous.marketing,
              personalization: previous.personalization,
            }
          : null,
        current: {
          analytics: current.analytics,
          marketing: current.marketing,
          personalization: current.personalization,
        },
      });

      const trimmedHistory = history.slice(-20);
      localStorage.setItem(CONSENT_HISTORY_KEY, JSON.stringify(trimmedHistory));

      SecureStorageV2Service.setItem(CONSENT_HISTORY_KEY, trimmedHistory, {
        encrypt: true,
        category: 'necessary',
        requireConsent: false,
      }).catch(error => {
        console.error('Failed to store consent history in secure storage:', error);
      });
    } catch {
      // Silently fail
    }
  }

  static checkConsentForStorage(
    data: Record<string, PIIValue>,
    category: 'analytics' | 'marketing' | 'personalization' | 'necessary'
  ): ConsentCheckResult {
    if (category === 'necessary') {
      return { allowed: true };
    }

    const detection = PIIDetectionService.detectPII(data);

    if (!detection.hasPII && !detection.requiresConsent) {
      return { allowed: true };
    }

    const consent = this.getUserConsent();

    if (!consent) {
      return {
        allowed: false,
        reason: 'No consent provided',
        requiredConsent: category,
      };
    }

    if (!this.isConsentUpToDate()) {
      return {
        allowed: false,
        reason: 'Consent is outdated and needs to be renewed',
        requiredConsent: category,
      };
    }

    const categoryAllowed = consent[category];

    if (!categoryAllowed) {
      return {
        allowed: false,
        reason: `User has not consented to ${category} data processing`,
        requiredConsent: category,
      };
    }

    return { allowed: true };
  }

  static isAnalyticsEnabled(): boolean {
    const consent = this.getUserConsent();
    if (!consent) return false;
    return consent.analytics;
  }

  static isMarketingEnabled(): boolean {
    const consent = this.getUserConsent();
    if (!consent) return false;
    return consent.marketing;
  }

  static isPersonalizationEnabled(): boolean {
    const consent = this.getUserConsent();
    if (!consent) return false;
    return consent.personalization;
  }

  static hasAnyConsent(): boolean {
    const consent = this.getUserConsent();
    return !!consent;
  }

  static acceptAll(): void {
    this.setUserConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    });
  }

  static rejectAll(): void {
    this.setUserConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    });
  }

  static acceptNecessary(): void {
    this.setUserConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    });
  }

  static updateConsent(
    updates: Partial<Omit<UserConsent, 'necessary' | 'timestamp' | 'version'>>
  ): void {
    const current = this.getUserConsent();
    this.setUserConsent({
      necessary: true,
      analytics: current?.analytics ?? false,
      marketing: current?.marketing ?? false,
      personalization: current?.personalization ?? false,
      ...updates,
    });
  }

  static async exportUserData(userId: string): Promise<UserData> {
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

  static async deleteUserData(userId: string): Promise<boolean> {
    try {
      if (typeof localStorage === 'undefined') return true;
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      localStorage.removeItem(ANALYTICS_ENABLED_KEY);
      return true;
    } catch {
      return false;
    }
  }

  static getPrivacyPolicyVersion(): string {
    return CONSENT_VERSION;
  }

  static isConsentUpToDate(): boolean {
    const consent = this.getUserConsent();
    if (!consent) return false;
    return consent.version === CONSENT_VERSION;
  }

  static requestConsentUpdate(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem('consent_update_required', 'true');
    } catch {
      // Silently fail
    }
  }

  static isConsentUpdateRequired(): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      if (localStorage.getItem('consent_update_required') === 'true') return true;
      return !this.isConsentUpToDate();
    } catch {
      return false;
    }
  }

  static clearConsentUpdateFlag(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem('consent_update_required');
    } catch {
      // Silently fail
    }
  }

  static getDataRetentionPeriod(): number {
    return 90;
  }

  static shouldDeleteData(createdAt: number): boolean {
    const retentionMs = this.getDataRetentionPeriod() * 24 * 60 * 60 * 1000;
    return Date.now() - createdAt > retentionMs;
  }

  static anonymizeUserData(userData: UserData): UserData {
    return {
      ...userData,
      userId: 'anonymous',
      walletAddress: 'anonymous',
      predictions: userData.predictions.map(p => ({ ...p })),
      activityLog: userData.activityLog.map(log => ({
        action: log.action,
        timestamp: log.timestamp,
      })),
    };
  }

  static getComplianceStatus(): {
    consentProvided: boolean;
    consentUpToDate: boolean;
    analyticsEnabled: boolean;
    marketingEnabled: boolean;
    personalizationEnabled: boolean;
    consentVersion: string;
    consentTimestamp: number | null;
  } {
    const consent = this.getUserConsent();
    return {
      consentProvided: !!consent,
      consentUpToDate: this.isConsentUpToDate(),
      analyticsEnabled: this.isAnalyticsEnabled(),
      marketingEnabled: this.isMarketingEnabled(),
      personalizationEnabled: this.isPersonalizationEnabled(),
      consentVersion: consent?.version ?? '',
      consentTimestamp: consent?.timestamp ?? null,
    };
  }

  static getDataProcessingActivities(): DataProcessingActivity[] {
    return [...DATA_PROCESSING_ACTIVITIES];
  }

  static getDataProcessingActivity(name: string): DataProcessingActivity | undefined {
    return DATA_PROCESSING_ACTIVITIES.find(a => a.name === name);
  }

  static getConsentHistory(): ConsentHistoryEntry[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const stored = localStorage.getItem(CONSENT_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static generatePrivacyReport(): {
    status: ReturnType<typeof GDPRComplianceService.getComplianceStatus>;
    processingActivities: DataProcessingActivity[];
    consentHistory: ConsentHistoryEntry[];
    dataRetentionDays: number;
  } {
    return {
      status: this.getComplianceStatus(),
      processingActivities: this.getDataProcessingActivities(),
      consentHistory: this.getConsentHistory(),
      dataRetentionDays: this.getDataRetentionPeriod(),
    };
  }
}
