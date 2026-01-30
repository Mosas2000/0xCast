import React from 'react';
import { Layers, Maximize2, MousePointer2, Info } from 'lucide-react';

interface OverlayProps {
    label: string;
    onExpand?: () => void;
}

/**
 * Premium overlay component for charts, providing contextual actions, full-screen triggers, and interactive tooltips.
 */
export const ChartOverlay: React.FC<OverlayProps> = ({ label, onExpand }) => {
    return (
        <div className="absolute inset-x-0 top-0 p-6 flex items-start justify-between pointer-events-none group/overlay">
            <div className="flex flex-col space-y-1 transform -translate-y-2 group-hover/overlay:translate-y-0 transition-transform duration-500">
                <div className="flex items-center space-x-2 text-white/40 group-hover/overlay:text-indigo-400 transition-colors">
                    <Layers size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
                </div>
                <p className="text-[9px] font-bold text-slate-700 uppercase tracking-tighter opacity-0 group-hover/overlay:opacity-100 transition-opacity">Live Stream Active</p>
            </div>

            <div className="flex items-center space-x-3 pointer-events-auto opacity-0 group-hover/overlay:opacity-100 transition-opacity duration-300">
                <button className="p-2.5 bg-slate-950/80 border border-white/5 rounded-xl text-slate-500 hover:text-white hover:border-white/10 transition-all backdrop-blur-md">
                    <Info size={16} />
                </button>
                <button
                    onClick={onExpand}
                    className="p-2.5 bg-indigo-600 border border-indigo-500/50 rounded-xl text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 flex items-center space-x-2"
                >
                    <Maximize2 size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest hidden md:inline">Full Analysis</span>
                </button>
            </div>

            <div className="absolute top-1/2 left-4 -translate-y-1/2 opacity-10 group-hover/overlay:opacity-30 transition-opacity pointer-events-none">
                <MousePointer2 size={60} className="text-white rotate-12" />
            </div>
        </div>
    );
};
