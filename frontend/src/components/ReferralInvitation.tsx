import React, { useState } from 'react';

interface ReferralInvitationProps {
  referralCode?: string;
  onInvitationSent?: (method: string) => void;
}

export const ReferralInvitation: React.FC<ReferralInvitationProps> = ({
  referralCode = '',
  onInvitationSent,
}) => {
  const [invitationEmail, setInvitationEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(invitationEmail)) {
        throw new Error('Invalid email address');
      }

      console.log(`Sending referral invitation to ${invitationEmail}`);

      setSuccessMessage(`Invitation sent to ${invitationEmail}`);
      setInvitationEmail('');

      if (onInvitationSent) {
        onInvitationSent('email');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyMessage = () => {
    const message = `Join me on 0xCast! Use my referral code: ${referralCode}`;
    navigator.clipboard.writeText(message);
    setSuccessMessage('Message copied to clipboard');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="referral-invitation">
      <div className="referral-invitation__container">
        <h3 className="referral-invitation__title">Invite Friends</h3>
        <p className="referral-invitation__subtitle">
          Share your referral code and earn rewards when they join
        </p>

        {successMessage && (
          <div className="referral-invitation__message referral-invitation__message--success">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="referral-invitation__message referral-invitation__message--error">
            {errorMessage}
          </div>
        )}

        <div className="referral-invitation__section">
          <h4 className="referral-invitation__section-title">Send Email Invitation</h4>
          <form className="referral-invitation__form" onSubmit={handleEmailInvitation}>
            <div className="referral-invitation__input-group">
              <input
                type="email"
                className="referral-invitation__input"
                placeholder="friend@example.com"
                value={invitationEmail}
                onChange={(e) => setInvitationEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="submit"
                className="referral-invitation__btn referral-invitation__btn--primary"
                disabled={isSubmitting || !invitationEmail}
              >
                {isSubmitting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </form>
        </div>

        {referralCode && (
          <div className="referral-invitation__section">
            <h4 className="referral-invitation__section-title">Direct Message</h4>
            <div className="referral-invitation__code-message">
              <p className="referral-invitation__message-text">
                Join me on 0xCast! Use my referral code: <strong>{referralCode}</strong>
              </p>
              <button
                className="referral-invitation__btn referral-invitation__btn--secondary"
                onClick={handleCopyMessage}
              >
                Copy Message
              </button>
            </div>
          </div>
        )}

        <div className="referral-invitation__benefits">
          <h4 className="referral-invitation__benefits-title">Benefits:</h4>
          <ul className="referral-invitation__benefits-list">
            <li>Earn 5% commission on friend's activity</li>
            <li>Lifetime rewards from referred users</li>
            <li>Unlock higher commission tiers</li>
            <li>Instant payouts to your wallet</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReferralInvitation;
