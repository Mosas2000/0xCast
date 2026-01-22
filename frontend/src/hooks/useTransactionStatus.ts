import { useState, useEffect, useCallback } from 'react';
import { STACKS_API_URL } from '../constants/contract';

export enum TxStatus {
    BROADCASTING = 'broadcasting',
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
}

interface TxApiResponse {
    tx_status: 'success' | 'pending' | 'abort_by_response' | 'abort_by_post_condition';
    block_height?: number;
    tx_result?: {
        repr: string;
    };
}

interface UseTransactionStatusOptions {
    txId: string | null;
    onSuccess?: (blockHeight?: number) => void;
    onError?: (error: string) => void;
    enabled?: boolean;
}

interface UseTransactionStatusResult {
    status: TxStatus;
    confirmations: number;
    blockHeight?: number;
    error: string | null;
    isLoading: boolean;
}

/**
 * Hook to poll transaction status after broadcast
 * Checks confirmation count and detects success/failure
 * Auto-updates related data on success
 */
export function useTransactionStatus({
    txId,
    onSuccess,
    onError,
    enabled = true,
}: UseTransactionStatusOptions): UseTransactionStatusResult {
    const [status, setStatus] = useState<TxStatus>(TxStatus.BROADCASTING);
    const [confirmations, setConfirmations] = useState(0);
    const [blockHeight, setBlockHeight] = useState<number | undefined>();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const checkStatus = useCallback(async () => {
        if (!txId || !enabled) return;

        setIsLoading(true);

        try {
            const response = await fetch(`${STACKS_API_URL}/extended/v1/tx/${txId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    // Transaction not yet in mempool
                    setStatus(TxStatus.BROADCASTING);
                    return;
                }
                throw new Error('Failed to fetch transaction status');
            }

            const data: TxApiResponse = await response.json();

            if (data.tx_status === 'success') {
                setStatus(TxStatus.SUCCESS);
                setBlockHeight(data.block_height);
                setConfirmations(1); // Simplified - in reality would check current block vs tx block
                setError(null);
                onSuccess?.(data.block_height);
            } else if (data.tx_status === 'pending') {
                setStatus(TxStatus.PENDING);
                setConfirmations(0);
                setError(null);
            } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
                const errorMsg = data.tx_result?.repr || 'Transaction failed';
                setStatus(TxStatus.FAILED);
                setError(errorMsg);
                onError?.(errorMsg);
            }
        } catch (err) {
            console.error('Error checking transaction status:', err);
            const errorMsg = err instanceof Error ? err.message : 'Failed to check status';
            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [txId, enabled, onSuccess, onError]);

    useEffect(() => {
        if (!txId || !enabled) {
            return;
        }

        // Initial check
        checkStatus();

        // Poll every 5 seconds until confirmed or failed
        if (status === TxStatus.BROADCASTING || status === TxStatus.PENDING) {
            const interval = setInterval(checkStatus, 5000);

            // Stop polling after 10 minutes
            const timeout = setTimeout(() => {
                clearInterval(interval);
                if (status !== TxStatus.SUCCESS && status !== TxStatus.FAILED) {
                    setStatus(TxStatus.FAILED);
                    setError('Transaction timeout');
                    onError?.('Transaction timeout');
                }
            }, 600000); // 10 minutes

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        }
    }, [txId, enabled, status, checkStatus, onError]);

    return {
        status,
        confirmations,
        blockHeight,
        error,
        isLoading,
    };
}
