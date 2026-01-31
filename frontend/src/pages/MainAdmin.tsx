import React from 'react';
import { Settings, Shield, Activity, Users, Zap, AlertTriangle, ArrowRight, Gavel, Database } from 'lucide-react';
import { ProposalBuilder } from './ProposalBuilder';
import { TreasuryVault } from './TreasuryVault';
import { ProtocolParams } from './ProtocolParams';
import { SystemLogs } from './SystemLogs';
import { AdminConfig } from './AdminConfig';

/**
 * The Master Administrative Dashboard for the 0xCast protocol, orchestrating governance, security, and treasury management.
 */
export const MainAdmin: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white p-12 space-y-16">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
                <div className="space-y-6">
                    <div className="flex items-center space-x-3 text-rose-500">
                        <Shield size={24} />
                        <span className="text-xs font-black uppercase tracking-[0.4em]">Protocol Command</span>
                    </div>
                    <h1 className="text-7xl font-black font-display tracking-tighter leading-none">
                        Governance <br /> <span className="text-indigo-500 italic">Mastery.</span>
                    </h1>
                    <p className="text-slate-500 max-w-lg font-medium leading-relaxed">
                        Centralized orchestration for the decentralized future. Monitor treasury flows, adjust system parameters, and oversee the evolution of 0xCast.
                    </p>
                </div>

                <div className="flex items-center space-x-8">
                    <div className="text-right space-y-1">
                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Network Status</p>
                        <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-2xl font-black uppercase italic">Healthy</span>
                        </div>
                    </div>
                    <div className="h-16 w-[2px] bg-white/5" />
                    <div className="text-right space-y-1">
                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Active Votes</p>
                        <p className="text-2xl font-black uppercase italic">12 SIPs</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Column: Core Controls */}
                <div className="lg:col-span-8 space-y-12">
                    <ProposalBuilder />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/5 space-y-6 group hover:border-indigo-500/30 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                                    <Activity size={24} />
                                </div>
                                <ArrowRight size={20} className="text-slate-800 group-hover:text-white transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-bold uppercase tracking-tight">Active Proposals</h4>
                                <p className="text-xs text-slate-500 font-medium">Review and vote on pending protocol upgrades.</p>
                            </div>
                            <div className="pt-6 flex -space-x-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-10 h-10 rounded-xl bg-slate-900 border-2 border-slate-950 flex items-center justify-center">
                                        <Users size={16} className="text-slate-700" />
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black">
                                    +8
                                </div>
                            </div>
                        </div>

                        <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/5 space-y-6 group hover:border-rose-500/30 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-400">
                                    <AlertTriangle size={24} />
                                </div>
                                <ArrowRight size={20} className="text-slate-800 group-hover:text-white transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-bold uppercase tracking-tight">Dispute Queue</h4>
                                <p className="text-xs text-slate-500 font-medium">Resolution conflicts requiring admin oversight.</p>
                            </div>
                            <div className="px-5 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl w-fit">
                                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">3 RED FLAGS</span>
                            </div>
                        </div>
                    </div>
                    <TreasuryVault />
                    <ProtocolParams />
                </div>

                {/* Right Column: Security & Logging */}
                <div className="lg:col-span-4 space-y-12">
                    <div className="p-8 bg-indigo-600 rounded-[3rem] shadow-2xl shadow-indigo-600/20 space-y-8 relative overflow-hidden">
                        <div className="flex items-center space-x-3">
                            <Zap size={20} className="text-white" />
                            <h3 className="text-xl font-bold text-white uppercase tracking-widest">Direct Actions</h3>
                        </div>
                        <div className="space-y-4">
                            <button className="w-full p-5 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-between">
                                <span>Pause Protocol</span>
                                <AlertTriangle size={16} />
                            </button>
                            <button className="w-full p-5 bg-black/20 text-white border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black/40 transition-all active:scale-95 flex items-center justify-between">
                                <span>Manual Settle</span>
                                <Gavel size={16} />
                            </button>
                            <button className="w-full p-5 bg-black/20 text-white border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black/40 transition-all active:scale-95 flex items-center justify-between">
                                <span>Oracle Sync</span>
                                <Database size={16} />
                            </button>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-[60px] pointer-events-none" />
                    </div>

                    <AdminConfig />
                    <SystemLogs />

                    <div className="p-10 glass-morphism rounded-[3rem] border border-white/10 text-center space-y-6">
                        <div className="w-16 h-16 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/5">
                            <Settings size={24} className="text-slate-700" />
                        </div>
                        <h4 className="text-lg font-bold uppercase tracking-widest">Global Settings</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Access secondary configuration maps and legacy archive data.
                        </p>
                        <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">
                            Explore Configuration Hub
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Branding */}
            <div className="max-w-7xl mx-auto pt-24 border-t border-white/5 flex justify-between items-center opacity-30">
                <div className="text-[10px] font-black uppercase tracking-[0.6em]">0xCast Governance Engine</div>
                <div className="text-[10px] font-black uppercase tracking-[0.6em]">EST. 2026</div>
            </div>
        </div>
    );
};
