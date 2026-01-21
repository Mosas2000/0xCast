import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionType, TransactionStatus } from '../types/transaction';

const STORAGE_KEY = 'oxcast_transaction_history';
const MAX_HISTORY = 50;

/**
 * Hook to track user's transaction history in localStorage
 * @returns Transaction history and methods to manage it
 */
export function useTransactionHistory() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setTransactions(parsed);
            }
        } catch (error) {
            console.error('Error loading transaction history:', error);
        }
    }, []);

    // Save to localStorage whenever transactions change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
        } catch (error) {
            console.error('Error saving transaction history:', error);
        }
    }, [transactions]);

    const addTransaction = useCallback((transaction: Transaction) => {
        setTransactions((prev) => {
            const updated = [transaction, ...prev].slice(0, MAX_HISTORY);
            return updated;
        });
    }, []);

    const updateTransaction = useCallback((txId: string, updates: Partial<Transaction>) => {
        setTransactions((prev) =>
            prev.map((tx) => (tx.txId === txId ? { ...tx, ...updates } : tx))
        );
    }, []);

    const removeTransaction = useCallback((txId: string) => {
        setTransactions((prev) => prev.filter((tx) => tx.txId !== txId));
    }, []);

    const clearHistory = useCallback(() => {
        setTransactions([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const getRecentTransactions = useCallback((count: number = 10) => {
        return transactions.slice(0, count);
    }, [transactions]);

    const getTransactionsByType = useCallback((type: TransactionType) => {
        return transactions.filter((tx) => tx.type === type);
    }, [transactions]);

    const getTransactionsByStatus = useCallback((status: TransactionStatus) => {
        return transactions.filter((tx) => tx.status === status);
    }, [transactions]);

    return {
        transactions,
        addTransaction,
        updateTransaction,
        removeTransaction,
        clearHistory,
        getRecentTransactions,
        getTransactionsByType,
        getTransactionsByStatus,
    };
}
