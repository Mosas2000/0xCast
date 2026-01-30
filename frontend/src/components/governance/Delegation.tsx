import React, { useState } from 'react';
import { Users, UserPlus, UserMinus, ShieldCheck, Zap, Info, Search } from 'lucide-react';

interface Delegate {
    id: string;
    name: string;
    address: string;
    weight: string;
    votingHistory: string;
}

/**
 * Interface for delegating voting power to trusted community representatives or expert oracles.
 */
export const Delegation: React.FC = () => {
    const delegates: Delegate[] = [
        { id: 'd1', name: 'StacksCouncil', address: 'SP2J...9K2M', weight: '1.2M vStacks', votingHistory: '98% Active' },
        { id: 'd2', name: 'OraclePrime', address: 'SP3A...5T8N', weight: '850K vStacks', votingHistory: '100% Reliable' },
        { id: 'd3', name: 'ZkResearcher', address: 'SP1Q...4R7V', weight: '420K vStacks', votingHistory: '92% Active' }
    ];

    const [selected, setSelected] = useState<string | null>(null);

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-10 relative overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <Users size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Power Delegation</h3>
                </div>
                <div className="relative group">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 group-hover:text-white transition-colors" />
                    <input
                        type="text"
                        placeholder="Search delegates..."
                        className="bg-slate-950/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-[10px] text-white focus:border-indigo-500/50 outline-none w-48 transition-all"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {delegates.map((d) => (
                    <div
                        key={d.id}
                        onClick={() => setSelected(d.id)}
                        className={`group p-6 rounded-[2rem] border transition-all cursor-pointer ${selected === d.id ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-white/2 border-white/5 hover:bg-white/5'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${selected === d.id ? 'bg-white/10 border-white/20' : 'bg-slate-950 border-white/5'}`}>
                                    <UserPlus size={20} className={selected === d.id ? 'text-white' : 'text-slate-700'} />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h4 className={`text-sm font-black uppercase tracking-tight ${selected === d.id ? 'text-white' : 'text-slate-300'}`}>{d.name}</h4>
                                        <ShieldCheck size={14} className="text-emerald-500" />
                                    </div>
                                    <p className="text-[9px] font-mono text-slate-500 mt-0.5">{d.address}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-black ${selected === d.id ? 'text-white' : 'text-white'}`}>{d.weight}</p>
                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mt-0.5">{d.votingHistory}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
                <div className="flex items-start space-x-3 max-w-sm">
                    <Info size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        Delegated power can be revoked at any time. Your vStacks will be used by the delegate to vote on your behalf, but you retain full ownership of your assets.
                    </p>
                </div>
                <button className="w-full md:w-auto px-10 py-3 bg-white hover:bg-slate-200 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-2">
                    <Zap size={14} />
                    <span>Confirm Delegation</span>
                </button>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
    );
};
