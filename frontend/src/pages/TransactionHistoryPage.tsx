/**
 * Transaction History Page
 * 
 * Displays user's complete transaction history with filtering and status tracking.
 */
import { useTransactions } from '../components/TransactionProvider';
import { TransactionHistory } from '../components/TransactionHistory';
import { useWallet } from '../components/WalletProvider';
import {
  TransactionStatus,
  getStatusColor,
} from '../utils/transactions';

export function TransactionHistoryPage() {
  const { isConnected, connect } = useWallet();
  const { transactions, pendingCount, clearHistory, isChecking } = useTransactions();

  const successCount = transactions.filter(tx => tx.status === TransactionStatus.SUCCESS).length;
  const failedCount = transactions.filter(tx => tx.status === TransactionStatus.FAILED).length;

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
    textAlign: 'center' as const,
    marginBottom: '48px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '36px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#9CA3AF',
    maxWidth: '500px',
    margin: '0 auto',
    lineHeight: '1.6',
  };

  const statsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '32px',
  };

  const statCardStyle: React.CSSProperties = {
    backgroundColor: '#0A0A0A',
    border: '1px solid #1F1F1F',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center' as const,
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#9CA3AF',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  };

  const statValueStyle = (color: string): React.CSSProperties => ({
    fontSize: '28px',
    fontWeight: '700',
    color,
  });

  const connectBoxStyle: React.CSSProperties = {
    backgroundColor: '#0A0A0A',
    border: '1px solid #1F1F1F',
    borderRadius: '16px',
    padding: '48px',
    textAlign: 'center' as const,
  };

  const connectButtonStyle: React.CSSProperties = {
    padding: '14px 32px',
    backgroundColor: '#3B82F6',
    border: 'none',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px',
  };

  const checkingStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '16px',
    fontSize: '13px',
    color: '#F59E0B',
  };

  if (!isConnected) {
    return (
      <div style={containerStyle}>
        <div style={wrapperStyle}>
          <div style={headerStyle}>
            <h1 style={titleStyle}>
              <span>📜</span> Transaction History
            </h1>
            <p style={subtitleStyle}>
              Track all your transactions on 0xCast
            </p>
          </div>
          
          <div style={connectBoxStyle}>
            <p style={{ color: '#9CA3AF', marginBottom: '8px' }}>
              Connect your wallet to view transaction history
            </p>
            <button style={connectButtonStyle} onClick={() => connect()}>
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>
            <span>📜</span> Transaction History
          </h1>
          <p style={subtitleStyle}>
            Track all your transactions on 0xCast
          </p>
        </div>

        {isChecking && (
          <div style={checkingStyle}>
            <div style={{
              width: '14px',
              height: '14px',
              border: '2px solid #F59E0B',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            Checking pending transactions...
          </div>
        )}

        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Pending</div>
            <div style={statValueStyle(getStatusColor(TransactionStatus.PENDING))}>
              {pendingCount}
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Confirmed</div>
            <div style={statValueStyle(getStatusColor(TransactionStatus.SUCCESS))}>
              {successCount}
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Failed</div>
            <div style={statValueStyle(getStatusColor(TransactionStatus.FAILED))}>
              {failedCount}
            </div>
          </div>
        </div>

        <TransactionHistory 
          transactions={transactions}
          onClear={clearHistory}
          maxItems={50}
        />
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
