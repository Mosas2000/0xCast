import { useState, useCallback, useEffect } from 'react';
import { UserReputation, ReputationScore, FraudAlert, SuspiciousActivity, ReputationMetrics, KYCDocumentData, TransactionForAnalysis, AccountForAnalysis, LinkedAccount, ReputationBadge } from '@/types/reputation';
import { ReputationManager } from '@/services/ReputationManager';

const reputationManager = new ReputationManager();

export function useReputation(userId: string) {
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    let existing = reputationManager.getUserReputation(userId);
    if (!existing) {
      existing = reputationManager.createUserReputation(userId);
    }
    setReputation(existing);
    setLoading(false);
  }, [userId]);

  const updateMetrics = useCallback((metrics: ReputationMetrics) => {
    const score = reputationManager.updateReputationScore(userId, metrics);
    const updated = reputationManager.getUserReputation(userId);
    setReputation(updated || null);
    return score;
  }, [userId]);

  return { reputation, loading, updateMetrics };
}

export function useReputationScore(userId: string) {
  const [score, setScore] = useState<ReputationScore | null>(null);

  useEffect(() => {
    const retrievedScore = reputationManager.getReputationScore(userId);
    setScore(retrievedScore || null);
  }, [userId]);

  return score;
}

export function useKYC(userId: string) {
  const [kycStatus, setKycStatus] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  const submitKYC = useCallback((documentType: 'passport' | 'license' | 'national_id', data: KYCDocumentData) => {
    const status = reputationManager.submitKYC(userId, documentType, data);
    setKycStatus(status);
    return status;
  }, [userId]);

  const approveKYC = useCallback(() => {
    const status = reputationManager.approveKYC(userId);
    setKycStatus(status);
    return status;
  }, [userId]);

  useEffect(() => {
    const verified = reputationManager.isKYCVerified(userId);
    setIsVerified(verified);
  }, [userId]);

  return { kycStatus, isVerified, submitKYC, approveKYC };
}

export function useAML(userId: string) {
  const [amlStatus, setAmlStatus] = useState(null);
  const [isAMLClear, setIsAMLClear] = useState(false);

  const performCheck = useCallback(() => {
    const check = reputationManager.performAMLCheck(userId);
    setAmlStatus(check);
    return check;
  }, [userId]);

  useEffect(() => {
    const clear = reputationManager.isAMLClear(userId);
    setIsAMLClear(clear);
  }, [userId]);

  return { amlStatus, isAMLClear, performCheck };
}

export function useFraudDetection(userId: string) {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);

  const checkWashTrading = useCallback((transactions: TransactionForAnalysis[]) => {
    return reputationManager.checkWashTrading(userId, transactions);
  }, [userId]);

  const checkSybilAttack = useCallback((accounts: AccountForAnalysis[]) => {
    return reputationManager.checkSybilAttack(userId, accounts);
  }, [userId]);

  const checkPumpDump = useCallback((transactions: TransactionForAnalysis[]) => {
    return reputationManager.checkPumpDump(userId, transactions);
  }, [userId]);

  const checkPriceManipulation = useCallback((transactions: TransactionForAnalysis[], marketPrice: number) => {
    return reputationManager.checkPriceManipulation(userId, transactions, marketPrice);
  }, [userId]);

  useEffect(() => {
    const userAlerts = reputationManager.getAlerts(userId);
    setAlerts(userAlerts);

    const activities = reputationManager.getSuspiciousActivities(userId);
    setSuspiciousActivities(activities);
  }, [userId]);

  return {
    alerts,
    suspiciousActivities,
    checkWashTrading,
    checkSybilAttack,
    checkPumpDump,
    checkPriceManipulation,
  };
}

export function useAccountLinking(userId: string) {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);

  const linkAccount = useCallback((accountIdentifier: string, linkType: 'wallet' | 'email' | 'phone' | 'social') => {
    const linked = reputationManager.linkAccount(userId, accountIdentifier, linkType);
    const updated = reputationManager.getLinkedAccounts(userId);
    setLinkedAccounts(updated);
    return linked;
  }, [userId]);

  useEffect(() => {
    const accounts = reputationManager.getLinkedAccounts(userId);
    setLinkedAccounts(accounts);
  }, [userId]);

  return { linkedAccounts, linkAccount };
}

export function useReputationBadges(userId: string) {
  const [badges, setBadges] = useState<ReputationBadge[]>([]);

  useEffect(() => {
    const userBadges = reputationManager.getReputationBadges(userId);
    setBadges(userBadges);
  }, [userId]);

  return badges;
}

export function useReputationLevel(userId: string) {
  const [level, setLevel] = useState<string>('new');

  useEffect(() => {
    const userLevel = reputationManager.getReputationLevel(userId);
    setLevel(userLevel);
  }, [userId]);

  return level;
}
