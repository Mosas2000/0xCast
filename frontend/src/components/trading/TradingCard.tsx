import React, { useState } from 'react';

interface TradingCardProps {
    marketId: number;
    outcomes: string[];
    odds: number[];
    onTrade: (outcomeIndex: number, amount: number) => void;
}

export const TradingCard: React.FC<TradingCardProps> = ({ marketId, outcomes, odds, onTrade }) => {
    const [selectedOutcome, setSelectedOutcome] = useState<number>(0);
    const [tradeAmount, setTradeAmount] = useState<string>('10');

    const handleSubmit = () => {
        const amount = parseFloat(tradeAmount);
        if (!isNaN(amount) && amount > 0) {
            onTrade(selectedOutcome, amount);
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 space-y-6">
                <div className="space-y-4">
                    <label className="text-sm font-medium text-slate-400">Select Outcome</label>
                    <div className="grid grid-cols-2 gap-3">
                        {outcomes.map((outcome, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedOutcome(index)}
                                className={`p-4 rounded-xl border transition-all text-left space-y-1 ${selectedOutcome === index
                                        ? 'bg-primary-600/10 border-primary-500 ring-1 ring-primary-500'
                                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{outcome}</div>
                                <div className="text-2xl font-bold text-white">{(odds[index] * 100).toFixed(1)}%</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-slate-400">Amount to Trade</label>
                        <span className="text-xs text-slate-500">Balance: 0 STX</span>
                    </div>
                    <div className="relative">
                        <input
                            type="number"
                            value={tradeAmount}
                            onChange={(e) => setTradeAmount(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 text-xl font-bold text-white placeholder-slate-600 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">STX</div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {['10', '50', '100', 'MAX'].map(val => (
                            <button
                                key={val}
                                onClick={() => val !== 'MAX' && setTradeAmount(val)}
                                className="py-2 text-xs font-bold bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                            >
                                {val === 'MAX' ? 'MAX' : `${val}`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Est. Payout</span>
                        <span className="text-green-500 font-bold">
                            {((parseFloat(tradeAmount) || 0) / (odds[selectedOutcome] || 1)).toFixed(2)} STX
                        </span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all transform active:scale-[0.98]"
                    >
                        Buy {outcomes[selectedOutcome]} Shares
                    </button>
                </div>
            </div>
        </div>
    );
};
