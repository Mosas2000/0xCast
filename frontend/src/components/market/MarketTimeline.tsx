import React from 'react';
import { Calendar, CheckCircle2, AlertCircle, Clock, Search, ShieldCheck } from 'lucide-react';

interface TimelineEvent {
    id: string;
    status: 'created' | 'active' | 'review' | 'resolved';
    label: string;
    description: string;
    timestamp: string;
    isComplete: boolean;
}

/**
 * Chronological timeline of market events, tracking the lifecycle from creation to decentralized resolution.
 */
export const MarketTimeline: React.FC = () => {
    const events: TimelineEvent[] = [
        { id: '1', status: 'created', label: 'Market Created', description: 'Initialized by decentralized proposer.', timestamp: 'Jan 20', isComplete: true },
        { id: '2', status: 'active', label: 'Trading Phase', description: 'Liquidity pools enabled and open for stakes.', timestamp: 'Jan 21', isComplete: true },
        { id: '3', status: 'review', label: 'Resolution Window', description: 'Oracle data collection and community audit.', timestamp: 'Jan 29', isComplete: false },
        { id: '4', status: 'resolved', label: 'Settlement', description: 'Final payouts distributed to winners.', timestamp: 'Jan 30', isComplete: false }
    ];

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-10 relative overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <Calendar size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Market Lifecycle</h3>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>PROVABLY IMMUTABLE</span>
                </div>
            </div>

            <div className="relative space-y-12 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                {events.map((e) => (
                    <div key={e.id} className={`relative pl-12 group transition-all ${e.isComplete ? 'opacity-100' : 'opacity-40'}`}>
                        {/* Indicator Dot */}
                        <div className={`absolute left-0 top-1 w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${e.isComplete ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/30' : 'bg-slate-900 border-white/5'}`}>
                            {e.isComplete ? (
                                <CheckCircle2 size={16} className="text-white" />
                            ) : (
                                <Clock size={16} className="text-slate-700" />
                            )}
                        </div>

                        <div>
                            <div className="flex items-baseline justify-between mb-1">
                                <h4 className={`text-sm font-black uppercase tracking-tight ${e.isComplete ? 'text-white' : 'text-slate-600'}`}>
                                    {e.label}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-700 italic">{e.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
                                {e.description}
                            </p>
                        </div>

                        {/* Hover Context Trigger */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-white/5 rounded-xl text-slate-700 hover:text-white transition-colors">
                                <Search size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 flex items-center space-x-4">
                <AlertCircle size={18} className="text-indigo-400 flex-shrink-0" />
                <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
                    The resolution window is currently active. Governance participants are verifying the outcome data on-chain.
                </p>
            </div>

            {/* Background Decor */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none" />
        </div>
    );
};
