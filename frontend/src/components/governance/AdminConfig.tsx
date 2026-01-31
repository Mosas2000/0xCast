import React from 'react';
import { Shield, Key, Users, Settings, Plus, Trash2, CheckCircle, Info } from 'lucide-react';

interface RoleEntry {
    address: string;
    role: string;
    since: string;
}

/**
 * Administrative interface for managing protocol roles, white-listing addresses, and managing core security keys.
 */
export const AdminConfig: React.FC = () => {
    const roles: RoleEntry[] = [
        { address: 'SP1P...K8L3', role: 'ADMIN', since: 'Jan 01' },
        { address: 'SP2T...W9N4', role: 'ORACLE', since: 'Jan 05' },
        { address: 'SP3Q...R2V7', role: 'MODERATOR', since: 'Jan 10' }
    ];

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-10 relative overflow-hidden bg-slate-950/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-rose-400">
                    <Shield size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Core Administration</h3>
                </div>
                <button className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 transition-all flex items-center space-x-2">
                    <Plus size={14} />
                    <span>Grant Access</span>
                </button>
            </div>

            <div className="p-8 bg-slate-950/80 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-700 uppercase tracking-widest px-4">
                    <span>Participant Address</span>
                    <div className="flex items-center space-x-20">
                        <span>Role</span>
                        <span>Actions</span>
                    </div>
                </div>
                <div className="space-y-3">
                    {roles.map((r, i) => (
                        <div key={i} className="group p-5 bg-white/2 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
                            <code className="text-[11px] text-slate-300 font-mono">{r.address}</code>
                            <div className="flex items-center space-x-12">
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${r.role === 'ADMIN' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                                    {r.role}
                                </span>
                                <button className="p-2 bg-white/5 rounded-lg text-slate-700 hover:text-rose-500 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-white/2 rounded-[2rem] border border-white/5 flex items-center space-x-4">
                    <Key size={18} className="text-indigo-400" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Multi-Sig Status</p>
                        <p className="text-xs text-slate-500 font-medium">Active: 3/5 Signers required.</p>
                    </div>
                </div>
                <div className="p-6 bg-white/2 rounded-[2rem] border border-white/5 flex items-center space-x-4">
                    <CheckCircle size={18} className="text-emerald-400" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Security Audit</p>
                        <p className="text-xs text-slate-500 font-medium">Last Audit: 48h ago. No leaks.</p>
                    </div>
                </div>
            </div>

            <div className="p-5 bg-rose-500/5 rounded-[2rem] border border-rose-500/10 flex items-start space-x-3">
                <Info size={16} className="text-rose-400 mt-0.5" />
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    Administrative actions are logged and broadcasted to the community in real-time. Unauthorized role modifications will trigger an immediate circuit-breaker pause.
                </p>
            </div>

            <Settings size={60} className="absolute -bottom-8 -right-8 text-white/[0.02] animate-[spin_10s_linear_infinite] pointer-events-none" />
        </div>
    );
};
