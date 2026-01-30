import React, { useState } from 'react';
import { Flag, AlertCircle, ShieldAlert, Check, X, Info } from 'lucide-react';

interface ReportModalProps {
    contentId: string;
    contentType: 'market' | 'comment' | 'user';
    onClose: () => void;
    onSubmit: (reason: string) => void;
}

/**
 * Community moderation tool for reporting suspicious or harmful content.
 */
export const ReportModal: React.FC<ReportModalProps> = ({
    contentId,
    contentType,
    onClose,
    onSubmit
}) => {
    const [reason, setReason] = useState('');
    const [step, setStep] = useState(1);

    const reasons = [
        'Inaccurate Market Resolution',
        'Spam or Malicious Links',
        'Harassment or Hate Speech',
        'Misleading Description',
        'Other'
    ];

    const handleSubmit = () => {
        onSubmit(reason);
        setStep(2);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl">
            <div className="glass-morphism rounded-[2.5rem] p-10 max-w-md w-full border border-white/10 shadow-2xl space-y-8 animate-float">

                {step === 1 ? (
                    <>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3 text-rose-500">
                                <Flag size={20} />
                                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Report {contentType}</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-700 hover:text-white transition-all"><X size={20} /></button>
                        </div>

                        <p className="text-slate-400 text-xs leading-relaxed">
                            Help us keep 0xCast a safe and decentralized environment. Our moderators will review this {contentType} manually.
                        </p>

                        <div className="space-y-3">
                            {reasons.map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setReason(r)}
                                    className={`w-full p-4 rounded-2xl border text-left text-xs font-bold transition-all ${reason === r ? 'bg-rose-500/10 border-rose-500/50 text-white shadow-lg shadow-rose-500/10' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/10'}`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col space-y-3 pt-4">
                            <button
                                onClick={handleSubmit}
                                disabled={!reason}
                                className="w-full py-5 bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-rose-600/20 transition-all active:scale-95 flex items-center justify-center space-x-2"
                            >
                                <span>Submit Report</span>
                                <ShieldAlert size={18} />
                            </button>
                            <div className="flex items-center justify-center space-x-2 text-[9px] text-slate-700 font-black uppercase tracking-widest">
                                <Info size={12} />
                                <span>Reports are recorded on the Moderator Chain</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center space-y-6 py-8">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mx-auto border border-emerald-500/20 animate-pulse">
                            <Check size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Report Received</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                Thank you for your vigilance. Our moderation decentralized committee has been notified.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5"
                        >
                            CLOSE
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
