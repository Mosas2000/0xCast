import React from 'react';
import { MousePointer2, TrendingUp, ArrowDownCircle, ArrowUpCircle, Zap } from 'lucide-react';

interface FlowStep {
    source: string;
    target: string;
    amount: number;
}

/**
 * Visualizes the flow of capital between markets and liquidity pools using a simplified Sankey-like aesthetic.
 */
export const MoneyFlow: React.FC = () => {
    const flows: FlowStep[] = [
        { source: 'External Wallets', target: 'Liquidity Pools', amount: 154000 },
        { source: 'Liquidity Pools', target: 'Prediction Markets', amount: 120000 },
        { source: 'Prediction Markets', target: 'Protocol Fees', amount: 2400 },
        { source: 'Prediction Markets', target: 'Winning Payouts', amount: 110000 },
    ];

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-10 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <MousePointer2 size={20} className="rotate-45" />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Protocol Money Flow</h3>
                </div>
                <div className="flex space-x-2">
                    <div className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-500 uppercase">24H CYCLE</div>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                {flows.map((flow, i) => (
                    <div key={i} className="group relative flex items-center justify-between p-6 bg-white/2 rounded-[2rem] border border-white/5 hover:bg-white/5 transition-all">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-slate-700 border border-white/5 group-hover:text-indigo-400 transition-colors">
                                <ArrowUpCircle size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Source</p>
                                <p className="text-sm font-bold text-white">{flow.source}</p>
                            </div>
                        </div>

                        <div className="flex-1 px-8 relative hidden md:block">
                            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
                            <div className="absolute top-1/2 left-0 w-full flex justify-center -translate-y-1/2">
                                <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400">
                                    {flow.amount.toLocaleString()} STX
                                </div>
                            </div>
                            <Zap size={12} className="absolute right-8 top-1/2 -translate-y-1/2 text-indigo-500 animate-pulse" />
                        </div>

                        <div className="flex items-center space-x-4 text-right">
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Destination</p>
                                <p className="text-sm font-bold text-white">{flow.target}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-slate-700 border border-white/5 group-hover:text-emerald-400 transition-colors">
                                <ArrowDownCircle size={20} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-10">
                <div className="p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Inflow Velocity</p>
                    <div className="flex items-center space-x-3">
                        <TrendingUp size={24} className="text-emerald-400" />
                        <span className="text-2xl font-black text-white">4.2 STX/s</span>
                    </div>
                </div>
                <div className="p-6 bg-rose-500/5 rounded-[2rem] border border-rose-500/10 text-right">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Outflow Burn Rate</p>
                    <div className="flex items-center justify-end space-x-3">
                        <span className="text-2xl font-black text-white">0.12 STX/s</span>
                        <TrendingUp size={24} className="text-rose-400 rotate-90" />
                    </div>
                </div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)] pointer-events-none" />
        </div>
    );
};
