import React from 'react';
import { ShieldCheck, FileText, Search, ExternalLink, Database, Lock, CheckCircle } from 'lucide-react';

interface AuditEntry {
    id: string;
    source: string;
    status: 'VERIFIED' | 'REVIEW' | 'FLAGGED';
    timestamp: string;
    hash: string;
}

/**
 * Interface for auditing protocol actions, smart contract state, and oracle data sources.
 */
export const AuditPortal: React.FC = () => {
    const audits: AuditEntry[] = [
        { id: 'a1', source: 'MARKET_SETTLEMENT', status: 'VERIFIED', timestamp: 'Jan 29, 2026', hash: '0x7e...ff2d' },
        { id: 'a2', source: 'TREASURY_DISBURSE', status: 'VERIFIED', timestamp: 'Jan 28, 2026', hash: '0x3a...1c4e' },
        { id: 'a3', source: 'GOV_PROPOSAL_CREATED', status: 'REVIEW', timestamp: 'Jan 30, 2026', hash: '0x9b...de0f' }
    ];

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-10 relative overflow-hidden bg-slate-950/30">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-emerald-400">
                    <ShieldCheck size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest leading-none">Transparency Portal</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <Database size={16} className="text-slate-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">On-Chain Evidence</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-700 uppercase tracking-widest px-4">
                        <span>Audit Target</span>
                        <span>State</span>
                    </div>
                    {audits.map((a) => (
                        <div key={a.id} className="group p-5 bg-white/2 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-white uppercase tracking-tight">{a.source}</p>
                                <p className="text-[9px] font-medium text-slate-500">{a.timestamp}</p>
                            </div>
                            <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black border ${a.status === 'VERIFIED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                {a.status}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-8 bg-slate-950/80 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-slate-500">
                                <FileText size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Audit Log ID</p>
                                <p className="text-xs font-mono text-white">#LOG-884-219-X</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Cryptographic Seal</p>
                            <div className="p-4 bg-white/2 border border-white/5 rounded-xl flex items-center justify-between">
                                <code className="text-[10px] text-slate-400 truncate max-w-[150px]">0x72a...f19c28</code>
                                <Lock size={12} className="text-indigo-400" />
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-8 py-3 bg-white hover:bg-slate-200 text-slate-950 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-2">
                        <Search size={14} />
                        <span>Verify State Proof</span>
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center space-x-4 text-[10px] text-slate-500 font-medium">
                    <div className="flex items-center space-x-2">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span>Immutable</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span>Provable</span>
                    </div>
                </div>
                <button className="flex items-center space-x-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">
                    <span>Explorer</span>
                    <ExternalLink size={12} />
                </button>
            </div>
        </div>
    );
};
