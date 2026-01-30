import React, { useState } from 'react';
import { ArrowLeftRight, Coins, ShieldCheck, Zap, ArrowDown, Info, Lock } from 'lucide-react';

/**
 * Interface for cross-chain bridging of assets between Stacks and other L1/L2 ecosystems.
 */
export const BridgeUI: React.FC = () => {
    const [amount, setAmount] = useState('0');

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-10 relative overflow-hidden bg-slate-950/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <ArrowLeftRight size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest leading-none">Cross-Chain Gateway</h3>
                </div>
                <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    BITCOIN L2 SETTLED
                </div>
            </div>

            <div className="space-y-4">
                {/* Source Chain */}
                <div className="p-8 bg-slate-950/80 rounded-[2.5rem] border border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-700 uppercase tracking-widest px-2">
                        <span>From</span>
                        <span className="text-white">Stacks Mainnet</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-transparent text-4xl font-black text-white outline-none w-full"
                            placeholder="0.00"
                        />
                        <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-2xl border border-white/5">
                            <Coins size={20} className="text-indigo-400" />
                            <span className="text-sm font-black text-white">STX</span>
                        </div>
                    </div>
                </div>

                {/* Transition Icon */}
                <div className="flex justify-center -my-6 relative z-10">
                    <div className="p-4 bg-indigo-600 rounded-2xl border border-white/10 text-white shadow-xl shadow-indigo-600/30">
                        <ArrowDown size={20} />
                    </div>
                </div>

                {/* Destination Chain */}
                <div className="p-8 bg-slate-950/80 rounded-[2.5rem] border border-white/5 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-700 uppercase tracking-widest px-2">
                        <span>To (Wrapped Asset)</span>
                        <span className="text-indigo-400">Bitcoin (sBTC)</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-4xl font-black text-white/40">{(Number(amount) * 0.998).toFixed(4)}</p>
                        <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-2xl border border-white/5 opacity-50">
                            <Coins size={20} className="text-amber-400" />
                            <span className="text-sm font-black text-white">sBTC</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white/2 rounded-[2rem] border border-white/5 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-700">Bridge Fee</span>
                    <span className="text-white">0.2% STX</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-700">Estimated Time</span>
                    <span className="text-white">≈ 15 Minutes</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
                <button className="flex-1 w-full px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center space-x-2">
                    <Lock size={16} />
                    <span>Approve & Lock STX</span>
                </button>
            </div>

            <div className="p-5 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 flex items-start space-x-4">
                <ShieldCheck size={18} className="text-indigo-400 mt-0.5" />
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Assets are secured by the 0xCast multi-signature bridge nodes. Settlement occurs periodically on the Bitcoin network via Stacks consensus.
                </p>
            </div>

            <Zap size={100} className="absolute -top-10 -right-10 text-white/[0.02] rotate-45 pointer-events-none" />
        </div>
    );
};
