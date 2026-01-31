import React, { useState } from 'react';
import { Bell, BellOff, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';

interface PriceAlertsProps {
    marketTitle: string;
    currentPrice: number;
    onSetAlert: (threshold: number, direction: 'above' | 'below') => void;
}

/**
 * Interactive component for setting custom price/odds alerts for a specific market.
 */
export const PriceAlerts: React.FC<PriceAlertsProps> = ({
    marketTitle,
    currentPrice,
    onSetAlert
}) => {
    const [threshold, setThreshold] = useState(currentPrice);
    const [direction, setDirection] = useState<'above' | 'below'>('above');
    const [isActive, setIsActive] = useState(false);

    return (
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-indigo-500 text-white animate-pulse' : 'bg-white/5 text-slate-500'}`}>
                        <Bell size={20} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">Odds Alert</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Current: {currentPrice}%</p>
                    </div>
                </div>
                {isActive && (
                    <button
                        onClick={() => setIsActive(false)}
                        className="flex items-center space-x-1 px-3 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-[10px] font-black hover:bg-rose-500/20 transition-all uppercase tracking-widest"
                    >
                        <BellOff size={12} />
                        <span>Cancel</span>
                    </button>
                )}
            </div>

            {!isActive ? (
                <div className="space-y-4">
                    <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setDirection('above')}
                            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all ${direction === 'above' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <ArrowUpRight size={16} />
                            <span className="text-xs font-bold">Above</span>
                        </button>
                        <button
                            onClick={() => setDirection('below')}
                            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all ${direction === 'below' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <ArrowDownRight size={16} />
                            <span className="text-xs font-bold">Below</span>
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            type="number"
                            value={threshold}
                            onChange={(e) => setThreshold(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 px-5 text-xl font-black text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-lg font-black text-slate-700">%</span>
                    </div>

                    <button
                        onClick={() => {
                            setIsActive(true);
                            onSetAlert(threshold, direction);
                        }}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all"
                    >
                        Activate Alert
                    </button>
                </div>
            ) : (
                <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                    <p className="text-xs text-slate-300 leading-relaxed text-center">
                        We will notify you when <span className="text-white font-bold">{marketTitle}</span> odds go <span className="text-indigo-400 font-black">{direction}</span> <span className="text-white font-bold">{threshold}%</span>.
                    </p>
                </div>
            )}
        </div>
    );
};
