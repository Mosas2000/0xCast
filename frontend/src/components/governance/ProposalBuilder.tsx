import React, { useState } from 'react';
import { ClipboardList, PlusCircle, CheckCircle, Info, ShieldCheck, Zap } from 'lucide-react';

/**
 * Interactive proposal creation wizard for decentralized protocol governance.
 */
export const ProposalBuilder: React.FC = () => {
    const [step, setStep] = useState(1);

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-10 relative overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <ClipboardList size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Proposal Studio</h3>
                </div>
                <div className="flex items-center space-x-2">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">DAO COMPLIANT</span>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between relative px-10">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5 -translate-y-1/2" />
                {[1, 2, 3].map((s) => (
                    <div
                        key={s}
                        className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500 ${step >= s ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-950 border-white/10 text-slate-700'}`}
                    >
                        {step > s ? <CheckCircle size={18} /> : <span className="text-sm font-black">{s}</span>}
                    </div>
                ))}
            </div>

            <div className="p-8 bg-white/2 rounded-[2.5rem] border border-white/5 space-y-6 min-h-[300px] flex flex-col justify-center">
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Proposal Title</label>
                            <input
                                type="text"
                                placeholder="e.g. Upgrade Resolution Oracle to v2.1"
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1">Abstract</label>
                            <textarea
                                placeholder="Provide a high-level summary of the proposed change..."
                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all h-32 resize-none"
                            />
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-start space-x-4">
                            <Info size={18} className="text-indigo-400 mt-0.5" />
                            <p className="text-xs text-slate-500 leading-relaxed">
                                You are proposing a <span className="text-white font-bold">Structural Change</span>. This requires a 66% majority and a minimum 7-day voting window.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5 text-center">
                                <p className="text-[9px] font-black text-slate-700 uppercase mb-1">Min. Quorum</p>
                                <p className="text-lg font-black text-white">500,000 STX</p>
                            </div>
                            <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5 text-center">
                                <p className="text-[9px] font-black text-slate-700 uppercase mb-1">Voting Power</p>
                                <p className="text-lg font-black text-white">Weighted vStacks</p>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto border border-emerald-500/20">
                            <CheckCircle size={32} />
                        </div>
                        <h4 className="text-xl font-bold text-white">Ready to Broaden</h4>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto">Your proposal is prepared. Signing the transaction will submit it to the voting pool.</p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between">
                <button
                    onClick={() => setStep(Math.max(1, step - 1))}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-white'}`}
                >
                    Back
                </button>
                <button
                    onClick={() => step < 3 ? setStep(step + 1) : null}
                    className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2 active:scale-95"
                >
                    <span>{step === 3 ? 'Draft Proposal' : 'Continue'}</span>
                    {step < 3 ? <Zap size={14} /> : <PlusCircle size={14} />}
                </button>
            </div>

            {/* Decorative Blur */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />
        </div>
    );
};
