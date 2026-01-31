import React from 'react';
import { ShieldCheck, ArrowRight, Info, AlertTriangle, Zap } from 'lucide-react';

interface ConfirmationRefinedProps {
    amount: number;
    outcome: 'YES' | 'NO';
    potSize: number;
    estPayout: number;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Premium confirmation dialogue for high-value stakes, ensuring clarity before on-chain execution.
 */
export const ConfirmationRefined: React.FC<ConfirmationRefinedProps> = ({
    amount,
    outcome,
    potSize,
    estPayout,
    onConfirm,
    onCancel
}) => {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl">
            <div className="glass-morphism rounded-[3rem] p-10 max-w-md w-full border border-white/10 shadow-[0_64px_256px_-64px_rgba(79,70,229,0.3)] space-y-8 animate-float">
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mx-auto border border-indigo-500/20 mb-4 animate-pulse-soft">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Review Stake</h2>
                    <p className="text-slate-500 text-xs font-medium">Verify your transaction parameters</p>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Staking</span>
                        <span className="text-xl font-black text-white">{amount} STX</span>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Outcome</span>
                        <span className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${outcome === 'YES' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {outcome}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Potential Return</p>
                            <p className="text-sm font-bold text-white">{estPayout.toFixed(2)} STX</p>
                        </div>
                        <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Pool Share</p>
                            <p className="text-sm font-bold text-indigo-400">{((amount / potSize) * 100).toFixed(2)}%</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-indigo-400">
                    <Info size={18} className="flex-shrink-0" />
                    <p className="text-[10px] leading-relaxed font-medium">
                        Transactions on Stacks are permanent. Once confirmed, your assets will be locked in the prediction contract until resolution.
                    </p>
                </div>

                <div className="flex flex-col space-y-3">
                    <button
                        onClick={onConfirm}
                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center space-x-2"
                    >
                        <span>Confirm & Sign</span>
                        <Zap size={16} />
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full py-4 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                        Cancel Transaction
                    </button>
                </div>
            </div>
        </div>
    );
};
