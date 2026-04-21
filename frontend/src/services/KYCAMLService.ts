import { KYCStatus, AMLCheck } from '@/types/reputation';

export class KYCAMLService {
  private kycDatabase: Map<string, KYCStatus> = new Map();
  private amlChecks: Map<string, AMLCheck> = new Map();

  submitKYC(userId: string, documentType: 'passport' | 'license' | 'national_id', data: any): KYCStatus {
    const kycStatus: KYCStatus = {
      status: 'pending',
      submittedAt: Date.now(),
      documentType,
      documentVerified: false,
      addressVerified: false,
      faceVerified: false,
    };

    this.kycDatabase.set(userId, kycStatus);
    return kycStatus;
  }

  verifyDocument(userId: string): boolean {
    const kyc = this.kycDatabase.get(userId);
    if (!kyc) return false;

    kyc.documentVerified = true;
    kyc.lastUpdated = Date.now();
    this.kycDatabase.set(userId, kyc);

    return true;
  }

  verifyAddress(userId: string): boolean {
    const kyc = this.kycDatabase.get(userId);
    if (!kyc) return false;

    kyc.addressVerified = true;
    kyc.lastUpdated = Date.now();
    this.kycDatabase.set(userId, kyc);

    return true;
  }

  verifyFace(userId: string): boolean {
    const kyc = this.kycDatabase.get(userId);
    if (!kyc) return false;

    kyc.faceVerified = true;
    kyc.lastUpdated = Date.now();
    this.kycDatabase.set(userId, kyc);

    return true;
  }

  approveKYC(userId: string): KYCStatus {
    const kyc = this.kycDatabase.get(userId);
    if (!kyc) {
      throw new Error(`No KYC submission found for user ${userId}`);
    }

    kyc.status = 'approved';
    kyc.verifiedAt = Date.now();
    kyc.expiresAt = Date.now() + (365 * 24 * 60 * 60 * 1000);
    this.kycDatabase.set(userId, kyc);

    return kyc;
  }

  rejectKYC(userId: string): KYCStatus {
    const kyc = this.kycDatabase.get(userId);
    if (!kyc) {
      throw new Error(`No KYC submission found for user ${userId}`);
    }

    kyc.status = 'rejected';
    this.kycDatabase.set(userId, kyc);

    return kyc;
  }

  getKYCStatus(userId: string): KYCStatus | undefined {
    return this.kycDatabase.get(userId);
  }

  isKYCApproved(userId: string): boolean {
    const kyc = this.kycDatabase.get(userId);
    if (!kyc) return false;

    if (kyc.status !== 'approved') return false;
    if (kyc.expiresAt && kyc.expiresAt < Date.now()) return false;

    return kyc.documentVerified && kyc.addressVerified;
  }

  performAMLCheck(userId: string, userDataHash: string): AMLCheck {
    const checkId = `aml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const amlCheck: AMLCheck = {
      checkId,
      userId,
      timestamp: Date.now(),
      pep: false,
      sanctions: false,
      adverseMedia: false,
      riskScore: this.calculateAMLRiskScore({
        pep: false,
        sanctions: false,
        adverseMedia: false,
      }),
      status: 'clear',
    };

    this.amlChecks.set(checkId, amlCheck);
    return amlCheck;
  }

  updateAMLStatus(userId: string, data: { pep: boolean; sanctions: boolean; adverseMedia: boolean }): AMLCheck {
    const lastCheck = Array.from(this.amlChecks.values())
      .filter(check => check.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (!lastCheck) {
      return this.performAMLCheck(userId, '');
    }

    lastCheck.pep = data.pep;
    lastCheck.sanctions = data.sanctions;
    lastCheck.adverseMedia = data.adverseMedia;
    lastCheck.riskScore = this.calculateAMLRiskScore(data);

    if (lastCheck.riskScore > 70) {
      lastCheck.status = 'flagged';
    } else if (lastCheck.riskScore > 40) {
      lastCheck.status = 'under_review';
    } else {
      lastCheck.status = 'clear';
    }

    this.amlChecks.set(lastCheck.checkId, lastCheck);
    return lastCheck;
  }

  private calculateAMLRiskScore(data: { pep: boolean; sanctions: boolean; adverseMedia: boolean }): number {
    let score = 0;

    if (data.pep) score += 40;
    if (data.sanctions) score += 50;
    if (data.adverseMedia) score += 30;

    return Math.min(100, score);
  }

  getAMLCheck(checkId: string): AMLCheck | undefined {
    return this.amlChecks.get(checkId);
  }

  getUserAMLChecks(userId: string): AMLCheck[] {
    return Array.from(this.amlChecks.values())
      .filter(check => check.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  getLatestAMLCheck(userId: string): AMLCheck | undefined {
    const checks = this.getUserAMLChecks(userId);
    return checks.length > 0 ? checks[0] : undefined;
  }

  isAMLClear(userId: string): boolean {
    const latestCheck = this.getLatestAMLCheck(userId);
    if (!latestCheck) return false;

    return latestCheck.status === 'clear' && !latestCheck.pep && !latestCheck.sanctions;
  }
}
