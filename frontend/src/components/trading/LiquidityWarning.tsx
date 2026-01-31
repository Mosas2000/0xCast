import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface LiquidityWarningProps {
    impact: number;
}

/**
 * Visual warning for high price impact or low market depth.
 */
export const LiquidityWarning: React.FC<LiquidityWarningProps> = ({ impact }) => {
    if (impact < 5) return null;

    const isSevere = impact > 15;

    return (
        <div className={`p-3 rounded-xl border flex items-start space-x-3 animate-pulse-soft ${isSevere
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
                <p className="text-xs font-bold uppercase tracking-tight">
                    High Price Impact: {impact.toFixed(2)}%
                </p>
                <p className="text-[10px] opacity-80 leading-tight mt-1">
                    {isSevere
                        ? 'Execution price will be significantly worse than market price.'
                        : 'Market depth is low. Consider trading in smaller amounts.'}
                </p>
            </div>
        </div>
    );
};
