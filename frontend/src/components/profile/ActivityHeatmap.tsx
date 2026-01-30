import React from 'react';
import { Activity, Zap, TrendingUp, Calendar } from 'lucide-react';

interface DayActivity {
    day: number;
    intensity: number; // 0-4
}

/**
 * Visual activity heatmap for user profiles, showing engagement consistency and staking frequency.
 */
export const ActivityHeatmap: React.FC = () => {
    // Mock data for 52 weeks (simplified as a 7x20 grid)
    const data: DayActivity[] = Array.from({ length: 140 }, (_, i) => ({
        day: i,
        intensity: Math.floor(Math.random() * 5)
    }));

    const intensityColors = [
        'bg-white/5',
        'bg-indigo-500/20',
        'bg-indigo-500/40',
        'bg-indigo-500/70',
        'bg-indigo-400'
    ];

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <Activity size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Protocol Engagement</h3>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-white">+12% THIS MONTH</span>
                    </div>
                    <Calendar size={18} className="text-slate-700" />
                </div>
            </div>

            <div className="flex flex-col space-y-4">
                {/* Heatmap Grid */}
                <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-4 scrollbar-hide">
                    {data.map((d) => (
                        <div
                            key={d.day}
                            className={`w-3.5 h-3.5 rounded-sm transition-all hover:ring-2 hover:ring-white/20 cursor-help ${intensityColors[d.intensity]}`}
                            title={`Level ${d.intensity} activity on day ${d.day}`}
                        />
                    ))}
                </div>

                <div className="flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest pt-4 border-t border-white/5">
                    <div className="flex items-center space-x-2">
                        <span>Less</span>
                        <div className="flex space-x-1">
                            {intensityColors.map((c, i) => (
                                <div key={i} className={`w-2.5 h-2.5 rounded-[1px] ${c}`} />
                            ))}
                        </div>
                        <span>More</span>
                    </div>
                    <div>Last 20 weeks of on-chain activity</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Consisteny Streak</p>
                    <div className="flex items-center space-x-2">
                        <Zap size={14} className="text-amber-500" />
                        <span className="text-sm font-black text-white">14 DAYS</span>
                    </div>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Stakes</p>
                    <span className="text-sm font-black text-white">402</span>
                </div>
            </div>
        </div>
    );
};
