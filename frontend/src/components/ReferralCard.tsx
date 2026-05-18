import React, { useState, memo } from 'react';
import { useReferral } from '../hooks/useReferral';
import { createReferralLink, generateShareMessage } from '../utils/referralUtils';

interface ReferralCardProps {
  userAddress: string | null;
  appUrl: string;
  compact?: boolean;
}

const ReferralCardBase: React.FC<ReferralCardProps> = ({ userAddress, appUrl, compact = false }) => {
  const { referralCode, stats, isLoading, generateCode } = useReferral(userAddress);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

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

  if (!userAddress) {
    return null;
  }

  if (compact) {
    return (
      <div className="referral-card referral-card--compact">
        <div className="referral-card__content">
          <h4>Earn Referral Rewards</h4>
          {referralCode ? (
            <p className="referral-card__code">{referralCode}</p>
          ) : (
            <button
              className="referral-card__btn referral-card__btn--small"
              onClick={handleGenerateCode}
              disabled={isLoading}
            >
              Generate Code
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="referral-card">
      <div className="referral-card__header">
        <h3>Share and Earn</h3>
        <p>Invite friends and earn 5% commission</p>
      </div>

      <div className="referral-card__body">
        {!referralCode ? (
          <div className="referral-card__empty">
            <p>Get your unique referral code</p>
            <button
              className="referral-card__btn referral-card__btn--primary"
              onClick={handleGenerateCode}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Your Code'}
            </button>
          </div>
        ) : (
          <div className="referral-card__code-section">
            <div className="referral-card__code-display">
              <input
                type="text"
                className="referral-card__code-input"
                value={referralCode}
                readOnly
              />
              <button
                className="referral-card__btn referral-card__btn--secondary"
                onClick={handleCopyCode}
              >
                {copiedToClipboard ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            {stats && (
              <div className="referral-card__quick-stats">
                <div className="referral-card__stat">
                  <span className="referral-card__stat-label">Referrals</span>
                  <span className="referral-card__stat-value">{stats.activeReferrals}</span>
                </div>
                <div className="referral-card__stat">
                  <span className="referral-card__stat-label">Pending</span>
                  <span className="referral-card__stat-value">
                    {(stats.pendingRewards / 1000000).toFixed(2)} OXC
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const ReferralCard = memo(ReferralCardBase);

export default ReferralCard;
