import React from 'react';
import { Settings, Sliders, ShieldCheck, Edit3, HelpCircle, Save } from 'lucide-react';

interface Param {
    id: string;
    label: string;
    value: string;
    description: string;
    editable: boolean;
}

/**
 * Interface for viewing and proposing changes to protocol-wide parameters (fees, resolution times, etc.).
 */
export const ProtocolParams: React.FC = () => {
    const params: Param[] = [
        { id: 'fee_p', label: 'Protocol Fee', value: '2.5%', description: 'The percentage of each stake redirected to the DAO treasury.', editable: true },
        { id: 'res_w', label: 'Resolution window', value: '24 Hours', description: 'Time allowed for oracle data verification before final settlement.', editable: true },
        { id: 'min_q', label: 'Minimum Quorum', value: '500K STX', description: 'Minimum voting weight required for governance proposal validity.', editable: false },
        { id: 'oracle_v', label: 'Oracle Version', value: 'v2.1.4', description: 'Currently active resolution engine firmware.', editable: false }
    ];

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-10 relative overflow-hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <Settings size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Protocol Parameters</h3>
                </div>
                <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2">
                    <Save size={14} />
                    <span>Propose Changes</span>
                </button>
            </div>

            <div className="space-y-4">
                {params.map((p) => (
                    <div key={p.id} className="group p-6 bg-white/2 rounded-[2rem] border border-white/5 hover:bg-white/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-3">
                                <h4 className="text-sm font-black text-white uppercase tracking-tight">{p.label}</h4>
                                {!p.editable && <ShieldCheck size={14} className="text-emerald-500" />}
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md">{p.description}</p>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-1">CURRENT VALUE</p>
                                <p className="text-lg font-black text-white">{p.value}</p>
                            </div>
                            {p.editable && (
                                <button className="p-3 bg-white/5 rounded-xl text-slate-700 hover:text-white transition-colors border border-white/5">
                                    <Edit3 size={16} />
                                </button>
                            )}
                        </div>

                        {/* Hover Help Info */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <HelpCircle size={14} className="text-slate-800" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-slate-950/80 rounded-[2rem] border border-white/5 flex items-center justify-center space-x-4">
                <Sliders size={18} className="text-indigo-400" />
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                    Adjusting these values requires a formal governance proposal and 7-day vote.
                </p>
            </div>
        </div>
    );
};
