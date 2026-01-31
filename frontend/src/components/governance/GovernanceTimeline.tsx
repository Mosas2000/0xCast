import React from 'react';
import { History, CheckCircle2, AlertCircle, Clock, Zap, Info, ShieldCheck } from 'lucide-react';

interface GovEvent {
    id: string;
    type: 'proposal' | 'vote' | 'execution' | 'upgrade';
    label: string;
    description: string;
    timestamp: string;
    status: 'complete' | 'active' | 'upcoming';
}

/**
 * Historical timeline of governance actions, tracking the evolution of the protocol through community-driven changes.
 */
export const GovernanceTimeline: React.FC = () => {
    const events: GovEvent[] = [
        { id: 'g1', type: 'proposal', label: 'SIP-004: Oracle Upgrade', description: 'Proposed a shift to decentralized oracle cluster v2.', timestamp: 'Jan 20', status: 'complete' },
        { id: 'g2', type: 'vote', label: 'Voting phase: SIP-004', description: 'Quorum reached. 82% in favor of upgrade.', timestamp: 'Jan 25', status: 'complete' },
        { id: 'g3', type: 'execution', label: 'Governance Execution', description: 'Smart contract parameters updated on-chain.', timestamp: 'Jan 29', status: 'complete' },
        { id: 'g4', type: 'upgrade', label: 'Network Migration', description: 'Finalizing vStacks supply rebalancing.', timestamp: 'Jan 30', status: 'active' }
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'proposal': return <Info size={16} className="text-indigo-400" />;
            case 'vote': return <Zap size={16} className="text-amber-400" />;
            case 'upgrade': return <ShieldCheck size={16} className="text-emerald-400" />;
            default: return <History size={16} className="text-slate-500" />;
        }
    };

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-10 relative overflow-hidden bg-slate-950/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <History size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest leading-none">Governance Archive</h3>
                </div>
                <div className="flex items-center space-x-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <span>SIP SCHEMA V1.2</span>
                </div>
            </div>

            <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                {events.map((e) => (
                    <div key={e.id} className={`relative pl-12 group transition-all ${e.status === 'upcoming' ? 'opacity-30' : 'opacity-100'}`}>
                        {/* Indicator Dot */}
                        <div className={`absolute left-0 top-1 w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${e.status === 'active' ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/30' : e.status === 'complete' ? 'bg-white/5 border-white/5' : 'bg-slate-950 border-white/5'}`}>
                            {e.status === 'complete' ? (
                                <CheckCircle2 size={16} className="text-emerald-500" />
                            ) : e.status === 'active' ? (
                                <Clock size={16} className="text-white animate-spin-slow" />
                            ) : (
                                <History size={16} className="text-slate-700" />
                            )}
                        </div>

                        <div className="group-hover:translate-x-1 transition-transform">
                            <div className="flex items-center space-x-3 mb-1">
                                <div className="p-1.5 bg-white/5 rounded-lg border border-white/5">
                                    {getIcon(e.type)}
                                </div>
                                <h4 className="text-sm font-black text-white uppercase tracking-tight">{e.label}</h4>
                                <span className="text-[10px] font-bold text-slate-700 italic">{e.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-lg">
                                {e.description}
                            </p>
                            {e.status === 'active' && (
                                <div className="mt-4 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl w-fit flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Action Required</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full py-4 bg-white/2 hover:bg-white/5 border border-white/5 rounded-[2rem] text-[10px] font-black text-slate-500 uppercase tracking-widest transition-all">
                View Full Protocol History
            </button>

            {/* Decorative Blur */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />
        </div>
    );
};
