/**
 * TransactionToast Component
 * 
 * Shows a toast notification for transaction status updates.
 */
import { useEffect, useState, useCallback } from 'react';
import { useNetwork } from '@/contexts/NetworkContext';
import {
  type Transaction,
  TransactionStatus,
  formatTransactionType,
  getStatusColor,
  getStatusLabel,
  getExplorerUrl,
} from '@/utils/transactions';

interface TransactionToastProps {
  transaction: Transaction;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function TransactionToast({ 
  transaction, 
  onDismiss,
  autoDismissMs = 8000 
}: TransactionToastProps) {
  // Get current network to ensure explorer links point to correct chain
  const { network } = useNetwork();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  }, [onDismiss]);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));

    // Auto-dismiss if success or failed
    if (transaction.status !== TransactionStatus.PENDING) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismissMs);
      
      return () => clearTimeout(timer);
    }
  }, [transaction.status, autoDismissMs, handleDismiss]);

  const getIcon = () => {
    switch (transaction.status) {
      case TransactionStatus.PENDING:
        return (
          <div style={spinnerStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
      case TransactionStatus.SUCCESS:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case TransactionStatus.FAILED:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: '#1A1A1A',
    border: `1px solid ${getStatusColor(transaction.status)}40`,
    borderRadius: '12px',
    padding: '16px',
    minWidth: '320px',
    maxWidth: '400px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    zIndex: 9999,
    transform: isVisible && !isExiting ? 'translateX(0)' : 'translateX(120%)',
    opacity: isVisible && !isExiting ? 1 : 0,
    transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  };

  const leftHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#FFFFFF',
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const statusStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  };

  const statusTextStyle: React.CSSProperties = {
    fontSize: '13px',
    color: getStatusColor(transaction.status),
    fontWeight: '500',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#9CA3AF',
    marginBottom: '12px',
  };

  const linkStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#3B82F6',
    textDecoration: 'none',
  };

  const spinnerStyle: React.CSSProperties = {
    animation: 'spin 1s linear infinite',
    color: '#F59E0B',
  };

  return (
    <>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={leftHeaderStyle}>
            {getIcon()}
            <span style={titleStyle}>{formatTransactionType(transaction.type)}</span>
          </div>
          <button style={closeButtonStyle} onClick={handleDismiss} aria-label="Dismiss">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div style={statusStyle}>
          <span style={statusTextStyle}>{getStatusLabel(transaction.status)}</span>
        </div>
        
        {transaction.description && (
          <div style={descriptionStyle}>{transaction.description}</div>
        )}
        
        <a 
          href={getExplorerUrl(transaction.txId, network)} 
          target="_blank" 
          rel="noopener noreferrer"
          style={linkStyle}
        >
          View on Explorer
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
