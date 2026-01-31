import React from 'react';
import { Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { ExplorerLink } from '../common/ExplorerLink';

type ModalState = 'idle' | 'loading' | 'success' | 'error';

interface TransactionModalProps {
    state: ModalState;
    txId?: string;
    message?: string;
    onClose: () => void;
}

/**
 * Enhanced modal for displaying transaction progress and results with interactive feedback.
 */
export const TransactionModal: React.FC<TransactionModalProps> = ({
    state,
    txId,
    message,
    onClose
}) => {
    if (state === 'idle') return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
            <div className="glass-morphism rounded-3xl p-8 max-w-sm w-full border border-white/10 shadow-2xl animate-float">
                <div className="flex flex-col items-center text-center space-y-6">
                    {state === 'loading' && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center">
                                <Loader2 size={32} className="text-primary-500 animate-spin" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Broadcasting...</h3>
                            <p className="text-slate-400 text-sm">Please wait while your transaction is confirmed on-chain.</p>
                        </>
                    )}

                    {state === 'success' && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircle2 size={32} className="text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Transaction Success!</h3>
                            <p className="text-slate-400 text-sm">{message || 'Your trade was successfully placed.'}</p>
                        </>
                    )}

                    {state === 'error' && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
                                <XCircle size={32} className="text-rose-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Transaction Failed</h3>
                            <p className="text-slate-400 text-sm">{message || 'Something went wrong. Please try again.'}</p>
                        </>
                    )}

                    {txId && (
                        <div className="pt-4 border-t border-white/5 w-full">
                            <ExplorerLink txId={txId} label="View on Stacks Explorer" />
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                    >
                        {state === 'loading' ? 'Close Window' : 'Finish'}
                    </button>
                </div>
            </div>
        </div>
    );
};
