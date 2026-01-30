import React from 'react';
import { Award, Zap, Users, Target, CheckCircle2, ArrowUpRight, Diamond } from 'lucide-react';

interface Bounty {
    id: string;
    title: string;
    reward: string;
    complexity: 'EASY' | 'MEDIUM' | 'HARD';
    category: string;
    participants: number;
}

/**
 * Interface for active protocol bounties, incentivizing developers and oracles to contribute to the ecosystem.
 */
export const BountyBoard: React.FC = () => {
    const bounties: Bounty[] = [
        { id: 'b1', title: 'Integrate Pyth Oracle Feed', reward: '5,000 STX', complexity: 'HARD', category: 'CORE', participants: 4 },
        { id: 'b2', title: 'Design Community Badge v2', reward: '250 STX', complexity: 'EASY', category: 'UI/UX', participants: 12 },
        { id: 'b3', title: 'Security Audit: Staking Module', reward: '2,500 STX', complexity: 'MEDIUM', category: 'DEV', participants: 2 }
    ];

    const getComplexityColor = (comp: string) => {
        switch (comp) {
            case 'HARD': return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
            case 'MEDIUM': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
            default: return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
        }
    };

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-10 relative overflow-hidden bg-slate-950/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <Award size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Incentive Board</h3>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center -space-x-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-indigo-600 border border-slate-950 flex items-center justify-center">
                                <Users size={12} className="text-white" />
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">148 Active Contributors</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {bounties.map((b) => (
                    <div key={b.id} className="group p-8 bg-white/2 rounded-[2.5rem] border border-white/5 hover:bg-white/5 transition-all flex flex-col justify-between space-y-8 relative overflow-hidden">
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-start">
                                <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getComplexityColor(b.complexity)}`}>
                                    {b.complexity}
                                </span>
                                <button className="p-2.5 bg-white/5 rounded-xl text-slate-700 group-hover:text-white transition-colors border border-white/5">
                                    <ArrowUpRight size={16} />
                                </button>
                            </div>
                            <h4 className="text-sm font-black text-white uppercase leading-tight tracking-tight group-hover:text-indigo-400 transition-colors">{b.title}</h4>
                            <div className="flex items-center space-x-3 text-[9px] font-black text-slate-700 uppercase tracking-widest">
                                <Target size={12} />
                                <span>{b.category}</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-white/5 relative z-10">
                            <div className="flex justify-between items-center">
                                <p className="text-[10px] font-black text-white uppercase tracking-widest italic">{b.reward}</p>
                                <div className="flex items-center space-x-1 text-slate-500">
                                    <Users size={12} />
                                    <span className="text-[9px] font-bold">{b.participants}</span>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
                                Claim Bounty
                            </button>
                        </div>

                        {/* Background Icon */}
                        <Diamond size={80} className="absolute -bottom-6 -right-6 text-white/[0.01] pointer-events-none" />
                    </div>
                ))}
            </div>

            <div className="p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 flex items-center justify-center space-x-4">
                <CheckCircle2 size={18} className="text-indigo-400" />
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                    Bounty rewards are distributed automatically via smart contract upon proposal approval.
                </p>
            </div>

            <Zap size={100} className="absolute -top-10 -left-10 text-white/[0.02] -rotate-12 pointer-events-none" />
        </div>
    );
};
