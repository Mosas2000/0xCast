import { sha256 } from 'crypto-js';

export const generateReferralCode = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${random}${timestamp.slice(-6)}`;
};

export const validateReferralCode = (code: string): boolean => {
  if (!code) return false;
  if (code.length < 6 || code.length > 16) return false;
  if (!/^[A-Z0-9]{6,16}$/.test(code)) return false;
  return true;
};

export const createReferralLink = (baseUrl: string, code: string): string => {
  if (!validateReferralCode(code)) {
    throw new Error('Invalid referral code');
  }
  const url = new URL(baseUrl);
  url.searchParams.set('ref', code);
  return url.toString();
};

export const getReferralCodeFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('ref');
};

export const calculateRewardAmount = (actionAmount: number, rewardRate: number = 5): number => {
  return (actionAmount * rewardRate) / 100;
};

export const formatRewardAmount = (amount: number, decimals: number = 6): string => {
  const divisor = Math.pow(10, decimals);
  return (amount / divisor).toFixed(4);
};

export const isSelfReferral = (referrerAddress: string, userAddress: string): boolean => {
  return referrerAddress.toLowerCase() === userAddress.toLowerCase();
};

export const encodeReferralData = (data: {
  referrer: string;
  timestamp: number;
}): string => {
  const json = JSON.stringify(data);
  return Buffer.from(json).toString('base64');
};

export const decodeReferralData = (encoded: string): { referrer: string; timestamp: number } | null => {
  try {
    const json = Buffer.from(encoded, 'base64').toString('utf-8');
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const hashReferralCode = (code: string): string => {
  return sha256(code).toString();
};

export const isValidPrincipalAddress = (address: string): boolean => {
  if (!address) return false;
  if (!/^[13][A-KM-Za-km-z1-9]{25,34}$/.test(address)) return false;
  return true;
};

export const generateAffiliateToken = (userAddress: string, timestamp: number): string => {
  const data = `${userAddress}:${timestamp}`;
  return Buffer.from(data).toString('base64');
};

export const formatAffiliateStats = (stats: any) => {
  return {
    totalReferred: parseInt(stats['total-referred']?.value || 0),
    totalEarned: parseInt(stats['total-earned']?.value || 0),
    totalClaimed: parseInt(stats['total-claimed']?.value || 0),
    pendingRewards: parseInt(stats['pending-rewards']?.value || 0),
    activeReferrals: parseInt(stats['active-referrals']?.value || 0),
  };
};

export const calculateCommissionTiers = (referralCount: number): number => {
  if (referralCount >= 100) return 10;
  if (referralCount >= 50) return 8;
  if (referralCount >= 25) return 7;
  if (referralCount >= 10) return 6;
  if (referralCount >= 5) return 5;
  return 5;
};

export const estimateMonthlyRewards = (
  pendingRewards: number,
  dailyActivityAmount: number,
  rewardRate: number = 5,
  daysInMonth: number = 30
): number => {
  const dailyRewards = (dailyActivityAmount * rewardRate) / 100;
  return pendingRewards + dailyRewards * daysInMonth;
};

export const formatDateFromBlock = (blockHeight: number): Date => {
  const blockTime = 10 * 60 * 1000;
  const genesisTime = new Date('2021-01-03');
  return new Date(genesisTime.getTime() + blockHeight * blockTime);
};

export const shouldShowRewardClaim = (pendingRewards: number, minimumThreshold: number = 0.0001): boolean => {
  return pendingRewards > minimumThreshold;
};

export const generateShareMessage = (code: string, appName: string = '0xCast'): string => {
  return `Join me on ${appName}! Use my referral code: ${code}. Earn rewards for predictions and affiliate bonuses!`;
};

export const generateTwitterShareLink = (code: string, appName: string = '0xCast'): string => {
  const message = generateShareMessage(code, appName);
  const encodedMessage = encodeURIComponent(message);
  return `https://twitter.com/intent/tweet?text=${encodedMessage}`;
};

export const generateWhatsAppShareLink = (code: string, appName: string = '0xCast'): string => {
  const message = generateShareMessage(code, appName);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/?text=${encodedMessage}`;
};

export const generateFacebookShareLink = (code: string, appUrl: string): string => {
  const referralLink = createReferralLink(appUrl, code);
  const encodedLink = encodeURIComponent(referralLink);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
};
