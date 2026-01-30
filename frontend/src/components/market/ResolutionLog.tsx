import React from 'react';
import { History, ShieldCheck, CheckCircle2, AlertCircle, Hash, ExternalLink } from 'lucide-react';

interface LogEntry {
    id: string;
    marketId: string;
    resolver: string;
    outcome: string;
    timestamp: string;
    txId: string;
}

/**
 * Audit log for market resolutions, providing transparency into the platform's decision history.
 */
export const ResolutionLog: React.FC = () => {
    const logs: LogEntry[] = [
        {
            id: 'l1',
            marketId: 'M-1024',
            resolver: 'Governance Committee',
            outcome: 'YES',
            timestamp: '2026-01-28 14:00',
            txId: '0xabc...123'
        },
        {
            id: 'l2',
            marketId: 'M-1025',
            resolver: 'External Oracle (Chainlink)',
            outcome: 'NO',
            timestamp: '2026-01-29 09:30',
            txId: '0xdef...456'
        }
    ];

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <History size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Resolution Audit</h3>
                </div>
                <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2">
                    <ShieldCheck size={14} />
                    <span>VERIFIED IMMUTABLE</span>
                </div>
            </div>

            <div className="space-y-4">
                {logs.map((log) => (
                    <div key={log.id} className="group p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-indigo-400 border border-white/5">
                                    <Hash size={20} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold leading-tight">Market {log.marketId}</h4>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Resolved by {log.resolver}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-8">
                                <div className="text-right">
                                    <div className="flex items-center justify-end space-x-2 text-emerald-400 mb-1">
                                        <CheckCircle2 size={16} />
                                        <span className="text-sm font-black uppercase tracking-tighter">OUTCOME: {log.outcome}</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-700 font-mono italic">{log.timestamp}</p>
                                </div>

                                <a
                                    href={`https://explorer.hiro.so/txid/${log.txId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-all border border-white/5"
                                >
                                    <ExternalLink size={18} />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-start space-x-3 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-indigo-400">
                <AlertCircle size={18} className="flex-shrink-0" />
                <p className="text-[10px] leading-relaxed font-medium">
                    Resolutions are final. If you believe a resolution was reached in error, please use the Disagreement System within 24 hours of the log entry.
                </p>
            </div>
        </div>
    );
};
