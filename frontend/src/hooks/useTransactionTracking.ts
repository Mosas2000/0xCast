/**
 * Transaction Tracking Hook
 * 
 * Provides transaction status tracking and history management.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type Transaction,
  TransactionStatus,
  getTransactionHistory,
  saveTransaction,
  updateTransactionStatus,
  getPendingTransactions,
  clearTransactionHistory,
} from '../utils/transactions';

// Polling interval for checking pending transactions (15 seconds)
const POLL_INTERVAL = 15000;

// Stacks API URL for mainnet
const STACKS_API_URL = 'https://api.hiro.so';

interface UseTransactionTrackingReturn {
  transactions: Transaction[];
  pendingCount: number;
  addTransaction: (tx: Omit<Transaction, 'timestamp' | 'status'>) => void;
  checkTransaction: (txId: string) => Promise<TransactionStatus>;
  clearHistory: () => void;
  isChecking: boolean;
}

/**
 * Fetch transaction status from Stacks API
 */
async function fetchTransactionStatus(txId: string): Promise<{
  status: TransactionStatus;
  blockHeight?: number;
  error?: string;
}> {
  try {
    const response = await fetch(`${STACKS_API_URL}/extended/v1/tx/${txId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return { status: TransactionStatus.PENDING };
      }
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.tx_status === 'success') {
      return {
        status: TransactionStatus.SUCCESS,
        blockHeight: data.block_height,
      };
    } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
      return {
        status: TransactionStatus.FAILED,
        error: data.tx_result?.repr || 'Transaction failed',
      };
    } else if (data.tx_status === 'dropped_replace_by_fee' || data.tx_status === 'dropped_replace_across_fork') {
      return {
        status: TransactionStatus.DROPPED,
        error: 'Transaction was dropped from mempool',
      };
    }
    
    return { status: TransactionStatus.PENDING };
  } catch (error) {
    console.error('Error fetching transaction status:', error);
    return { status: TransactionStatus.PENDING };
  }
}

export function useTransactionTracking(): UseTransactionTrackingReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const isMountedRef = useRef(true);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load transaction history on mount
  useEffect(() => {
    setTransactions(getTransactionHistory());
    
    return () => {
      isMountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Check pending transactions periodically
  useEffect(() => {
    const checkPendingTransactions = async () => {
      if (!isMountedRef.current) return;
      
      const pending = getPendingTransactions();
      if (pending.length === 0) return;
      
      setIsChecking(true);
      
      for (const tx of pending) {
        if (!isMountedRef.current) break;
        
        const result = await fetchTransactionStatus(tx.txId);
        
        if (result.status !== TransactionStatus.PENDING) {
          updateTransactionStatus(tx.txId, result.status, result.blockHeight, result.error);
        }
      }
      
      if (isMountedRef.current) {
        setTransactions(getTransactionHistory());
        setIsChecking(false);
      }
    };

    // Initial check
    checkPendingTransactions();
    
    // Set up polling
    pollIntervalRef.current = setInterval(checkPendingTransactions, POLL_INTERVAL);
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, 'timestamp' | 'status'>) => {
    const newTx: Transaction = {
      ...tx,
      timestamp: Date.now(),
      status: TransactionStatus.PENDING,
    };
    
    saveTransaction(newTx);
    setTransactions(getTransactionHistory());
  }, []);

  const checkTransaction = useCallback(async (txId: string): Promise<TransactionStatus> => {
    const result = await fetchTransactionStatus(txId);
    
    if (result.status !== TransactionStatus.PENDING) {
      updateTransactionStatus(txId, result.status, result.blockHeight, result.error);
      setTransactions(getTransactionHistory());
    }
    
    return result.status;
  }, []);

  const clearHistory = useCallback(() => {
    clearTransactionHistory();
    setTransactions([]);
  }, []);

  const pendingCount = transactions.filter(tx => tx.status === TransactionStatus.PENDING).length;

  return {
    transactions,
    pendingCount,
    addTransaction,
    checkTransaction,
    clearHistory,
    isChecking,
  };
}
