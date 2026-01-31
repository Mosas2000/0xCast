import React, { useState } from 'react';
import { Palette, Check, Sparkles, Moon, Sun, Zap } from 'lucide-react';

interface Theme {
    id: string;
    name: string;
    preview: string;
    colors: { primary: string; background: string; accent: string };
    locked?: boolean;
}

/**
 * Customizable profile themes for users to express their identity and social status.
 */
export const ProfileThemes: React.FC = () => {
    const [selected, setSelected] = useState('glass');

    const themes: Theme[] = [
        { id: 'glass', name: 'Glassmorphism', preview: 'bg-white/10', colors: { primary: '#fff', background: '#0f172a', accent: '#6366f1' } },
        { id: 'neon', name: 'Neon Nights', preview: 'bg-fuchsia-500/20', colors: { primary: '#fb7185', background: '#020617', accent: '#f43f5e' } },
        { id: 'emerald', name: 'Forest Green', preview: 'bg-emerald-500/20', colors: { primary: '#34d399', background: '#064e3b', accent: '#10b981' } },
        { id: 'gold', name: 'Royal Gold', preview: 'bg-amber-500/20', colors: { primary: '#fbbf24', background: '#1c1917', accent: '#f59e0b' }, locked: true },
        { id: 'void', name: 'Infinite Void', preview: 'bg-slate-900', colors: { primary: '#94a3b8', background: '#000', accent: '#1e293b' } }
    ];

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <Palette size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Aesthetic Control</h3>
                </div>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                    <button className="p-2 text-indigo-400"><Moon size={16} /></button>
                    <button className="p-2 text-slate-700"><Sun size={16} /></button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {themes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => !theme.locked && setSelected(theme.id)}
                        className={`relative flex flex-col items-center p-4 rounded-[2rem] border transition-all duration-500 group ${selected === theme.id ? 'bg-indigo-600/10 border-indigo-500/50 scale-105' : 'bg-white/2 border-white/5 hover:bg-white/5'}`}
                    >
                        <div className={`w-12 h-12 rounded-2xl ${theme.preview} mb-4 flex items-center justify-center border border-white/10 shadow-inner group-hover:rotate-12 transition-transform`}>
                            {selected === theme.id && <Check size={20} className="text-indigo-400" />}
                            {theme.locked && <Sparkles size={16} className="text-amber-500 animate-pulse" />}
                        </div>

                        <span className={`text-[10px] font-black uppercase tracking-tighter ${selected === theme.id ? 'text-indigo-400' : 'text-slate-600'}`}>
                            {theme.name}
                        </span>

                        {theme.locked && (
                            <div className="absolute inset-0 bg-slate-950/40 rounded-[2rem] backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[8px] font-black bg-amber-500 text-black px-2 py-0.5 rounded-full">PREMIUM</span>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            <div className="flex items-center space-x-4 p-6 bg-slate-950/80 rounded-[2rem] border border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-xl border border-indigo-500/20">
                    <Zap size={24} />
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm">Real-time Preview</h4>
                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest leading-relaxed">Changes are applied immediately to your public profile.</p>
                </div>
                <button className="ml-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">SAVE THEME</button>
            </div>
        </div>
    );
};
