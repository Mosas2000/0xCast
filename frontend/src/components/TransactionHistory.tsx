/**
 * TransactionHistory Component
 * 
 * Displays a list of user's transaction history with status indicators.
 */
import { useState } from 'react';
import {
  Transaction,
  TransactionStatus,
  formatTransactionType,
  getStatusColor,
  getStatusLabel,
  getExplorerUrl,
} from '../utils/transactions';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onClear?: () => void;
  maxItems?: number;
}

export function TransactionHistory({ 
  transactions, 
  onClear,
  maxItems = 10 
}: TransactionHistoryProps) {
  const [showAll, setShowAll] = useState(false);
  
  const displayedTransactions = showAll 
    ? transactions 
    : transactions.slice(0, maxItems);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#0A0A0A',
    border: '1px solid #1F1F1F',
    borderRadius: '16px',
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #1F1F1F',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#FFFFFF',
  };

  const clearButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #2F2F2F',
    borderRadius: '6px',
    color: '#9CA3AF',
    fontSize: '12px',
    cursor: 'pointer',
  };

  const listStyle: React.CSSProperties = {
    maxHeight: '400px',
    overflowY: 'auto',
  };

  const emptyStyle: React.CSSProperties = {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#6B7280',
    fontSize: '14px',
  };

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    borderBottom: '1px solid #1F1F1F',
    transition: 'background-color 0.2s',
  };

  const leftStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const statusDotStyle = (status: TransactionStatus): React.CSSProperties => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: getStatusColor(status),
    animation: status === TransactionStatus.PENDING ? 'pulse 2s infinite' : 'none',
  });

  const typeStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#FFFFFF',
  };

  const descStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '2px',
  };

  const rightStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  };

  const statusStyle = (status: TransactionStatus): React.CSSProperties => ({
    fontSize: '12px',
    fontWeight: '500',
    color: getStatusColor(status),
  });

  const timeStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#6B7280',
  };

  const linkStyle: React.CSSProperties = {
    color: '#3B82F6',
    textDecoration: 'none',
    fontSize: '11px',
  };

  const showMoreStyle: React.CSSProperties = {
    padding: '12px 20px',
    textAlign: 'center',
    borderTop: '1px solid #1F1F1F',
  };

  const showMoreButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#3B82F6',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '4px 8px',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Transaction History</h3>
        {onClear && transactions.length > 0 && (
          <button style={clearButtonStyle} onClick={onClear}>
            Clear All
          </button>
        )}
      </div>
      
      <div style={listStyle}>
        {transactions.length === 0 ? (
          <div style={emptyStyle}>
            No transactions yet
          </div>
        ) : (
          <>
            {displayedTransactions.map((tx) => (
              <div key={tx.txId} style={itemStyle}>
                <div style={leftStyle}>
                  <div style={statusDotStyle(tx.status)} />
                  <div>
                    <div style={typeStyle}>{formatTransactionType(tx.type)}</div>
                    <div style={descStyle}>
                      {tx.amount && `${tx.amount} • `}
                      <a 
                        href={getExplorerUrl(tx.txId)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={linkStyle}
                      >
                        View on Explorer
                      </a>
                    </div>
                  </div>
                </div>
                <div style={rightStyle}>
                  <span style={statusStyle(tx.status)}>
                    {getStatusLabel(tx.status)}
                  </span>
                  <span style={timeStyle}>
                    {formatDate(tx.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      
      {transactions.length > maxItems && (
        <div style={showMoreStyle}>
          <button 
            style={showMoreButtonStyle}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All (${transactions.length})`}
          </button>
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
