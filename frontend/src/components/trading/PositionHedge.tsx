import React from 'react';
import { Shield, ArrowRight, Zap, TrendingDown } from 'lucide-react';

interface PositionHedgeProps {
    currentOutcome: 'YES' | 'NO';
    stakeAmount: number;
    potentialProfit: number;
    onHedge: () => void;
}

/**
 * Smart UI component to suggest counter-positions (hedging) to Lock-in profits or minimize losses.
 */
export const PositionHedge: React.FC<PositionHedgeProps> = ({
    currentOutcome,
    stakeAmount,
    potentialProfit,
    onHedge
}) => {
    const hedgeOutcome = currentOutcome === 'YES' ? 'NO' : 'YES';

    return (
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400">
                    <Shield size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Hedge Strategy</span>
                </div>
                <div className="px-2 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-slate-500">
                    SECURE PROFIT
                </div>
            </div>

            <div>
                <h4 className="text-white font-bold text-lg mb-1">Lock-in your gains?</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                    You are currently in profit by <span className="text-emerald-400 font-black">{potentialProfit} STX</span>.
                    Hedging with a small <span className="text-white font-bold">{hedgeOutcome}</span> stake can guarantee a payout regardless of the outcome.
                </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400">
                        <Zap size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Recommended Hedge</p>
                        <p className="text-sm font-bold text-white">{(stakeAmount * 0.4).toFixed(2)} STX on {hedgeOutcome}</p>
                    </div>
                </div>
                <button
                    onClick={onHedge}
                    className="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-all active:scale-95 shadow-lg shadow-primary-500/20"
                >
                    <ArrowRight size={18} />
                </button>
            </div>

            <div className="flex items-center space-x-2 text-[10px] text-slate-600 font-medium italic">
                <TrendingDown size={14} />
                <span>This will reduce your maximum potential upside but eliminates the total loss risk.</span>
            </div>
        </div>
    );
};
