import { UserReputation, ReputationScore } from '@/types/reputation';
import { ReputationScoringService } from './ReputationScoringService';
import { KYCAMLService } from './KYCAMLService';
import { FraudDetectionService } from './FraudDetectionService';
import { AccountLinkingService } from './AccountLinkingService';

export class ReputationManager {
  private userReputations: Map<string, UserReputation> = new Map();
  private scoringService: ReputationScoringService;
  private kycAMLService: KYCAMLService;
  private fraudDetectionService: FraudDetectionService;
  private accountLinkingService: AccountLinkingService;

  constructor() {
    this.scoringService = new ReputationScoringService();
    this.kycAMLService = new KYCAMLService();
    this.fraudDetectionService = new FraudDetectionService();
    this.accountLinkingService = new AccountLinkingService();
  }

  createUserReputation(userId: string): UserReputation {
    const score = this.scoringService.calculateReputationScore(userId, {
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      averageResponseTime: 0,
      accountAge: 0,
      verificationLevel: 0,
    });

    const userReputation: UserReputation = {
      userId,
      reputationScore: score,
      verificationStatus: 'unverified',
      accountLinks: [],
      suspiciousActivities: [],
      kycStatus: {
        status: 'not_started',
        documentType: 'passport',
        documentVerified: false,
        addressVerified: false,
        faceVerified: false,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.userReputations.set(userId, userReputation);
    return userReputation;
  }

  getUserReputation(userId: string): UserReputation | undefined {
    return this.userReputations.get(userId);
  }

  updateReputationScore(userId: string, metrics: any): ReputationScore {
    const score = this.scoringService.calculateReputationScore(userId, metrics);
    const reputation = this.userReputations.get(userId);

    if (reputation) {
      reputation.reputationScore = score;
      reputation.updatedAt = Date.now();
      this.userReputations.set(userId, reputation);
    }

    return score;
  }

  submitKYC(userId: string, documentType: 'passport' | 'license' | 'national_id', data: any) {
    const kycStatus = this.kycAMLService.submitKYC(userId, documentType, data);
    const reputation = this.userReputations.get(userId);

    if (reputation) {
      reputation.kycStatus = kycStatus;
      reputation.verificationStatus = 'pending';
      reputation.updatedAt = Date.now();
      this.userReputations.set(userId, reputation);
    }

    return kycStatus;
  }

  approveKYC(userId: string) {
    const kycStatus = this.kycAMLService.approveKYC(userId);
    const reputation = this.userReputations.get(userId);

    if (reputation) {
      reputation.kycStatus = kycStatus;
      reputation.verificationStatus = 'verified';
      reputation.updatedAt = Date.now();
      this.userReputations.set(userId, reputation);
    }

    return kycStatus;
  }

  performAMLCheck(userId: string): any {
    const amlCheck = this.kycAMLService.performAMLCheck(userId, '');
    return amlCheck;
  }

  isKYCVerified(userId: string): boolean {
    return this.kycAMLService.isKYCApproved(userId);
  }

  isAMLClear(userId: string): boolean {
    return this.kycAMLService.isAMLClear(userId);
  }

  checkWashTrading(userId: string, transactions: any[]): boolean {
    return this.fraudDetectionService.detectWashTrading(userId, transactions);
  }

  checkSybilAttack(userId: string, accounts: any[]): boolean {
    return this.fraudDetectionService.detectSybilAttack(userId, accounts);
  }

  checkPumpDump(userId: string, transactions: any[]): boolean {
    return this.fraudDetectionService.detectPumpDump(userId, transactions);
  }

  checkPriceManipulation(userId: string, transactions: any[], marketPrice: number): boolean {
    return this.fraudDetectionService.detectPriceManipulation(userId, transactions, marketPrice);
  }

  linkAccount(userId: string, accountIdentifier: string, linkType: 'wallet' | 'email' | 'phone' | 'social') {
    const linkedAccount = this.accountLinkingService.linkAccount(userId, accountIdentifier, linkType);
    const reputation = this.userReputations.get(userId);

    if (reputation) {
      reputation.accountLinks.push(linkedAccount);
      reputation.updatedAt = Date.now();
      this.userReputations.set(userId, reputation);
    }

    return linkedAccount;
  }

  getLinkedAccounts(userId: string) {
    const reputation = this.userReputations.get(userId);
    return reputation?.accountLinks || [];
  }

  getReputationScore(userId: string): ReputationScore | undefined {
    return this.scoringService.getReputationScore(userId);
  }

  getReputationBadges(userId: string) {
    return this.scoringService.getBadges(userId);
  }

  getReputationLevel(userId: string): string {
    const score = this.getReputationScore(userId);
    return score?.level || 'new';
  }

  getHighRiskUsers(threshold: number = 50): string[] {
    return this.fraudDetectionService.getHighRiskUsers(threshold);
  }

  getSuspiciousActivities(userId: string) {
    return this.fraudDetectionService.getSuspiciousActivities(userId);
  }

  getAlerts(userId: string) {
    return this.fraudDetectionService.getAlerts(userId);
  }

  getAllUserReputations(): UserReputation[] {
    return Array.from(this.userReputations.values());
  }

  getScoringService(): ReputationScoringService {
    return this.scoringService;
  }

  getKYCAMLService(): KYCAMLService {
    return this.kycAMLService;
  }

  getFraudDetectionService(): FraudDetectionService {
    return this.fraudDetectionService;
  }

  getAccountLinkingService(): AccountLinkingService {
    return this.accountLinkingService;
  }
}
