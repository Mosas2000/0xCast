import React from 'react';
import { AreaChart, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PricePoint {
    time: string;
    price: number;
}

/**
 * Historical price chart for market outcomes, allowing users to track volatility and momentum.
 */
export const PriceHistory: React.FC = () => {
    const data: PricePoint[] = [
        { time: '09:00', price: 0.45 },
        { time: '10:00', price: 0.48 },
        { time: '11:00', price: 0.52 },
        { time: '12:00', price: 0.50 },
        { time: '13:00', price: 0.55 },
        { time: '14:00', price: 0.62 },
        { time: '15:00', price: 0.58 },
    ];

    const currentPrice = data[data.length - 1].price;
    const startPrice = data[0].price;
    const change = ((currentPrice - startPrice) / startPrice) * 100;

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <AreaChart size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Outcome History</h3>
                </div>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                    <button className="px-3 py-1 text-[10px] font-black text-white bg-white/10 rounded-lg">1D</button>
                    <button className="px-3 py-1 text-[10px] font-black text-slate-500 hover:text-white">1W</button>
                    <button className="px-3 py-1 text-[10px] font-black text-slate-500 hover:text-white">1M</button>
                </div>
            </div>

            <div className="flex items-baseline space-x-4">
                <span className="text-4xl font-black text-white">{currentPrice.toFixed(2)} STX</span>
                <div className={`flex items-center space-x-1 text-xs font-bold ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span>{Math.abs(change).toFixed(1)}%</span>
                </div>
            </div>

            <div className="h-64 flex items-end space-x-2 px-2 relative">
                {data.map((p, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group">
                        <div
                            className="w-full bg-gradient-to-t from-indigo-500/20 to-indigo-500/5 hover:from-indigo-500/40 transition-all rounded-t-lg relative"
                            style={{ height: `${p.price * 100}%` }}
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-2 py-1 rounded text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {p.price} STX
                            </div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-700 mt-4">{p.time}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-950/50 rounded-[2rem] border border-white/5">
                <div className="flex items-center space-x-3">
                    <TrendingUp size={20} className="text-emerald-400" />
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Momentum Indicator</p>
                        <p className="text-xs font-bold text-white">Strong Bullish Convergence</p>
                    </div>
                </div>
                <Calendar size={18} className="text-slate-800" />
            </div>
        </div>
    );
};
