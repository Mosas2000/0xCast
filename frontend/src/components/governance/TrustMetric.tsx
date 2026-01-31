import React from 'react';
import { Shield, CheckCircle2, AlertTriangle, Users, Target, Info, Zap } from 'lucide-react';

/**
 * Visual score-card for protocol trust, aggregating oracle reliability, treasury health, and governance activity.
 */
export const TrustMetric: React.FC = () => {
    const scores = [
        { label: 'Oracle Accuracy', value: '99.4%', status: 'HIGH' },
        { label: 'Treasury Reserve', value: '4.2M STX', status: 'STABLE' },
        { label: 'DAO Participation', value: '1,482', status: 'GRADUAL' }
    ];

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-10 relative overflow-hidden bg-slate-950/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-emerald-400">
                    <Shield size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest leading-none">Protocol Integrity</h3>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                    STABLE STATE
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {scores.map((s, i) => (
                    <div key={i} className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-700 uppercase tracking-widest">
                            <span>{s.label}</span>
                            <span className={s.status === 'HIGH' ? 'text-emerald-400' : 'text-indigo-400'}>{s.status}</span>
                        </div>
                        <div className="p-6 bg-slate-950/80 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center space-y-1 group hover:border-indigo-500/30 transition-all">
                            <p className="text-2xl font-black text-white font-display tracking-tight group-hover:scale-110 transition-transform">{s.value}</p>
                            <div className="flex items-center space-x-1 text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">
                                <Target size={10} />
                                <span>Real-time Sync</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-8 bg-white/2 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 flex items-center justify-center relative">
                    <div className="absolute inset-2 rounded-full border-4 border-indigo-500 border-t-transparent animate-[spin_3s_linear_infinite]" />
                    <span className="text-lg font-black text-white">98</span>
                </div>
                <div className="flex-1 space-y-1 text-center md:text-left">
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Composite Trust Score</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
                        Aggregated metric measuring the overall health and decentralization factor of the 0xCast protocol.
                    </p>
                </div>
                <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                    Full Audit
                </button>
            </div>

            <div className="flex items-center justify-center space-x-4">
                <Users size={18} className="text-indigo-400" />
                <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest"> Verified by 1,482 independent vStacks nodes.</p>
            </div>

            <Zap size={100} className="absolute -bottom-10 -right-10 text-white/[0.02] -rotate-12 pointer-events-none" />
        </div>
    );
};
