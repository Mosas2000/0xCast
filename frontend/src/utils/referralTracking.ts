import { getReferralCodeFromUrl } from '../utils/referralUtils';
import { GDPRComplianceService } from '../services/GDPRComplianceService';

interface ReferralTrackingContext {
  referralCode: string | null;
  referralSource: 'url' | 'storage' | 'none';
  trackingId: string;
}

export class ReferralTracker {
  private static readonly STORAGE_KEY = 'oxcast_referral_code';
  private static readonly TRACKING_ID_KEY = 'oxcast_tracking_id';

  static initializeTracking(): ReferralTrackingContext {
    const referralCode = getReferralCodeFromUrl();
    let source: 'url' | 'storage' | 'none' = 'none';

    if (referralCode) {
      source = 'url';
      this.saveReferralCode(referralCode);
    } else {
      const savedCode = this.getSavedReferralCode();
      if (savedCode) {
        source = 'storage';
      }
    }

    const trackingId = this.getOrCreateTrackingId();

    return {
      referralCode: referralCode || this.getSavedReferralCode() || null,
      referralSource: source,
      trackingId,
    };
  }

  static saveReferralCode(code: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const consentCheck = GDPRComplianceService.checkConsentForStorage(
        { referralCode: code },
        'necessary'
      );

      if (!consentCheck.allowed) {
        console.warn('Referral code storage blocked: consent not provided');
        return;
      }

      localStorage.setItem(this.STORAGE_KEY, code);
      localStorage.setItem('referral_timestamp', new Date().toISOString());
    }
  }

  static getSavedReferralCode(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.STORAGE_KEY);
  }

  static getOrCreateTrackingId(): string {
    if (typeof window === 'undefined') return '';

    let trackingId = localStorage.getItem(this.TRACKING_ID_KEY);
    if (!trackingId) {
      const consentCheck = GDPRComplianceService.checkConsentForStorage(
        { trackingId: 'new' },
        'necessary'
      );

      if (!consentCheck.allowed) {
        return `session_${Date.now()}`;
      }

      trackingId = `tracking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(this.TRACKING_ID_KEY, trackingId);
    }
    return trackingId;
  }

  static clearReferralCode(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem('referral_timestamp');
    }
  }

  static getReferralTimestamp(): Date | null {
    if (typeof window === 'undefined') return null;
    const timestamp = localStorage.getItem('referral_timestamp');
    return timestamp ? new Date(timestamp) : null;
  }

  static isReferralValid(expiryDays: number = 30): boolean {
    const timestamp = this.getReferralTimestamp();
    if (!timestamp) return false;

    const now = new Date();
    const expiryTime = new Date(timestamp.getTime() + expiryDays * 24 * 60 * 60 * 1000);
    return now < expiryTime;
  }

  static trackPageView(pageName: string): void {
    if (!GDPRComplianceService.isAnalyticsEnabled()) {
      return;
    }

    const trackingData = {
      page: pageName,
      timestamp: new Date().toISOString(),
      trackingId: this.getOrCreateTrackingId(),
      referralCode: this.getSavedReferralCode(),
    };

    console.log('Page view tracked:', trackingData);

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', trackingData);
    }
  }

  static trackReferralAction(action: string, data: any = {}): void {
    if (!GDPRComplianceService.isAnalyticsEnabled()) {
      return;
    }

    const trackingData = {
      action,
      timestamp: new Date().toISOString(),
      trackingId: this.getOrCreateTrackingId(),
      referralCode: this.getSavedReferralCode(),
      ...data,
    };

    console.log('Action tracked:', trackingData);

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', `referral_${action}`, trackingData);
    }
  }

  static getTrackingInfo(): ReferralTrackingContext {
    return {
      referralCode: this.getSavedReferralCode(),
      referralSource: this.getSavedReferralCode() ? 'storage' : 'none',
      trackingId: this.getOrCreateTrackingId(),
    };
  }
}

export class ReferralMiddleware {
  static setupReferralTracking(): void {
    const context = ReferralTracker.initializeTracking();

    if (context.referralCode) {
      console.log(`Referral tracking initialized with code: ${context.referralCode}`);
      ReferralTracker.trackReferralAction('initialized', {
        source: context.referralSource,
      });
    }
  }

  static handleReferralRegistration(userAddress: string, referralCode: string): void {
    console.log(`User ${userAddress} registered with referral code: ${referralCode}`);
    ReferralTracker.trackReferralAction('registered', {
      referralCode,
      userAddress,
    });
  }

  static handleReferralClaimRewards(userAddress: string, amount: number): void {
    console.log(`User ${userAddress} claimed ${amount} rewards`);
    ReferralTracker.trackReferralAction('claimed_rewards', {
      amount,
      userAddress,
    });
  }

  static handleRewardTrigger(
    userAddress: string,
    actionAmount: number,
    actionType: string
  ): void {
    console.log(
      `Reward triggered for ${userAddress}: ${actionAmount} for action ${actionType}`
    );
    ReferralTracker.trackReferralAction('reward_triggered', {
      actionAmount,
      actionType,
      userAddress,
    });
  }
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default {
  ReferralTracker,
  ReferralMiddleware,
};
