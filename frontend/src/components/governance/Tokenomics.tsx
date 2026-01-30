import React from 'react';
import { PieChart, TrendingDown, TrendingUp, Info, Activity, Zap, Coins } from 'lucide-react';

/**
 * Visual breakdown of protocol tokenomics, including supply distribution, burn rates, and staking yields.
 */
export const Tokenomics: React.FC = () => {
    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-10 relative overflow-hidden bg-slate-950/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <PieChart size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest leading-none">Supply Dynamics</h3>
                </div>
                <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                    DEFLATIONARY MODEL
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Circulating Supply', value: '820M', icon: Coins, color: 'indigo' },
                    { label: 'Total vStacks Burned', value: '45.2M', icon: TrendingDown, color: 'rose' },
                    { label: 'Annual Staking Yield', value: '12.4%', icon: TrendingUp, color: 'emerald' },
                    { label: 'Incentive Pool', value: '140M', icon: Activity, color: 'amber' }
                ].map((stat, i) => (
                    <div key={i} className="p-6 bg-slate-950/80 rounded-[2rem] border border-white/5 space-y-4 group hover:border-white/10 transition-all">
                        <div className={`p-3 bg-${stat.color}-500/10 rounded-xl border border-${stat.color}-500/20 w-fit text-${stat.color}-400`}>
                            <stat.icon size={18} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{stat.label}</p>
                            <h4 className="text-xl font-black text-white">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-8 bg-white/2 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Distribution Breakdown</h4>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-[9px] font-black uppercase text-slate-700">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span>Public</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[9px] font-black uppercase text-slate-700">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Treasury</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[9px] font-black uppercase text-slate-700">
                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>Team</span>
                        </div>
                    </div>
                </div>

                {/* Simplified Multi-segment progress bar */}
                <div className="h-6 w-full bg-slate-950 rounded-2xl overflow-hidden flex p-1 border border-white/5">
                    <div className="h-full bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20" style={{ width: '60%' }} />
                    <div className="w-1" />
                    <div className="h-full bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20" style={{ width: '25%' }} />
                    <div className="w-1" />
                    <div className="h-full bg-rose-500 rounded-lg shadow-lg shadow-rose-500/20" style={{ width: '15%' }} />
                </div>
            </div>

            <div className="p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 flex items-start space-x-4">
                <Info size={18} className="text-indigo-400 mt-0.5" />
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    The vStacks token features an algorithmic burn mechanism: 0.5% of every resolution fee is permanently removed from supply, increasing scarcity as protocol volume grows.
                </p>
            </div>

            <Zap size={100} className="absolute -bottom-10 -left-10 text-white/[0.02] -rotate-12 pointer-events-none" />
        </div>
    );
};
