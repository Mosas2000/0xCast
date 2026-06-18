import type { KYCStatus, AMLCheck } from '@/types/reputation';
import type { KYCDocumentData } from '@/types/common';

interface KYCDocument {
  documentId: string;
  userId: string;
  type: 'passport' | 'license' | 'national_id';
  frontImage: string;
  backImage?: string;
  selfieImage: string;
  uploadedAt: number;
  verified: boolean;
}

interface AddressProof {
  proofId: string;
  userId: string;
  documentType: 'utility_bill' | 'bank_statement' | 'tax_document';
  image: string;
  address: string;
  uploadedAt: number;
  verified: boolean;
}

export class KYCAMLService {
  private kycDatabase: Map<string, KYCStatus> = new Map();
  private amlChecks: Map<string, AMLCheck> = new Map();
  private documents: Map<string, KYCDocument> = new Map();
  private addressProofs: Map<string, AddressProof> = new Map();
  private verificationAttempts: Map<string, number> = new Map();

  submitKYC(userId: string, documentType: 'passport' | 'license' | 'national_id', data: KYCDocumentData): KYCStatus {
    const attempts = this.verificationAttempts.get(userId) || 0;
    
    if (attempts >= 3) {
      throw new Error('Maximum verification attempts exceeded');
    }

    const kycStatus: KYCStatus = {
      status: 'pending',
      submittedAt: Date.now(),
      documentType,
      documentVerified: false,
      addressVerified: false,
      faceVerified: false,
    };

    this.kycDatabase.set(userId, kycStatus);
    this.verificationAttempts.set(userId, attempts + 1);
    
    return kycStatus;
  }

  uploadDocument(
    userId: string,
    type: 'passport' | 'license' | 'national_id',
    frontImage: string,
    backImage: string | undefined,
    selfieImage: string
  ): KYCDocument {
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const document: KYCDocument = {
      documentId,
      userId,
      type,
      frontImage,
      backImage,
      selfieImage,
      uploadedAt: Date.now(),
      verified: false,
    };

    this.documents.set(documentId, document);
    return document;
  }

  uploadAddressProof(
    userId: string,
    documentType: 'utility_bill' | 'bank_statement' | 'tax_document',
    image: string,
    address: string
  ): AddressProof {
    const proofId = `proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const proof: AddressProof = {
      proofId,
      userId,
      documentType,
      image,
      address,
      uploadedAt: Date.now(),
      verified: false,
    };

    this.addressProofs.set(proofId, proof);
    return proof;
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

  getVerificationAttempts(userId: string): number {
    return this.verificationAttempts.get(userId) || 0;
  }

  resetVerificationAttempts(userId: string): void {
    this.verificationAttempts.delete(userId);
  }

  getUserDocuments(userId: string): KYCDocument[] {
    return Array.from(this.documents.values())
      .filter(doc => doc.userId === userId)
      .sort((a, b) => b.uploadedAt - a.uploadedAt);
  }

  getUserAddressProofs(userId: string): AddressProof[] {
    return Array.from(this.addressProofs.values())
      .filter(proof => proof.userId === userId)
      .sort((a, b) => b.uploadedAt - a.uploadedAt);
  }

  verifyDocumentById(documentId: string): boolean {
    const document = this.documents.get(documentId);
    if (!document) return false;

    document.verified = true;
    this.documents.set(documentId, document);

    return this.verifyDocument(document.userId);
  }

  verifyAddressProofById(proofId: string): boolean {
    const proof = this.addressProofs.get(proofId);
    if (!proof) return false;

    proof.verified = true;
    this.addressProofs.set(proofId, proof);

    return this.verifyAddress(proof.userId);
  }

  getKYCCompletionPercentage(userId: string): number {
    const kyc = this.kycDatabase.get(userId);
    if (!kyc) return 0;

    let completed = 0;
    const total = 3;

    if (kyc.documentVerified) completed++;
    if (kyc.addressVerified) completed++;
    if (kyc.faceVerified) completed++;

    return Math.round((completed / total) * 100);
  }

  requiresReverification(userId: string): boolean {
    const kyc = this.kycDatabase.get(userId);
    if (!kyc || kyc.status !== 'approved') return false;

    if (kyc.expiresAt && kyc.expiresAt < Date.now()) {
      return true;
    }

    const daysSinceVerification = kyc.verifiedAt
      ? (Date.now() - kyc.verifiedAt) / (1000 * 60 * 60 * 24)
      : 0;

    return daysSinceVerification > 365;
  }
}

