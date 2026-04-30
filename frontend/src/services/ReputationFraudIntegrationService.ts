import { ReputationService } from './ReputationService';
import { FraudDetectionService } from './FraudDetectionService';
import { KYCAMLService } from './KYCAMLService';
import { AccountLinkingService } from './AccountLinkingService';
import { UserReputation, SuspiciousActivity } from '../types/reputation';
import type { FraudTransaction } from '@/types/common';

export class ReputationFraudIntegrationService {
  private reputationService: ReputationService;
  private fraudDetectionService: FraudDetectionService;
  private kycAMLService: KYCAMLService;
  private accountLinkingService: AccountLinkingService;

  constructor() {
    this.reputationService = new ReputationService();
    this.fraudDetectionService = new FraudDetectionService();
    this.kycAMLService = new KYCAMLService();
    this.accountLinkingService = new AccountLinkingService();
  }

  initializeUser(userId: string): UserReputation {
    const reputation = this.reputationService.initializeReputation(userId);
    this.kycAMLService.performAMLCheck(userId, userId);
    return reputation;
  }

  processTransaction(userId: string, transaction: FraudTransaction): {
    allowed: boolean;
    reason?: string;
    riskScore: number;
  } {
    const reputation = this.reputationService.getReputation(userId);
    if (!reputation) {
      return { allowed: false, reason: 'User not found', riskScore: 100 };
    }

    const kycStatus = this.kycAMLService.getKYCStatus(userId);
    if (!kycStatus || kycStatus.status !== 'approved') {
      if (transaction.amount > 1000) {
        return { allowed: false, reason: 'KYC verification required for large transactions', riskScore: 70 };
      }
    }

    const amlCheck = this.kycAMLService.getLatestAMLCheck(userId);
    if (amlCheck && amlCheck.status === 'flagged') {
      return { allowed: false, reason: 'AML check flagged', riskScore: 90 };
    }

    const riskScore = this.fraudDetectionService.getRiskScore(userId);
    if (riskScore >= 80) {
      return { allowed: false, reason: 'High fraud risk detected', riskScore };
    }

    const behavior = this.fraudDetectionService.getTradingBehavior(userId);
    if (behavior) {
      const isAnomalous = this.fraudDetectionService.detectAnomalousBehavior(userId, transaction);
      if (isAnomalous && riskScore >= 50) {
        return { allowed: false, reason: 'Anomalous behavior detected', riskScore };
      }
    }

    return { allowed: true, riskScore };
  }

  updateUserMetrics(userId: string, transactionSuccess: boolean, responseTime: number): void {
    const reputation = this.reputationService.getReputation(userId);
    if (!reputation) return;

    const metrics = {
      totalTransactions: reputation.reputationScore.totalTransactions + 1,
      successfulTransactions: transactionSuccess
        ? reputation.reputationScore.successfulTransactions + 1
        : reputation.reputationScore.successfulTransactions,
      failedTransactions: !transactionSuccess
        ? reputation.reputationScore.failedTransactions + 1
        : reputation.reputationScore.failedTransactions,
      averageResponseTime: (reputation.reputationScore.averageResponseTime * reputation.reputationScore.totalTransactions + responseTime) /
        (reputation.reputationScore.totalTransactions + 1),
      accountAge: Date.now() - reputation.createdAt,
      verificationLevel: this.calculateVerificationLevel(userId),
      suspiciousActivityCount: reputation.suspiciousActivities.length,
    };

    const newScore = this.reputationService.calculateReputationScore(userId, metrics);
    this.reputationService.updateReputation(userId, newScore);

    const eligibleBadges = this.reputationService.checkBadgeEligibility(userId);
    eligibleBadges.forEach(badge => {
      this.reputationService.awardBadge(userId, badge);
    });
  }

  private calculateVerificationLevel(userId: string): number {
    let level = 0;

    const kycStatus = this.kycAMLService.getKYCStatus(userId);
    if (kycStatus) {
      if (kycStatus.documentVerified) level++;
      if (kycStatus.addressVerified) level++;
      if (kycStatus.faceVerified) level++;
    }

    const linkedAccounts = this.accountLinkingService.getLinkedAccounts(userId);
    if (linkedAccounts.length >= 2) level++;

    return level;
  }

  detectFraudulentActivity(userId: string, transactions: FraudTransaction[]): SuspiciousActivity[] {
    const activities: SuspiciousActivity[] = [];

    if (this.fraudDetectionService.detectWashTrading(userId, transactions)) {
      activities.push(...this.fraudDetectionService.getSuspiciousActivities(userId));
    }

    if (this.fraudDetectionService.detectPumpDump(userId, transactions)) {
      activities.push(...this.fraudDetectionService.getSuspiciousActivities(userId));
    }

    const sybilDetection = this.accountLinkingService.detectSybilAccounts(userId);
    if (sybilDetection.confidence > 70) {
      this.fraudDetectionService.detectSybilAttack(userId, [
        { 
          id: userId, 
          ipAddress: '0.0.0.0', 
          createdAt: Date.now(), 
          tradingPatterns: {
            averageVolume: 0,
            tradingFrequency: 0,
            preferredMarkets: []
          }
        },
      ]);
      activities.push(...this.fraudDetectionService.getSuspiciousActivities(userId));
    }

    if (activities.length > 0) {
      this.reputationService.adjustReputation(
        userId,
        -50 * activities.length,
        'Fraudulent activity detected',
        'system'
      );
    }

    return activities;
  }

