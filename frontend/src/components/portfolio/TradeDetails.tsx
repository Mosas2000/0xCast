import React from 'react';
import { Calendar, Hash, ExternalLink, ShieldCheck, TrendingUp, Inbox } from 'lucide-react';
import { AddressUtils } from '../../utils/AddressUtils';
import { Formatters } from '../../utils/Formatters';

interface TradeDetailsProps {
    trade: {
        id: string;
        marketTitle: string;
        amount: number;
        outcome: 'YES' | 'NO';
        timestamp: number;
        txId: string;
    };
    onClose: () => void;
}

/**
 * Detailed view for single trade audit and verification.
 */
export const TradeDetails: React.FC<TradeDetailsProps> = ({ trade, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
            <div className="glass-morphism rounded-[2.5rem] p-10 max-w-lg w-full border border-white/10 shadow-2xl space-y-8">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center space-x-2">
                            <Hash size={12} />
                            <span>Transaction Receipt</span>
                        </p>
                        <h2 className="text-2xl font-bold text-white leading-tight pr-6">{trade.marketTitle}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all text-xl">×</button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">STAKE AMOUNT</p>
                        <p className="text-xl font-black text-white">{Formatters.abbreviateNumber(trade.amount)} STX</p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">OUTCOME</p>
                        <div className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${trade.outcome === 'YES' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {trade.outcome}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5">
                        <div className="flex items-center space-x-3">
                            <Calendar size={18} className="text-slate-500" />
                            <span className="text-xs font-bold text-slate-300">Timestamp</span>
                        </div>
                        <span className="text-xs font-medium text-white">{new Date(trade.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5">
                        <div className="flex items-center space-x-3">
                            <ShieldCheck size={18} className="text-emerald-500" />
                            <span className="text-xs font-bold text-slate-300">Status</span>
                        </div>
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Confirmed</span>
                    </div>

                    <a
                        href={`https://explorer.hiro.so/txid/${trade.txId}?chain=mainnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-2xl border border-indigo-500/20 transition-all group"
                    >
                        <div className="flex items-center space-x-3">
                            <ExternalLink size={18} className="text-indigo-400" />
                            <span className="text-xs font-bold text-indigo-400">View on Explorer</span>
                        </div>
                        <span className="text-[10px] font-mono text-indigo-400/50 group-hover:text-indigo-400 transition-colors">
                            {AddressUtils.shorten(trade.txId, 6, 6)}
                        </span>
                    </a>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-5 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.3em] transition-all border border-white/5"
                >
                    Close Receipt
                </button>
            </div>
        </div>
    );
};
