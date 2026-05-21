import React, { useState, useEffect } from 'react';
import { useReferral } from '@/hooks/useReferral';
import {
  createReferralLink,
  generateShareMessage,
  generateTwitterShareLink,
  generateWhatsAppShareLink,
  formatRewardAmount,
  calculateCommissionTiers,
  estimateMonthlyRewards,
} from '@/utils/referralUtils';

interface ReferralDashboardProps {
  userAddress: string | null;
  appUrl: string;
}

export const ReferralDashboard: React.FC<ReferralDashboardProps> = ({ userAddress, appUrl }) => {
  const { referralCode, stats, isLoading, error, generateCode, claimRewards } = useReferral(userAddress);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [selectedShareMethod, setSelectedShareMethod] = useState<'copy' | 'twitter' | 'whatsapp' | null>(null);

  const handleGenerateCode = async () => {
    await generateCode();
  };

  const handleCopyCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (referralCode) {
      const link = createReferralLink(appUrl, referralCode);
      navigator.clipboard.writeText(link);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    }
  };

  const handleClaimRewards = async () => {
    await claimRewards();
  };

  const handleShare = (method: 'twitter' | 'whatsapp') => {
    if (!referralCode) return;

    let shareUrl = '';
    if (method === 'twitter') {
      shareUrl = generateTwitterShareLink(referralCode);
    } else if (method === 'whatsapp') {
      shareUrl = generateWhatsAppShareLink(referralCode);
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const commissionTier = stats ? calculateCommissionTiers(stats.activeReferrals) : 5;
  const estimatedMonthly = stats ? estimateMonthlyRewards(stats.pendingRewards, 1000000) : 0;

  if (!userAddress) {
    return (
      <div className="referral-dashboard referral-dashboard--disconnected">
        <div className="referral-dashboard__empty-state">
          <p>Please connect your wallet to view referral information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="referral-dashboard">
      <div className="referral-dashboard__container">
        {/* Header */}
        <div className="referral-dashboard__header">
          <h2>Referral & Affiliate Program</h2>
          <p>Earn rewards by inviting friends to join 0xCast</p>
        </div>

        {error && (
          <div className="referral-dashboard__error">
            <p>{error}</p>
          </div>
        )}

        {/* Referral Code Section */}
        <div className="referral-dashboard__section referral-dashboard__code-section">
          <h3>Your Referral Code</h3>
          
          {!referralCode ? (
            <div className="referral-dashboard__code-empty">
              <p>You don't have a referral code yet</p>
              <button
                className="referral-dashboard__btn referral-dashboard__btn--primary"
                onClick={handleGenerateCode}
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Code'}
              </button>
            </div>
          ) : (
            <div className="referral-dashboard__code-display">
              <div className="referral-dashboard__code-box">
                <span className="referral-dashboard__code-text">{referralCode}</span>
                <button
                  className="referral-dashboard__btn referral-dashboard__btn--secondary"
                  onClick={handleCopyCode}
                >
                  {copiedToClipboard ? '✓ Copied' : 'Copy Code'}
                </button>
              </div>

              <div className="referral-dashboard__link-box">
                <input
                  type="text"
                  className="referral-dashboard__link-input"
                  value={createReferralLink(appUrl, referralCode)}
                  readOnly
                />
                <button
                  className="referral-dashboard__btn referral-dashboard__btn--secondary"
                  onClick={handleCopyLink}
                >
                  {copiedToClipboard ? '✓ Copied' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Share Section */}
        {referralCode && (
          <div className="referral-dashboard__section referral-dashboard__share-section">
            <h3>Share Your Code</h3>
            <div className="referral-dashboard__share-buttons">
              <button
                className="referral-dashboard__btn referral-dashboard__share-btn referral-dashboard__share-btn--twitter"
                onClick={() => handleShare('twitter')}
              >
                Share on Twitter/X
              </button>
              <button
                className="referral-dashboard__btn referral-dashboard__share-btn referral-dashboard__share-btn--whatsapp"
                onClick={() => handleShare('whatsapp')}
              >
                Share on WhatsApp
              </button>
              <button
                className="referral-dashboard__btn referral-dashboard__share-btn referral-dashboard__share-btn--copy"
                onClick={() => {
                  navigator.clipboard.writeText(generateShareMessage(referralCode));
                  setCopiedToClipboard(true);
                  setTimeout(() => setCopiedToClipboard(false), 2000);
                }}
              >
                Copy Message
              </button>
            </div>
          </div>
        )}

        {/* Stats Section */}
        {stats && (
          <div className="referral-dashboard__section referral-dashboard__stats-section">
            <h3>Your Affiliate Stats</h3>
            <div className="referral-dashboard__stats-grid">
              <div className="referral-dashboard__stat">
                <div className="referral-dashboard__stat-value">{stats.activeReferrals}</div>
                <div className="referral-dashboard__stat-label">Active Referrals</div>
              </div>

              <div className="referral-dashboard__stat">
                <div className="referral-dashboard__stat-value">{stats.totalReferred}</div>
                <div className="referral-dashboard__stat-label">Total Referrals</div>
              </div>

              <div className="referral-dashboard__stat">
                <div className="referral-dashboard__stat-value">{commissionTier}%</div>
                <div className="referral-dashboard__stat-label">Commission Rate</div>
              </div>

              <div className="referral-dashboard__stat">
                <div className="referral-dashboard__stat-value">
                  {formatRewardAmount(stats.totalEarned)} OXC
                </div>
                <div className="referral-dashboard__stat-label">Total Earned</div>
              </div>

              <div className="referral-dashboard__stat">
                <div className="referral-dashboard__stat-value">
                  {formatRewardAmount(stats.pendingRewards)} OXC
                </div>
                <div className="referral-dashboard__stat-label">Pending Rewards</div>
              </div>

              <div className="referral-dashboard__stat">
                <div className="referral-dashboard__stat-value">
                  {formatRewardAmount(stats.totalClaimed)} OXC
                </div>
                <div className="referral-dashboard__stat-label">Total Claimed</div>
              </div>
            </div>
          </div>
        )}

        {/* Rewards Section */}
        {stats && stats.pendingRewards > 0 && (
          <div className="referral-dashboard__section referral-dashboard__rewards-section">
            <h3>Pending Rewards</h3>
            <div className="referral-dashboard__reward-info">
              <p className="referral-dashboard__reward-amount">
                {formatRewardAmount(stats.pendingRewards)} OXC
              </p>
              <p className="referral-dashboard__estimated-monthly">
                Est. monthly: {formatRewardAmount(estimatedMonthly)} OXC
              </p>
              <button
                className="referral-dashboard__btn referral-dashboard__btn--claim"
                onClick={handleClaimRewards}
                disabled={isLoading}
              >
                {isLoading ? 'Claiming...' : 'Claim Rewards'}
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="referral-dashboard__section referral-dashboard__info-section">
          <h3>How It Works</h3>
          <div className="referral-dashboard__info-list">
            <div className="referral-dashboard__info-item">
              <span className="referral-dashboard__info-number">1</span>
              <div>
                <strong>Generate Your Code</strong>
                <p>Create a unique referral code to share with friends</p>
              </div>
            </div>

            <div className="referral-dashboard__info-item">
              <span className="referral-dashboard__info-number">2</span>
              <div>
                <strong>Share & Invite</strong>
                <p>Send your code to friends via social media or direct message</p>
              </div>
            </div>

            <div className="referral-dashboard__info-item">
              <span className="referral-dashboard__info-number">3</span>
              <div>
                <strong>Track Referrals</strong>
                <p>Monitor active referrals and see stats in real-time</p>
              </div>
            </div>

            <div className="referral-dashboard__info-item">
              <span className="referral-dashboard__info-number">4</span>
              <div>
                <strong>Earn Rewards</strong>
                <p>Get 5% commission on referred user activity automatically</p>
              </div>
            </div>

            <div className="referral-dashboard__info-item">
              <span className="referral-dashboard__info-number">5</span>
              <div>
                <strong>Claim Payouts</strong>
                <p>Claim accumulated rewards to your wallet anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Info */}
        <div className="referral-dashboard__section referral-dashboard__tier-section">
          <h3>Earn More With Tiers</h3>
          <div className="referral-dashboard__tier-info">
            <p>Unlock higher commission rates as you refer more users:</p>
            <ul className="referral-dashboard__tier-list">
              <li>5+ referrals: 5% commission</li>
              <li>10+ referrals: 6% commission</li>
              <li>25+ referrals: 7% commission</li>
              <li>50+ referrals: 8% commission</li>
              <li>100+ referrals: 10% commission</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