  getUserTrustScore(userId: string): {
    score: number;
    level: string;
    factors: {
      reputation: number;
      kyc: number;
      aml: number;
      accountAge: number;
      linkedAccounts: number;
      fraudRisk: number;
    };
  } {
    const reputation = this.reputationService.getReputation(userId);
    if (!reputation) {
      return {
        score: 0,
        level: 'untrusted',
        factors: {
          reputation: 0,
          kyc: 0,
          aml: 0,
          accountAge: 0,
          linkedAccounts: 0,
          fraudRisk: 100,
        },
      };
    }

    const reputationScore = reputation.reputationScore.score / 10;

    const kycStatus = this.kycAMLService.getKYCStatus(userId);
    const kycScore = kycStatus && kycStatus.status === 'approved' ? 20 : 0;

    const amlCheck = this.kycAMLService.getLatestAMLCheck(userId);
    const amlScore = amlCheck && amlCheck.status === 'clear' ? 15 : 0;

    const accountAge = Date.now() - reputation.createdAt;
    const accountAgeScore = Math.min(15, (accountAge / (1000 * 60 * 60 * 24 * 30)) * 2);

    const linkedAccounts = this.accountLinkingService.getLinkedAccounts(userId);
    const linkedAccountsScore = Math.min(10, linkedAccounts.length * 3);

    const fraudRisk = this.fraudDetectionService.getRiskScore(userId);
    const fraudScore = Math.max(0, 30 - fraudRisk / 3);

    const totalScore = reputationScore + kycScore + amlScore + accountAgeScore + linkedAccountsScore + fraudScore;

    let level = 'untrusted';
    if (totalScore >= 80) level = 'highly_trusted';
    else if (totalScore >= 60) level = 'trusted';
    else if (totalScore >= 40) level = 'verified';
    else if (totalScore >= 20) level = 'basic';

    return {
      score: Math.round(totalScore),
      level,
      factors: {
        reputation: Math.round(reputationScore),
        kyc: kycScore,
        aml: amlScore,
        accountAge: Math.round(accountAgeScore),
        linkedAccounts: linkedAccountsScore,
        fraudRisk: Math.round(fraudScore),
      },
    };
  }

  generateComplianceReport(userId: string): {
    userId: string;
    timestamp: number;
    kycStatus: string;
    amlStatus: string;
    reputationScore: number;
    fraudRiskScore: number;
    suspiciousActivities: number;
    linkedAccounts: number;
    recommendation: string;
  } {
    const reputation = this.reputationService.getReputation(userId);
    const kycStatus = this.kycAMLService.getKYCStatus(userId);
    const amlCheck = this.kycAMLService.getLatestAMLCheck(userId);
    const fraudRisk = this.fraudDetectionService.getRiskScore(userId);
    const linkedAccounts = this.accountLinkingService.getLinkedAccounts(userId);

    let recommendation = 'Account in good standing';
    if (fraudRisk >= 80) {
      recommendation = 'Immediate review required - High fraud risk';
    } else if (!kycStatus || kycStatus.status !== 'approved') {
      recommendation = 'KYC verification required';
    } else if (amlCheck && amlCheck.status === 'flagged') {
      recommendation = 'AML review required';
    } else if (fraudRisk >= 50) {
      recommendation = 'Enhanced monitoring recommended';
    }

    return {
      userId,
      timestamp: Date.now(),
      kycStatus: kycStatus?.status || 'not_started',
      amlStatus: amlCheck?.status || 'not_checked',
      reputationScore: reputation?.reputationScore.score || 0,
      fraudRiskScore: fraudRisk,
      suspiciousActivities: reputation?.suspiciousActivities.length || 0,
      linkedAccounts: linkedAccounts.length,
      recommendation,
    };
  }

  enforceTransactionLimits(userId: string, amount: number): {
    allowed: boolean;
    limit: number;
    reason?: string;
  } {
    const trustScore = this.getUserTrustScore(userId);
    const kycStatus = this.kycAMLService.getKYCStatus(userId);

    let limit = 100;

    if (kycStatus && kycStatus.status === 'approved') {
      limit = 10000;
    } else if (trustScore.score >= 60) {
      limit = 5000;
    } else if (trustScore.score >= 40) {
      limit = 1000;
    } else if (trustScore.score >= 20) {
      limit = 500;
    }

    if (amount > limit) {
      return {
        allowed: false,
        limit,
        reason: `Transaction amount exceeds limit of ${limit} for your trust level`,
      };
    }

    return { allowed: true, limit };
  }

  getReputationService(): ReputationService {
    return this.reputationService;
  }

  getFraudDetectionService(): FraudDetectionService {
    return this.fraudDetectionService;
  }

  getKYCAMLService(): KYCAMLService {
    return this.kycAMLService;
  }

  getAccountLinkingService(): AccountLinkingService {
    return this.accountLinkingService;
  }
}

export const reputationFraudIntegration = new ReputationFraudIntegrationService();
