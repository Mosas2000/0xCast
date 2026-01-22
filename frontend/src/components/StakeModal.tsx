import { useState } from 'react';
import { Market } from '../types/market';
import { Modal } from './Modal';
import { StakeForm } from './StakeForm';
import { useTransactionStatus, TxStatus } from '../hooks/useTransactionStatus';

interface StakeModalProps {
    market: Market | null;
    isOpen: boolean;
    onClose: () => void;
    onRefresh?: () => void;
}

export function StakeModal({ market, isOpen, onClose, onRefresh }: StakeModalProps) {
    const [txId, setTxId] = useState<string | null>(null);

    const { status, confirmations } = useTransactionStatus({
        txId,
        onSuccess: () => {
            // Refresh market data on success
            onRefresh?.();
            // Auto-close after 2 seconds
            setTimeout(() => {
                onClose();
                setTxId(null);
            }, 2000);
        },
        enabled: !!txId,
    });

    if (!market) return null;

    const handleSuccess = () => {
        // Keep modal open to show transaction progress
        // Will auto-close via useTransactionStatus callback
    };

    const explorerUrl = txId ? `https://explorer.stacks.co/txid/${txId}?chain=mainnet` : null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Stake on Market"
        >
            <div className="mb-4">
                <h3 className="text-lg font-medium text-white mb-2">Market Question</h3>
                <p className="text-slate-300">{market.question}</p>
            </div>

            {/* Transaction Progress */}
            {txId && (
                <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">Transaction Progress</span>
                        <span className="text-xs text-slate-400">
                            {confirmations}/1 confirmations
                        </span>
                    </div>

                    <div className="mb-3">
                        {status === TxStatus.BROADCASTING && (
                            <div className="flex items-center gap-2 text-blue-400">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent" />
                                <span className="text-sm">Broadcasting...</span>
                            </div>
                        )}
                        {status === TxStatus.PENDING && (
                            <div className="flex items-center gap-2 text-yellow-400">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent" />
                                <span className="text-sm">Pending confirmation...</span>
                            </div>
                        )}
                        {status === TxStatus.SUCCESS && (
                            <div className="flex items-center gap-2 text-green-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">Confirmed!</span>
                            </div>
                        )}
                        {status === TxStatus.FAILED && (
                            <div className="flex items-center gap-2 text-red-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">Failed</span>
                            </div>
                        )}
                    </div>

                    {/* Explorer Link */}
                    {explorerUrl && (
                        <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-400 hover:text-primary-300 hover:underline"
                        >
                            View in Explorer →
                        </a>
                    )}
                </div>
            )}

            <div className="border-t border-slate-700 pt-6">
                <StakeForm
                    market={market}
                    onSuccess={handleSuccess}
                    onCancel={onClose}
                    onTxSubmitted={setTxId}
                />
            </div>
        </Modal>
    );
}
