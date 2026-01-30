import React from 'react';
import { Layers, Users, Zap, Coins, TrendingUp } from 'lucide-react';

interface Pool {
    id: string;
    name: string;
    totalStake: number;
    participants: number;
    yield: string;
}

/**
 * Social betting pools component for group-based predictions and collective liquidity.
 */
export const BettingPools: React.FC = () => {
    const pools: Pool[] = [
        { id: 'p1', name: 'Stacks Legends', totalStake: 15400, participants: 85, yield: '12.5%' },
        { id: 'p2', name: 'DeFi Oracles', totalStake: 8200, participants: 42, yield: '18.2%' },
        { id: 'p3', name: 'Early Birds', totalStake: 25000, participants: 156, yield: '9.8%' }
    ];

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <Layers size={20} />
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest">Community Pools</h2>
                </div>
                <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">CREATE POOL</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pools.map((pool) => (
                    <div key={pool.id} className="relative group p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition-all cursor-pointer">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                <Users size={20} />
                            </div>
                            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                {pool.yield} APY
                            </div>
                        </div>

                        <h4 className="text-white font-bold text-lg mb-2">{pool.name}</h4>

                        <div className="flex items-center space-x-6">
                            <div>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Total TVL</p>
                                <div className="flex items-center space-x-1">
                                    <Coins size={12} className="text-amber-500" />
                                    <span className="text-sm font-black text-white">{pool.totalStake.toLocaleString()} STX</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Participants</p>
                                <div className="flex items-center space-x-1">
                                    <Users size={12} className="text-indigo-400" />
                                    <span className="text-sm font-bold text-white">{pool.participants}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">View Pool Strategy</span>
                            <TrendingUp size={16} className="text-indigo-400" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-slate-950/50 rounded-[2rem] border border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Zap size={20} className="text-amber-500 animate-pulse" />
                    <p className="text-xs text-slate-500 font-medium">Join a pool to reduce fees and share expert insights with top traders.</p>
                </div>
                <button className="text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest">EXPLORE ALL</button>
            </div>
        </div>
    );
};
