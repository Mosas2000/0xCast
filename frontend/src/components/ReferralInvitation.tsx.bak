import React, { useReducer } from 'react';

interface ReferralInvitationProps {
  referralCode?: string;
  onInvitationSent?: (method: string) => void;
}

interface InvitationState {
  invitationEmail: string;
  isSubmitting: boolean;
  successMessage: string;
  errorMessage: string;
}

type InvitationAction =
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_SUCCESS'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET_EMAIL' }
  | { type: 'CLEAR_MESSAGES' };

const initialState: InvitationState = {
  invitationEmail: '',
  isSubmitting: false,
  successMessage: '',
  errorMessage: '',
};

function invitationReducer(state: InvitationState, action: InvitationAction): InvitationState {
  switch (action.type) {
    case 'SET_EMAIL':
      return { ...state, invitationEmail: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'SET_SUCCESS':
      return { ...state, successMessage: action.payload, errorMessage: '' };
    case 'SET_ERROR':
      return { ...state, errorMessage: action.payload, successMessage: '' };
    case 'RESET_EMAIL':
      return { ...state, invitationEmail: '' };
    case 'CLEAR_MESSAGES':
      return { ...state, successMessage: '', errorMessage: '' };
    default:
      return state;
  }
}

export const ReferralInvitation: React.FC<ReferralInvitationProps> = ({
  referralCode = '',
  onInvitationSent,
}) => {
  const [state, dispatch] = useReducer(invitationReducer, initialState);

  const handleEmailInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'CLEAR_MESSAGES' });
    dispatch({ type: 'SET_SUBMITTING', payload: true });

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(state.invitationEmail)) {
        throw new Error('Invalid email address');
      }

      console.log(`Sending referral invitation to ${state.invitationEmail}`);

      dispatch({ type: 'SET_SUCCESS', payload: `Invitation sent to ${state.invitationEmail}` });
      dispatch({ type: 'RESET_EMAIL' });

      if (onInvitationSent) {
        onInvitationSent('email');
      }
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to send invitation' 
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  const handleCopyMessage = () => {
    const message = `Join me on 0xCast! Use my referral code: ${referralCode}`;
    navigator.clipboard.writeText(message);
    dispatch({ type: 'SET_SUCCESS', payload: 'Message copied to clipboard' });
    setTimeout(() => dispatch({ type: 'CLEAR_MESSAGES' }), 3000);
  };

  return (
    <div className="referral-invitation">
      <div className="referral-invitation__container">
        <h3 className="referral-invitation__title">Invite Friends</h3>
        <p className="referral-invitation__subtitle">
          Share your referral code and earn rewards when they join
        </p>

        {state.successMessage && (
          <div className="referral-invitation__message referral-invitation__message--success">
            {state.successMessage}
          </div>
        )}

        {state.errorMessage && (
          <div className="referral-invitation__message referral-invitation__message--error">
            {state.errorMessage}
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
                value={state.invitationEmail}
                onChange={(e) => dispatch({ type: 'SET_EMAIL', payload: e.target.value })}
                disabled={state.isSubmitting}
              />
              <button
                type="submit"
                className="referral-invitation__btn referral-invitation__btn--primary"
                disabled={state.isSubmitting || !state.invitationEmail}
              >
                {state.isSubmitting ? 'Sending...' : 'Send Invitation'}
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
