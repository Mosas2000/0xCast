import { TransactionStatus as TxStatus } from '../types/transaction';
import { LoadingSpinner } from './LoadingSpinner';

interface TransactionStatusProps {
    txId: string;
    status: TxStatus;
    confirmations?: number;
    className?: string;
}

export function TransactionStatus({ txId, status, confirmations = 0, className = '' }: TransactionStatusProps) {
    const explorerUrl = `https://explorer.hiro.so/txid/${txId}?chain=mainnet`;

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
                <p className={`text-sm font-medium ${status === TxStatus.SUCCESS ? 'text-green-400' :
                        status === TxStatus.FAILED ? 'text-red-400' :
                            'text-slate-400'
                    }`}>
                    {status === TxStatus.PENDING && 'Transaction Pending...'}
                    {status === TxStatus.SUCCESS && `Confirmed (${confirmations} blocks)`}
                    {status === TxStatus.FAILED && 'Transaction Failed'}
                </p>

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
