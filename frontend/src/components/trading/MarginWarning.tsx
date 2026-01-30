import React from 'react';
import { AlertCircle, Zap, ShieldAlert } from 'lucide-react';

interface MarginWarningProps {
    leverage: number;
    potentialLoss: number;
    onConfirmRisk: () => void;
}

/**
 * High-visibility warning component for high-leverage or high-risk trades.
 */
export const MarginWarning: React.FC<MarginWarningProps> = ({
    leverage,
    potentialLoss,
    onConfirmRisk
}) => {
    return (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4 animate-pulse-soft">
            <div className="flex items-center space-x-2 text-rose-400">
                <ShieldAlert size={20} />
                <span className="text-xs font-black uppercase tracking-[0.2em]">High Risk Warning</span>
            </div>

            <div className="space-y-1">
                <h4 className="text-white font-bold text-lg">Extreme Volatility Detection</h4>
                <p className="text-slate-400 text-xs leading-relaxed">
                    Your current position has an implied leverage of <span className="text-rose-400 font-extrabold">{leverage}x</span>.
                    A small move in the opposite direction could result in a total loss of <span className="text-white font-bold">{potentialLoss} STX</span>.
                </p>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-rose-900/20 rounded-2xl border border-rose-500/10">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 flex-shrink-0">
                    <Zap size={20} />
                </div>
                <p className="text-[10px] font-medium text-slate-300">
                    This outcome is considered "Tail Risk". Ensure you are not over-exposed to this specific event.
                </p>
            </div>

            <button
                onClick={onConfirmRisk}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-rose-500/20"
            >
                I Understand the Risk
            </button>
        </div>
    );
};
