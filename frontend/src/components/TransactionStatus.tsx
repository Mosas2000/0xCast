import { useState, useEffect } from 'react';
import { TransactionStatus as TxStatus } from '../types/transaction';
import { LoadingSpinner } from './LoadingSpinner';
import { STACKS_API_URL } from '../constants/contract';

interface TransactionStatusProps {
    txId: string;
    status?: TxStatus;
    confirmations?: number;
    className?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

interface TxApiResponse {
    tx_status: 'success' | 'pending' | 'abort_by_response' | 'abort_by_post_condition';
    block_height?: number;
    tx_result?: {
        repr: string;
    };
}

export function TransactionStatus({ 
    txId, 
    status: initialStatus, 
    confirmations = 0, 
    className = '',
    onSuccess,
    onError 
}: TransactionStatusProps) {
    const [status, setStatus] = useState<TxStatus>(initialStatus || TxStatus.PENDING);
    const [blockHeight, setBlockHeight] = useState<number | undefined>();
    const [elapsed, setElapsed] = useState(0);
    const [errorMsg, setErrorMsg] = useState<string>('');

    useEffect(() => {
        // If status is already provided and not pending, don't poll
        if (initialStatus && initialStatus !== TxStatus.PENDING) {
            return;
        }

        let pollInterval: NodeJS.Timeout;
        let elapsedInterval: NodeJS.Timeout;
        let attempts = 0;
        const MAX_ATTEMPTS = 120; // 10 minutes

        const checkTransaction = async () => {
            try {
                const response = await fetch(`${STACKS_API_URL}/extended/v1/tx/${txId}`);
                
                if (!response.ok) {
                    if (response.status === 404 && attempts < MAX_ATTEMPTS) {
                        attempts++;
                        return;
                    }
                    throw new Error(`Transaction not found`);
                }

                const data: TxApiResponse = await response.json();
                
                if (data.tx_status === 'success') {
                    setStatus(TxStatus.SUCCESS);
                    setBlockHeight(data.block_height);
                    clearInterval(pollInterval);
                    clearInterval(elapsedInterval);
                    onSuccess?.();
                } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
                    const error = data.tx_result?.repr || 'Transaction aborted';
                    setStatus(TxStatus.FAILED);
                    setErrorMsg(error);
                    clearInterval(pollInterval);
                    clearInterval(elapsedInterval);
                    onError?.(error);
                } else if (data.tx_status === 'pending') {
                    setStatus(TxStatus.PENDING);
                    attempts++;
                    
                    if (attempts >= MAX_ATTEMPTS) {
                        clearInterval(pollInterval);
                        clearInterval(elapsedInterval);
                        setStatus(TxStatus.FAILED);
                        setErrorMsg('Transaction timeout');
                    }
                }
            } catch (error) {
                attempts++;
                
                if (attempts >= MAX_ATTEMPTS) {
                    clearInterval(pollInterval);
                    clearInterval(elapsedInterval);
                    const msg = error instanceof Error ? error.message : 'Failed to check status';
                    setStatus(TxStatus.FAILED);
                    setErrorMsg(msg);
                    onError?.(msg);
                }
            }
        };

        checkTransaction();
        pollInterval = setInterval(checkTransaction, 5000);
        elapsedInterval = setInterval(() => setElapsed(prev => prev + 1), 1000);

        return () => {
            clearInterval(pollInterval);
            clearInterval(elapsedInterval);
        };
    }, [txId, initialStatus, onSuccess, onError]);

    const explorerUrl = `https://explorer.stacks.co/txid/${txId}?chain=mainnet`;

    return (
        <div className={`flex items-center space-x-3 ${className}`.trim()}>
            {/* Status Icon */}
            {status === TxStatus.PENDING && (
                <LoadingSpinner size="sm" />
            )}

            {status === TxStatus.SUCCESS && (
                <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            )}

            {status === TxStatus.FAILED && (
                <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            )}

            {/* Status Text */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${status === TxStatus.SUCCESS ? 'text-green-400' :
                            status === TxStatus.FAILED ? 'text-red-400' :
                                'text-slate-400'
                        }`}>
                        {status === TxStatus.PENDING && 'Transaction Pending...'}
                        {status === TxStatus.SUCCESS && `Confirmed${blockHeight ? ` (block #${blockHeight.toLocaleString()})` : ''}`}
                        {status === TxStatus.FAILED && 'Transaction Failed'}
                    </p>
                    {status === TxStatus.PENDING && elapsed > 0 && (
                        <span className="text-xs text-slate-500">{elapsed}s</span>
                    )}
                </div>

                {status === TxStatus.FAILED && errorMsg && (
                    <p className="text-xs text-red-400 mt-1">{errorMsg}</p>
                )}

                <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                    View on Explorer →
                </a>
            </div>
        </div>
    );
}
