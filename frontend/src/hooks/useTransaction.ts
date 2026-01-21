import { useState, useEffect, useCallback } from 'react';
import { TransactionStatus } from '../types/transaction';

interface UseTransactionResult {
    status: TransactionStatus;
    confirmations: number;
    error: string | null;
    refetch: () => void;
}

/**
 * Hook for tracking transaction status on Stacks blockchain
 * @param txId - Transaction ID to track
 * @returns Transaction status, confirmations, error, and refetch function
 */
export function useTransaction(txId: string | null): UseTransactionResult {
    const [status, setStatus] = useState<TransactionStatus>(TransactionStatus.PENDING);
    const [confirmations, setConfirmations] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactionStatus = useCallback(async () => {
        if (!txId) {
            setStatus(TransactionStatus.PENDING);
            return;
        }

        try {
            const response = await fetch(`https://api.mainnet.hiro.so/extended/v1/tx/${txId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    // Transaction not yet in mempool
                    setStatus(TransactionStatus.PENDING);
                    return;
                }
                throw new Error('Failed to fetch transaction status');
            }

            const data = await response.json();

            // Check transaction status
            if (data.tx_status === 'success') {
                setStatus(TransactionStatus.SUCCESS);
                setConfirmations(data.confirmations || 0);
                setError(null);
            } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
                setStatus(TransactionStatus.FAILED);
                setError(data.tx_result?.repr || 'Transaction failed');
            } else {
                // pending or other status
                setStatus(TransactionStatus.PENDING);
                setConfirmations(0);
            }
        } catch (err) {
            console.error('Error fetching transaction status:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch transaction');
        }
    }, [txId]);

    useEffect(() => {
        if (!txId) return;

        // Initial fetch
        fetchTransactionStatus();

        // Poll every 10 seconds while pending
        const interval = setInterval(() => {
            if (status === TransactionStatus.PENDING) {
                fetchTransactionStatus();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [txId, status, fetchTransactionStatus]);

    return {
        status,
        confirmations,
        error,
        refetch: fetchTransactionStatus,
    };
}
