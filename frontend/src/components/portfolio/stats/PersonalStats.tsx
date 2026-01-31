import React from 'react';
import { Target, BarChart2, PieChart, TrendingUp, Award, Zap } from 'lucide-react';

interface PersonalMetric {
    label: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: any;
}

/**
 * Deep personal performance analytics for traders, focusing on ROI, win rate, and efficiency.
 */
export const PersonalStats: React.FC = () => {
    const metrics: PersonalMetric[] = [
        { label: 'Total PnL', value: '+5,420 STX', change: '14.2%', isPositive: true, icon: TrendingUp },
        { label: 'Win Rate', value: '68%', change: '2.1%', isPositive: true, icon: Target },
        { label: 'Avg Stake', value: '250 STX', change: '-5%', isPositive: false, icon: Zap },
        { label: 'Efficiency', value: 'A+', change: 'TOP 2%', isPositive: true, icon: Award }
    ];

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-10">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <BarChart2 size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Performance Matrix</h3>
                </div>
                <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest">LIFETIME ANALYTICS</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                    <div key={i} className="group p-6 bg-white/2 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 transition-all relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                <m.icon size={18} />
                            </div>
                            <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${m.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {m.isPositive ? '+' : ''}{m.change}
                            </div>
                        </div>

                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{m.label}</p>
                        <h4 className="text-2xl font-black text-white">{m.value}</h4>

                        {/* Background Glow */}
                        <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all" />
                    </div>
                ))}
            </div>

            <div className="p-8 bg-slate-950/80 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4 w-full">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-600">REACHING NEXT LEVEL</span>
                        <span className="text-indigo-400">840 / 1000 XP</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div className="h-full bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: '84%' }} />
                    </div>
                </div>
                <div className="flex items-center space-x-4 px-8 border-l border-white/5 h-16 w-full md:w-auto">
                    <div className="p-3 bg-fuchsia-500/10 text-fuchsia-400 rounded-xl border border-fuchsia-500/20">
                        <Award size={24} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">CURRENT RANK</p>
                        <p className="text-lg font-black text-white italic">MYTHIC</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
