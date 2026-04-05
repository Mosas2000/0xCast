/**
 * Transaction Context
 * 
 * Provides global transaction tracking state throughout the app.
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useTransactionTracking } from '../hooks/useTransactionTracking';
import { TransactionToast } from './TransactionToast';
import {
  type Transaction,
  TransactionStatus,
} from '../utils/transactions';

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
  }, [tracking]);

  // Update toast when transaction status changes
  useEffect(() => {
    if (lastTxId && tracking.transactions.length > 0) {
      const updatedTx = tracking.transactions.find(tx => tx.txId === lastTxId);
      if (updatedTx && updatedTx.status !== TransactionStatus.PENDING) {
        setActiveToast(updatedTx);
      }
    }
  }, [tracking.transactions, lastTxId]);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

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
      {activeToast && (
        <TransactionToast
          transaction={activeToast}
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
