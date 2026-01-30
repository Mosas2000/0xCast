import React from 'react';
import { Pickaxe, TrendingUp, Users, Coins, ArrowRight } from 'lucide-react';

/**
 * Liquidity Mining dashboard for users to provide liquidity and earn protocol rewards.
 */
export const LiquidityMining: React.FC = () => {
    const pools = [
        { name: 'STX Main Pool', tvl: '1.2M STX', apy: '18.5%', participants: 450 },
        { name: 'USDC/STX Bridge', tvl: '450k STX', apy: '24.2%', participants: 125 },
        { name: 'Governance Rewards', tvl: '890k STX', apy: '12.0%', participants: 890 }
    ];

    return (
        <div className="container mx-auto px-6 py-12 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <div className="flex items-center space-x-2 text-primary-400 mb-2">
                        <Pickaxe size={20} className="animate-spin-slow" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Protocol Incentives</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white font-display">Liquidity Mining</h1>
                    <p className="text-slate-400 mt-2">Provision deep liquidity to markets and earn pro-rata rewards.</p>
                </div>

                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center space-x-6 backdrop-blur-xl">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Rewards Distributed</p>
                        <p className="text-3xl font-black text-white">450,231 STX</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center text-primary-400">
                        <Coins size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pools.map((pool, idx) => (
                    <div key={idx} className="glass-morphism rounded-[2rem] p-8 border border-white/10 hover:border-primary-500/30 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <TrendingUp size={120} />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-6 pr-12">{pool.name}</h3>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Total Value Locked</span>
                                <span className="text-lg font-black text-white">{pool.tvl}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Estimated APY</span>
                                <span className="text-2xl font-black text-emerald-400 animate-pulse">{pool.apy}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <div className="flex items-center space-x-2 text-slate-400">
                                    <Users size={14} />
                                    <span className="text-[10px] font-bold">{pool.participants} LP Providers</span>
                                </div>
                                <button className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors">
                                    <span className="text-[10px] font-black uppercase tracking-widest">Provision</span>
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
