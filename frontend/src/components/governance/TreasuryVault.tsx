import React from 'react';
import { Landmark, Shield, TrendingUp, ArrowDownLeft, ArrowUpRight, Lock, Zap } from 'lucide-react';

/**
 * Visual representation of the protocol's decentralized treasury, tracking locked assets and incentive distributions.
 */
export const TreasuryVault: React.FC = () => {
    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-10 relative overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <Landmark size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Protocol Treasury</h3>
                </div>
                <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    MULTI-SIG PROTECTED
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-slate-950/80 rounded-[2.5rem] border border-white/5 space-y-6">
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Available Reserve</p>
                        <Lock size={14} className="text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-3xl font-black text-white">4,250,000 STX</h4>
                        <p className="text-xs font-bold text-slate-700">≈ $8,925,000.00 USD</p>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-400">
                        <TrendingUp size={14} />
                        <span>+12.4% THIS MONTH</span>
                    </div>
                </div>

                <div className="p-8 bg-white/2 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-black text-slate-700 uppercase tracking-widest">
                            <span>Incentive Pool</span>
                            <span>84% FULL</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5">
                            <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: '84%' }} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-8">
                        <button className="flex-1 flex items-center justify-center space-x-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-[9px] font-black uppercase text-white">
                            <ArrowDownLeft size={14} />
                            <span>Inflow</span>
                        </button>
                        <div className="w-4" />
                        <button className="flex-1 flex items-center justify-center space-x-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 text-[9px] font-black uppercase text-white">
                            <ArrowUpRight size={14} />
                            <span>Disburse</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 flex items-start space-x-4">
                <Shield size={18} className="text-indigo-400 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Security Protocol</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Assets are distributed across 5 cold-storage multi-sig vaults. Disbursement requires a minimum of 4 signatures from the elected Treasury Council.
                    </p>
                </div>
            </div>

            <Zap size={100} className="absolute -bottom-10 -left-10 text-white/[0.02] -rotate-12 pointer-events-none" />
        </div>
    );
};
