import React, { useState } from 'react';
import { Target, TrendingUp, TrendingDown, Info, ShieldCheck } from 'lucide-react';

interface LimitOrderModalProps {
    onClose: () => void;
    onSetOrder: (price: number, amount: number) => void;
    currentPrice: number;
}

/**
 * Advanced trading modal for setting limit orders (price-triggered stakes).
 */
export const LimitOrderModal: React.FC<LimitOrderModalProps> = ({
    onClose,
    onSetOrder,
    currentPrice
}) => {
    const [targetPrice, setTargetPrice] = useState(currentPrice);
    const [amount, setAmount] = useState(10);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md">
            <div className="glass-morphism rounded-[2.5rem] p-10 max-w-lg w-full border border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] animate-float">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center space-x-2 text-primary-400 mb-2">
                            <Target size={20} className="animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Strategy Engine</span>
                        </div>
                        <h2 className="text-4xl font-bold text-white font-display">Limit Stake Order</h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all">
                        <span className="text-2xl">×</span>
                    </button>
                </div>

                <div className="space-y-8">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-sm font-bold text-slate-400">Target Outcome Price</label>
                            <div className="flex items-center space-x-1 text-xs text-primary-400 font-black">
                                <Info size={14} />
                                <span>Market is at {currentPrice}%</span>
                            </div>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(Number(e.target.value))}
                                className="w-full bg-slate-950 border-white/10 rounded-2xl py-5 px-6 text-3xl font-black text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-700">%</span>
                        </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                        <label className="text-sm font-bold text-slate-400 mb-4 block">Stake Amount</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full bg-slate-950 border-white/10 rounded-2xl py-5 px-6 text-3xl font-black text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-700">STX</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                        <ShieldCheck size={20} />
                        <p className="text-[11px] font-bold leading-tight">
                            Order will automatically execute if the market reachs your target percentage. Your STX will be escrowed.
                        </p>
                    </div>

                    <button
                        onClick={() => onSetOrder(targetPrice, amount)}
                        className="w-full py-6 bg-primary-600 hover:bg-primary-500 text-white rounded-3xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center space-x-3"
                    >
                        <span>Activate Logic Order</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
