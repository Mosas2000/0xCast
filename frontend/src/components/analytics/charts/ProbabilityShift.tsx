import React from 'react';
import { Target, TrendingUp, AlertCircle, ArrowRight, Zap } from 'lucide-react';

interface ShiftData {
    time: string;
    yesProb: number;
}

/**
 * Visualizes the shift in outcome probabilities over time, highlighting momentum swings.
 */
export const ProbabilityShift: React.FC = () => {
    const shifts: ShiftData[] = [
        { time: '1h ago', yesProb: 45 },
        { time: '30m ago', yesProb: 48 },
        { time: '15m ago', yesProb: 55 },
        { time: 'Now', yesProb: 62 },
    ];

    const currentProb = shifts[shifts.length - 1].yesProb;
    const previousProb = shifts[shifts.length - 2].yesProb;
    const diff = currentProb - previousProb;

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <Target size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Probability Shift</h3>
                </div>
                <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${diff >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    <TrendingUp size={12} className={diff < 0 ? 'rotate-180' : ''} />
                    <span>{diff >= 0 ? '+' : ''}{diff}% SHIFT</span>
                </div>
            </div>

            <div className="flex flex-col space-y-4">
                {shifts.map((s, i) => (
                    <div key={i} className="flex items-center space-x-4 opacity-70 hover:opacity-100 transition-opacity group">
                        <span className="w-12 text-[9px] font-black text-slate-600 uppercase tracking-widest">{s.time}</span>
                        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${i === shifts.length - 1 ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-slate-700'}`}
                                style={{ width: `${s.yesProb}%` }}
                            />
                        </div>
                        <span className="w-10 text-[10px] font-black text-white text-right">{s.yesProb}%</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-center space-x-8 py-6 bg-slate-950/40 rounded-[2rem] border border-white/5">
                <div className="text-center">
                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-1">Current YES</p>
                    <p className="text-lg font-black text-emerald-400">{currentProb}%</p>
                </div>
                <ArrowRight size={20} className="text-slate-800" />
                <div className="text-center">
                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-1">Current NO</p>
                    <p className="text-lg font-black text-rose-400">{100 - currentProb}%</p>
                </div>
            </div>

            <div className="flex items-start space-x-3">
                <Zap size={16} className="text-indigo-400 animate-pulse flex-shrink-0" />
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    Significant momentum detected. Probability has shifted by {diff}% in the last 30 minutes, suggesting high-conviction buying on the YES side.
                </p>
            </div>

            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        </div>
    );
};
