import React, { useState } from 'react';
import { ShieldX, AlertTriangle, ArrowRight, TrendingDown } from 'lucide-react';

interface StopLossUIProps {
    currentPrice: number;
    onSetStopLoss: (price: number) => void;
}

/**
 * Tactical UI for setting automated stop-loss triggers to prevent cascading losses.
 */
export const StopLossUI: React.FC<StopLossUIProps> = ({ currentPrice, onSetStopLoss }) => {
    const [stopPrice, setStopPrice] = useState(currentPrice * 0.8); // Default 20% below

    return (
        <div className="bg-slate-900 border border-rose-500/20 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-rose-400">
                    <ShieldX size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">Risk Guard</span>
                </div>
                <div className="px-2 py-1 bg-rose-500/10 rounded-lg text-[9px] font-black text-rose-400 uppercase tracking-tighter">
                    EXIT STRATEGY
                </div>
            </div>

            <div>
                <h4 className="text-white font-bold text-lg mb-1">Set Stop-Loss</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                    Automatically sell your position if the market probability drops below your safety threshold.
                </p>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 relative">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                        Trigger Price (%)
                    </label>
                    <input
                        type="number"
                        value={stopPrice}
                        onChange={(e) => setStopPrice(Number(e.target.value))}
                        className="w-full bg-transparent border-none text-2xl font-black text-white focus:ring-0 outline-none"
                    />
                    <span className="absolute right-4 top-1/2 text-slate-700 font-black text-xl">%</span>
                </div>

                <div className="flex items-center space-x-2 text-[10px] text-amber-500/80 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                    <AlertTriangle size={14} />
                    <span>Execution depends on available liquidity at trigger time.</span>
                </div>

                <button
                    onClick={() => onSetStopLoss(stopPrice)}
                    className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center space-x-2"
                >
                    <span>Activate Stop-Loss</span>
                    <ArrowRight size={14} />
                </button>
            </div>

            <div className="flex justify-center">
                <div className="flex items-center space-x-1 text-[9px] text-slate-600 uppercase tracking-tighter font-bold">
                    <TrendingDown size={12} />
                    <span>Estimated Protection: {(currentPrice - stopPrice).toFixed(1)}% Drop</span>
                </div>
            </div>
        </div>
    );
};
