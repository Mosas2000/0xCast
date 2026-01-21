import { MarketOutcome } from '../types/market';
import { calculatePotentialWinnings, calculateROI } from '../utils/calculations';
import { stxToMicroStx, microStxToStx } from '../constants/markets';

interface WinningsPreviewProps {
    stake: number;
    outcome: MarketOutcome | null;
    yesStake: number;
    noStake: number;
    className?: string;
}

export function WinningsPreview({ stake, outcome, yesStake, noStake, className = '' }: WinningsPreviewProps) {
    if (!outcome || outcome === MarketOutcome.NONE || stake === 0) {
        return (
            <div className={`p-4 bg-slate-900/50 rounded-lg border border-slate-700 ${className}`.trim()}>
                <p className="text-sm text-slate-400 text-center">
                    Select an outcome and enter a stake amount to see potential winnings
                </p>
            </div>
        );
    }

    const stakeMicroStx = stxToMicroStx(stake);
    const potentialWinnings = calculatePotentialWinnings(
        stakeMicroStx,
        yesStake,
        noStake,
        outcome
    );
    const winningsStx = microStxToStx(potentialWinnings);
    const profit = winningsStx - stake;
    const roi = calculateROI(stakeMicroStx, potentialWinnings);

    const outcomeLabel = outcome === MarketOutcome.YES ? 'YES' : 'NO';
    const outcomeColor = outcome === MarketOutcome.YES ? 'text-green-400' : 'text-red-400';

    return (
        <div className={`p-4 bg-slate-900/50 rounded-lg border border-primary-500/30 ${className}`.trim()}>
            <h4 className="text-sm font-medium text-slate-300 mb-3">Potential Winnings</h4>

            <div className="space-y-3">
                {/* Outcome */}
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">If outcome is:</span>
                    <span className={`font-medium ${outcomeColor}`}>{outcomeLabel}</span>
                </div>

                {/* Stake */}
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Your stake:</span>
                    <span className="text-white font-medium">{stake.toFixed(2)} STX</span>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-700" />

                {/* Total Payout */}
                <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">Total payout:</span>
                    <span className="text-primary-400 font-bold text-lg">{winningsStx.toFixed(2)} STX</span>
                </div>

                {/* Profit */}
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Profit:</span>
                    <span className={profit >= 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                        {profit >= 0 ? '+' : ''}{profit.toFixed(2)} STX
                    </span>
                </div>

                {/* ROI */}
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">ROI:</span>
                    <span className={roi >= 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                        {(roi * 100).toFixed(1)}%
                    </span>
                </div>
            </div>

            {/* Formula explanation */}
            <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-slate-500">
                    Winnings = (Your stake / Total {outcomeLabel} stake) × Total pool
                </p>
            </div>
        </div>
    );
}
