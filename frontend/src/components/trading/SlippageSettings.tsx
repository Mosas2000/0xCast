import React, { useState } from 'react';

interface SlippageSettingsProps {
    currentSlippage: number;
    onSlippageChange: (value: number) => void;
}

/**
 * Component for setting trade slippage tolerance.
 */
export const SlippageSettings: React.FC<SlippageSettingsProps> = ({
    currentSlippage,
    onSlippageChange
}) => {
    const [customValue, setCustomValue] = useState(currentSlippage.toString());
    const options = [0.1, 0.5, 1.0];

    return (
        <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5 space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-300">Slippage Tolerance</span>
                <span className="text-sm font-bold text-primary-400">{currentSlippage}%</span>
            </div>
            <div className="flex gap-2">
                {options.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => {
                            onSlippageChange(opt);
                            setCustomValue(opt.toString());
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${currentSlippage === opt
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                            }`}
                    >
                        {opt}%
                    </button>
                ))}
                <div className="flex-1 relative">
                    <input
                        type="number"
                        value={customValue}
                        onChange={(e) => {
                            setCustomValue(e.target.value);
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) onSlippageChange(val);
                        }}
                        className="w-full py-1.5 pl-2 pr-6 rounded-lg bg-slate-700 text-xs font-bold text-white border border-transparent focus:border-primary-500 outline-none transition-all"
                        placeholder="Custom"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">%</span>
                </div>
            </div>
        </div>
    );
};
