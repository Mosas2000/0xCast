/**
 * CreateMarketPage Component
 * 
 * Page for creating new prediction markets.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../components/WalletProvider';
import { useMarketCreation } from '../hooks/useMarketCreation';
import { MarketForm } from '../components/MarketForm';
import type { CreateMarketFormData } from '../types/market';

export function CreateMarketPage() {
  const navigate = useNavigate();
  const { isConnected, connect } = useWallet();
  const { createMarket, state, resetState } = useMarketCreation();
  
  const [redirecting, setRedirecting] = useState(false);

  // Auto-redirect on success
  useEffect(() => {
    if (state.success && !redirecting) {
      setRedirecting(true);
      const timer = setTimeout(() => {
        navigate('/markets');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [state.success, navigate, redirecting]);

  // Reset state on unmount
  useEffect(() => {
    return () => resetState();
  }, [resetState]);

  const handleSubmit = async (data: CreateMarketFormData) => {
    await createMarket(data);
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#000000',
    paddingTop: '120px',
    paddingBottom: '80px',
  };

  const wrapperStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 24px',
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '48px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '48px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '18px',
    color: '#9CA3AF',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#0A0A0A',
    border: '1px solid #1F1F1F',
    borderRadius: '20px',
    padding: '32px',
  };

  const connectCardStyle: React.CSSProperties = {
    backgroundColor: '#0A0A0A',
    border: '1px solid #1F1F1F',
    borderRadius: '20px',
    padding: '48px 32px',
    textAlign: 'center',
  };

  const connectButtonStyle: React.CSSProperties = {
    padding: '14px 32px',
    backgroundColor: '#3B82F6',
    border: 'none',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const successCardStyle: React.CSSProperties = {
    backgroundColor: '#22C55E20',
    border: '2px solid #22C55E',
    borderRadius: '20px',
    padding: '48px 32px',
    textAlign: 'center',
  };

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>
            <span>✨</span> Create New Market
          </h1>
          <p style={subtitleStyle}>
            Launch your own prediction market and let the community trade on future outcomes.
          </p>
        </div>

        {/* Success State */}
        {state.success ? (
          <div style={successCardStyle}>
            <div style={{ 
              fontSize: '64px', 
              marginBottom: '24px',
              animation: 'bounce 0.5s ease-in-out',
            }}>✅</div>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: '#22C55E', 
              marginBottom: '12px' 
            }}>
              Market Created Successfully!
            </h2>
            <p style={{ fontSize: '16px', color: '#86EFAC', marginBottom: '24px' }}>
              Your prediction market has been created and is now live.
            </p>
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '10px',
              marginBottom: '24px',
            }}>
              <div style={{ fontSize: '13px', color: '#D1FAE5', marginBottom: '12px' }}>
                Share your market:
              </div>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/markets`;
                    navigator.clipboard.writeText(url);
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  📋 Copy Link
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=Check out my new prediction market on 0xCast!&url=${window.location.origin}/markets`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  🐦 Share on X
                </a>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>
              Redirecting to markets page...
            </p>
            <style>{`
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
              }
            `}</style>
          </div>
        ) : !isConnected ? (
          /* Not Connected State */
          <div style={connectCardStyle}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔗</div>
            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#FFFFFF', 
              marginBottom: '12px' 
            }}>
              Connect Your Wallet
            </h3>
            <p style={{ color: '#9CA3AF', marginBottom: '28px', lineHeight: '1.6' }}>
              Connect your Stacks wallet to create a new prediction market.
            </p>
            <button style={connectButtonStyle} onClick={() => connect()}>
              Connect Wallet
            </button>
          </div>
        ) : (
          /* Create Form */
          <div style={cardStyle}>
            <MarketForm 
              onSubmit={handleSubmit}
              isSubmitting={state.isCreating}
              error={state.error}
            />
          </div>
        )}

        {/* Info Sections */}
        {isConnected && !state.success && (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#FFFFFF', 
              marginBottom: '24px',
              textAlign: 'center',
            }}>
              Creating a Great Market
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
            }}>
              <div style={{
                padding: '24px',
                backgroundColor: '#0A0A0A',
                border: '1px solid #1F1F1F',
                borderRadius: '16px',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#FFFFFF', 
                  marginBottom: '8px' 
                }}>
                  Be Specific
                </h3>
                <p style={{ fontSize: '14px', color: '#9CA3AF', lineHeight: '1.5' }}>
                  Clear, unambiguous questions get more participation. Include specific dates and criteria.
                </p>
              </div>

              <div style={{
                padding: '24px',
                backgroundColor: '#0A0A0A',
                border: '1px solid #1F1F1F',
                borderRadius: '16px',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#FFFFFF', 
                  marginBottom: '8px' 
                }}>
                  Choose Duration Wisely
                </h3>
                <p style={{ fontSize: '14px', color: '#9CA3AF', lineHeight: '1.5' }}>
                  Longer markets attract more traders, but shorter ones resolve faster. Balance is key.
                </p>
              </div>

              <div style={{
                padding: '24px',
                backgroundColor: '#0A0A0A',
                border: '1px solid #1F1F1F',
                borderRadius: '16px',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#FFFFFF', 
                  marginBottom: '8px' 
                }}>
                  Verifiable Outcomes
                </h3>
                <p style={{ fontSize: '14px', color: '#9CA3AF', lineHeight: '1.5' }}>
                  Ensure the outcome can be objectively verified from public sources when it resolves.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
