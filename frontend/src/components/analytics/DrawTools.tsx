import React from 'react';
import { MousePointer2, Pencil, Type, Trash2, Square, Circle, Minus, Move } from 'lucide-react';

/**
 * Interactive drawing and annotation toolbar for advanced market charts.
 */
export const DrawTools: React.FC = () => {
    const tools = [
        { id: 'select', icon: MousePointer2, label: 'SELECT' },
        { id: 'draw', icon: Pencil, label: 'DRAW' },
        { id: 'text', icon: Type, label: 'TEXT' },
        { id: 'line', icon: Minus, label: 'TREND LINE' },
        { id: 'rect', icon: Square, label: 'ZONE' },
        { id: 'circle', icon: Circle, label: 'TARGET' }
    ];

    return (
        <div className="glass-morphism rounded-2xl p-2 border border-white/10 shadow-2xl flex flex-col space-y-2 w-14 group">
            {tools.map((t) => (
                <button
                    key={t.id}
                    className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/2 hover:bg-indigo-600 hover:text-white text-slate-500 transition-all group-hover/btn:scale-110 group/btn"
                    title={t.label}
                >
                    <t.icon size={18} />
                    {/* Tooltip */}
                    <div className="absolute left-14 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg text-[9px] font-black text-white whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none z-50">
                        {t.label}
                    </div>
                </button>
            ))}
            <div className="h-[1px] bg-white/5 mx-2" />
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/2 hover:bg-rose-500 hover:text-white text-slate-700 transition-all">
                <Trash2 size={18} />
            </button>
        </div>
    );
};
