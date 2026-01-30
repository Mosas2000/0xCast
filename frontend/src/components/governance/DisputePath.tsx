import React from 'react';
import { ShieldAlert, AlertCircle, ArrowRight, Gavel, Scale, Info, Zap } from 'lucide-react';

/**
 * Visual representation of the decentralized dispute resolution process, tracking the path from escalation to final verdict.
 */
export const DisputePath: React.FC = () => {
    const stages = [
        { id: 'escalation', label: 'Market Escalated', icon: AlertCircle, status: 'complete', description: 'Consensus not reached by primary oracles.' },
        { id: 'bonded', label: 'Bonded Dispute', icon: ShieldAlert, status: 'active', description: 'Collateral locked by disputant to trigger formal review.' },
        { id: 'jury', label: 'Jury Selection', icon: Users, status: 'pending', description: 'Randomly selected vStacks holders assigned as resolvers.' },
        { id: 'verdict', label: 'Final Verdict', icon: Gavel, status: 'pending', description: 'Consensus-based resolution and bond distribution.' }
    ];

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-10 relative overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-rose-400">
                    <Gavel size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Dispute Resolution Path</h3>
                </div>
                <div className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[9px] font-black text-rose-400 uppercase tracking-widest">
                    HIGH CONFLICT STATE
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Connector Line (Desktop) */}
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-[40px] hidden md:block" />

                {stages.map((s, i) => (
                    <div key={s.id} className={`group flex flex-col items-center space-y-4 relative ${s.status === 'pending' ? 'opacity-30' : 'opacity-100'}`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${s.status === 'active' ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-600/30 text-white animate-pulse' : s.status === 'complete' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-950 border-white/5 text-slate-700'}`}>
                            <s.icon size={24} />
                        </div>
                        <div className="text-center space-y-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">{s.label}</h4>
                            <p className="text-[9px] font-medium text-slate-500 max-w-[120px] leading-relaxed group-hover:text-slate-300 transition-colors">
                                {s.description}
                            </p>
                        </div>
                        {i < stages.length - 1 && (
                            <div className="absolute top-1/2 right-[-20px] -translate-y-[40px] hidden md:block">
                                <ArrowRight size={16} className="text-slate-800" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-8 bg-slate-950/80 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                        <Scale size={18} className="text-indigo-400" />
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">Fairness Assessment</h4>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        A 5,000 STX bond has been placed by the disputant. If the jury confirms the original resolution, the bond is slashed and distributed to participants.
                    </p>
                </div>
                <div className="w-full md:w-auto">
                    <button className="w-full px-8 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">
                        View Bond Logic
                    </button>
                </div>
            </div>
        </div>
    );
};

// Re-importing missing Icon
import { Users } from 'lucide-react';
