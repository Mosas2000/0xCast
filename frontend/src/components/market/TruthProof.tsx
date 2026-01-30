import React from 'react';
import { ShieldCheck, Lock, Fingerprint, Database, CheckCircle, ExternalLink } from 'lucide-react';

/**
 * Visual verification of on-chain resolution proof, connecting the market outcome to the immutable data source.
 */
export const TruthProof: React.FC = () => {
    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-emerald-400">
                    <ShieldCheck size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Verification Proof</h3>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    VERIFIED BY ORACLE
                </div>
            </div>

            <div className="p-8 bg-slate-950/80 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/5 rounded-xl text-slate-500 border border-white/5">
                            <Fingerprint size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">State Root Hash</p>
                            <p className="text-sm font-mono text-white truncate max-w-[200px]">0x72a...f19c28</p>
                        </div>
                    </div>
                    <CheckCircle size={20} className="text-emerald-500" />
                </div>

                <div className="h-[1px] w-full bg-white/5" />

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                            <Database size={12} />
                            <span>Data Source</span>
                        </div>
                        <p className="text-sm font-bold text-white">Chainlink Price Feed</p>
                    </div>
                    <div className="space-y-2 text-right">
                        <div className="flex items-center justify-end space-x-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                            <Lock size={12} />
                            <span>Encryption</span>
                        </div>
                        <p className="text-sm font-bold text-white">AES-256GCM</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col space-y-3">
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    The market resolution was finalized at block <span className="text-white">#142,884</span>. The cryptographic proof of the outcome is publicly visible on the Stacks blockchain.
                </p>
                <button className="flex items-center space-x-2 text-[10px] font-black text-indigo-400 hover:text-white transition-colors uppercase tracking-widest">
                    <span>View on Explorer</span>
                    <ExternalLink size={12} />
                </button>
            </div>

            {/* Decorative Proof String */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[60px] font-black text-white/[0.02] whitespace-nowrap pointer-events-none select-none italic uppercase">
                IMMUTABLE PROOF OF TRUTH
            </div>
        </div>
    );
};
