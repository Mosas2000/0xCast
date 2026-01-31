import React from 'react';
import { Users, Globe, Lock, ShieldCheck, TrendingUp, Plus } from 'lucide-react';

interface Group {
    id: string;
    name: string;
    description: string;
    members: number;
    privacy: 'public' | 'private' | 'verified';
    tags: string[];
}

/**
 * Community-driven groups for collaborative market analysis and private staking pools.
 */
export const UserGroups: React.FC = () => {
    const groups: Group[] = [
        {
            id: 'g1',
            name: 'Stacks Alpha Hunters',
            description: 'The premier group for deep Stacks ecosystem analysis and early-stage market opportunities.',
            members: 1240,
            privacy: 'verified',
            tags: ['ALPHAHUNT', 'STACKS', 'STX']
        },
        {
            id: 'g2',
            name: 'Bitcoin Macro Debate',
            description: 'Discussing the long-term economic impact of Bitcoin on global prediction markets.',
            members: 5600,
            privacy: 'public',
            tags: ['MACRO', 'BTC', 'ECON']
        },
        {
            id: 'g3',
            name: 'Private Whales Circle',
            description: 'Invitation-only group for high-volume traders and market makers.',
            members: 42,
            privacy: 'private',
            tags: ['OTC', 'WHALE']
        }
    ];

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Community Groups</h2>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Collaborate and thrive together</p>
                </div>
                <button className="flex items-center space-x-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95">
                    <Plus size={18} />
                    <span>New Group</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((g) => (
                    <div key={g.id} className="group p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all relative overflow-hidden">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${g.privacy === 'public' ? 'bg-emerald-500/10 text-emerald-400' : g.privacy === 'private' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                {g.privacy}
                            </div>
                        </div>

                        <h4 className="text-white font-bold text-xl mb-3">{g.name}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed mb-6 line-clamp-2">{g.description}</p>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {g.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-white/5 rounded-md text-[8px] font-black text-slate-400 uppercase tracking-tighter">#{tag}</span>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                            <div className="flex items-center space-x-2">
                                <Users size={14} className="text-slate-700" />
                                <span className="text-xs font-bold text-white">{g.members.toLocaleString()}</span>
                            </div>
                            <button className="text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest">JOIN GROUP</button>
                        </div>

                        <div className="absolute -right-6 -bottom-6 opacity-5 rotate-12 group-hover:rotate-0 transition-transform">
                            <ShieldCheck size={120} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
