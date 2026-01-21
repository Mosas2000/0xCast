import { useEffect } from 'react';
import { TransactionStatus as TxStatus } from '../types/transaction';
import { useTransaction } from '../hooks/useTransaction';

interface TransactionToastProps {
    txId: string;
    message: string;
    onClose: () => void;
    className?: string;
}

export function TransactionToast({ txId, message, onClose, className = '' }: TransactionToastProps) {
    const { status, confirmations } = useTransaction(txId);
    const explorerUrl = `https://explorer.hiro.so/txid/${txId}?chain=mainnet`;

    // Auto-close on success after 5 seconds
    useEffect(() => {
        if (status === TxStatus.SUCCESS) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [status, onClose]);

    return (
        <div className={`bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-4 min-w-[320px] ${className}`.trim()}>
            <div className="flex items-start space-x-3">
                {/* Status Icon */}
                {status === TxStatus.PENDING && (
                    <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {status === TxStatus.SUCCESS && (
                    <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
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
                        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white mb-1">{message}</p>
                    <p className={`text-xs ${status === TxStatus.SUCCESS ? 'text-green-400' :
                            status === TxStatus.FAILED ? 'text-red-400' :
                                'text-slate-400'
                        }`}>
                        {status === TxStatus.PENDING && 'Confirming...'}
                        {status === TxStatus.SUCCESS && `Confirmed (${confirmations} blocks)`}
                        {status === TxStatus.FAILED && 'Failed'}
                    </p>

                    <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-400 hover:text-primary-300 transition-colors inline-block mt-1"
                    >
                        View on Explorer →
                    </a>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
