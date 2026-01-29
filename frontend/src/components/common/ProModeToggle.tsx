import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Zap } from 'lucide-react';

interface ProModeToggleProps {
    initialState?: boolean;
    onToggle?: (isPro: boolean) => void;
}

/**
 * High-end toggle for switching between 'Normal' and 'Pro' application modes.
 */
export const ProModeToggle: React.FC<ProModeToggleProps> = ({
    initialState = false,
    onToggle
}) => {
    const [isPro, setIsPro] = useState(initialState);

    const handleToggle = () => {
        const newState = !isPro;
        setIsPro(newState);
        onToggle?.(newState);
    };

    return (
        <div className="flex items-center space-x-3 bg-slate-900 border border-white/5 p-1.5 rounded-2xl">
            <div className={`p-1.5 rounded-xl transition-all ${isPro ? 'text-slate-600' : 'bg-white/5 text-primary-400'}`}>
                <span className="text-[10px] font-black uppercase tracking-widest px-1">Basic</span>
            </div>

            <button
                onClick={handleToggle}
                className={`relative flex items-center transition-all ${isPro ? 'text-primary-500' : 'text-slate-700'}`}
            >
                {isPro ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </button>

            <div className={`flex items-center space-x-1 p-1.5 rounded-xl transition-all ${isPro ? 'bg-primary-500/10 text-primary-400' : 'text-slate-600'}`}>
                <Zap size={10} className={isPro ? 'animate-pulse' : ''} />
                <span className="text-[10px] font-black uppercase tracking-widest px-1">Pro Mode</span>
            </div>
        </div>
    );
};
