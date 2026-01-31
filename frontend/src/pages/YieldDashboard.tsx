import React from 'react';
import { AreaChart, Wallet, ArrowUpRight, ArrowDownRight, RefreshCw, Layers } from 'lucide-react';

/**
 * Yield Dashboard for tracking complex returns, bonuses, and compounding effects.
 */
export const YieldDashboard: React.FC = () => {
    const metrics = [
        { label: 'Unrealized Yield', value: '450.2 STX', change: '+12.5%', isPositive: true },
        { label: 'Claimed Rewards', value: '1,204.5 STX', change: '-2.4%', isPositive: false },
        { label: 'Staking Bonus', value: '3.5x', change: '+0.5x', isPositive: true },
        { label: 'Active Positions', value: '12 Markets', change: 'Stable', isPositive: true }
    ];

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
                <div>
                    <div className="flex items-center space-x-2 text-indigo-400 mb-2">
                        <AreaChart size={20} />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Growth Intelligence</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white font-display">Yield Dashboard</h1>
                    <p className="text-slate-400 mt-2">Comprehensive overview of your protocol returns and performance multipliers.</p>
                </div>
                <button className="flex items-center space-x-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95">
                    <RefreshCw size={16} />
                    <span>Sync Performance</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {metrics.map((m, idx) => (
                    <div key={idx} className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{m.label}</p>
                        <div className="flex items-baseline justify-between">
                            <h3 className="text-2xl font-black text-white">{m.value}</h3>
                            <div className={`flex items-center space-x-1 text-[10px] font-bold ${m.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {m.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                <span>{m.change}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-morphism rounded-[2.5rem] p-10 border border-white/10 relative overflow-hidden h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                            <Layers size={20} className="text-indigo-400" />
                            <span>Revenue Streams</span>
                        </h3>
                        <button className="text-xs font-black text-indigo-400 hover:text-white transition-colors">VIEW DETAILED LOGS</button>
                    </div>
                    {/* Mock Chart Placeholder */}
                    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-indigo-500/10 to-transparent flex items-end justify-around px-10 pb-4">
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                            <div key={i} className="w-12 bg-indigo-500/20 rounded-t-xl transition-all hover:bg-indigo-500/40" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>

                <div className="glass-morphism rounded-[2.5rem] p-10 border border-white/10 flex flex-col justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 mx-auto border border-indigo-500/20">
                        <Wallet size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white">Compound Strategy</h3>
                        <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">
                            You are currently reinvesting <span className="text-indigo-400 font-bold">40%</span> of your yields. Boosting this to 60% would result in <span className="text-emerald-400 font-bold">+18% APY</span>.
                        </p>
                    </div>
                    <button className="py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10 transition-all">
                        Optimize Strategy
                    </button>
                </div>
            </div>
        </div>
    );
};
