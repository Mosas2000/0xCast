import React, { useState } from 'react';
import { Target, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';

interface TakeProfitUIProps {
    currentPrice: number;
    onSetTakeProfit: (price: number) => void;
}

/**
 * Premium UI for setting automated take-profit triggers to Lock-in market gains.
 */
export const TakeProfitUI: React.FC<TakeProfitUIProps> = ({ currentPrice, onSetTakeProfit }) => {
    const [profitPrice, setProfitPrice] = useState(currentPrice * 1.5); // Default 50% above

    return (
        <div className="bg-slate-900 border border-emerald-500/20 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400">
                    <Target size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">Profit Engine</span>
                </div>
                <div className="px-2 py-1 bg-emerald-500/10 rounded-lg text-[9px] font-black text-emerald-400 uppercase tracking-tighter">
                    EXIT TARGET
                </div>
            </div>

            <div>
                <h4 className="text-white font-bold text-lg mb-1">Set Take-Profit</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                    Automatically lock-in your gains by selling when the market hits your target probability.
                </p>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 relative">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                        Target Price (%)
                    </label>
                    <input
                        type="number"
                        value={profitPrice}
                        onChange={(e) => setProfitPrice(Number(e.target.value))}
                        className="w-full bg-transparent border-none text-2xl font-black text-white focus:ring-0 outline-none"
                    />
                    <span className="absolute right-4 top-1/2 text-slate-700 font-black text-xl">%</span>
                </div>

                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center space-x-1">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-bold text-slate-400">Potential ROI:</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400">+{((profitPrice / currentPrice - 1) * 100).toFixed(1)}%</span>
                </div>

                <button
                    onClick={() => onSetTakeProfit(profitPrice)}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20"
                >
                    <Sparkles size={14} />
                    <span>Activate Profit Target</span>
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
};
