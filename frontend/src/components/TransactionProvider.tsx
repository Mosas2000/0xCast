/* eslint-disable react-refresh/only-export-components */
/**
 * Transaction Context
 * 
 * Provides global transaction tracking state throughout the app.
 */
import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { useTransactionTracking } from '@/hooks/useTransactionTracking';
import { TransactionToast } from './TransactionToast';
import {
  type Transaction,
  TransactionStatus,
} from '@/utils/transactions';

interface TransactionContextValue {
  transactions: Transaction[];
  pendingCount: number;
  addTransaction: (tx: Omit<Transaction, 'timestamp' | 'status'>) => void;
  clearHistory: () => void;
  isChecking: boolean;
}

const TransactionContext = createContext<TransactionContextValue | null>(null);

interface TransactionProviderProps {
  children: ReactNode;
}

export function TransactionProvider({ children }: TransactionProviderProps) {
  const tracking = useTransactionTracking();
  const [activeToast, setActiveToast] = useState<Transaction | null>(null);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [dismissedTxId, setDismissedTxId] = useState<string | null>(null);

  // Show toast for new transactions
  const handleAddTransaction = useCallback((tx: Omit<Transaction, 'timestamp' | 'status'>) => {
    tracking.addTransaction(tx);
    
    // Show toast for new transaction
    const newTx: Transaction = {
      ...tx,
      timestamp: Date.now(),
      status: TransactionStatus.PENDING,
    };
    setActiveToast(newTx);
    setLastTxId(tx.txId);
    setDismissedTxId(null);
  }, [tracking]);

  const derivedToast = useMemo(() => {
    if (!lastTxId || dismissedTxId === lastTxId) {
      return null;
    }

    const updatedTx = tracking.transactions.find(tx => tx.txId === lastTxId);
    return updatedTx ?? activeToast;
  }, [tracking.transactions, lastTxId, dismissedTxId, activeToast]);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
    if (lastTxId) {
      setDismissedTxId(lastTxId);
    }
  }, [lastTxId]);

  return (
    <TransactionContext.Provider
      value={{
        transactions: tracking.transactions,
        pendingCount: tracking.pendingCount,
        addTransaction: handleAddTransaction,
        clearHistory: tracking.clearHistory,
        isChecking: tracking.isChecking,
      }}
    >
      {children}
      {derivedToast && (
        <TransactionToast
          transaction={derivedToast}
          onDismiss={dismissToast}
        />
      )}
    </TransactionContext.Provider>
  );
}

export function useTransactions(): TransactionContextValue {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}
