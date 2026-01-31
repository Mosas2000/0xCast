import React from 'react';
import { Terminal, Shield, Zap, Info, AlertTriangle, Search, Activity } from 'lucide-react';

interface LogEntry {
    id: string;
    type: 'info' | 'security' | 'protocol';
    message: string;
    timestamp: string;
    source: string;
}

/**
 * Real-time audit log of protocol-wide events, security heartbeats, and governance actions.
 */
export const SystemLogs: React.FC = () => {
    const logs: LogEntry[] = [
        { id: 'l1', type: 'info', message: 'New market proposed: "Is BTC > 100k?"', timestamp: '14:22:01', source: 'FACTORY' },
        { id: 'l2', type: 'security', message: 'Unauthorized access attempt detected from SP28...9L', timestamp: '14:20:45', source: 'AUTH_GATE' },
        { id: 'l3', type: 'protocol', message: 'DAO Treasury disburse: 50,000 STX to Oracle Pool', timestamp: '14:15:30', source: 'TREASURY' },
        { id: 'l4', type: 'info', message: 'Resolution finalized for Market #122', timestamp: '14:10:12', source: 'ORACLE_HUB' }
    ];

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'security': return <Shield size={14} className="text-rose-400" />;
            case 'protocol': return <Zap size={14} className="text-indigo-400" />;
            default: return <Info size={14} className="text-slate-500" />;
        }
    };

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8 relative overflow-hidden bg-slate-950/40">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <Terminal size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest leading-none">Protocol Sentinel</h3>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                        <Activity size={14} className="animate-pulse" />
                        <span>Live Feed</span>
                    </div>
                    <button className="p-2.5 bg-white/5 rounded-xl text-slate-700 hover:text-white transition-colors border border-white/5">
                        <Search size={16} />
                    </button>
                </div>
            </div>

            <div className="space-y-3 font-mono">
                {logs.map((l) => (
                    <div key={l.id} className="group p-4 bg-slate-950/80 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all flex items-center space-x-6 relative">
                        <div className="text-[10px] text-slate-700 font-black">{l.timestamp}</div>
                        <div className="flex items-center space-x-2">
                            {getTypeIcon(l.type)}
                            <span className={`text-[9px] font-black uppercase tracking-widest ${l.type === 'security' ? 'text-rose-400' : l.type === 'protocol' ? 'text-indigo-400' : 'text-slate-500'}`}>
                                {l.source}
                            </span>
                        </div>
                        <div className="flex-1 text-[11px] text-slate-300 group-hover:text-white transition-colors truncate">
                            {l.message}
                        </div>

                        {l.type === 'security' && (
                            <AlertTriangle size={14} className="text-rose-500 animate-bounce" />
                        )}
                    </div>
                ))}
            </div>

            <div className="p-5 bg-white/2 rounded-[2rem] border border-white/5 flex items-center justify-between">
                <div className="text-[10px] text-slate-600 font-medium italic">
                    Showing 4 of 12,884 historical events.
                </div>
                <button className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">
                    Download Audit Archive
                </button>
            </div>

            {/* Decorative Glitch Effect Background */}
            <div className="absolute top-0 right-0 w-64 h-full bg-indigo-500/[0.02] -skew-x-12 pointer-events-none" />
        </div>
    );
};
