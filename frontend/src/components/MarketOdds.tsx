import { ProgressBar } from './ProgressBar';
import { calculateOdds } from '../utils/contractHelpers';

interface MarketOddsProps {
    yesStake: number;
    noStake: number;
    className?: string;
}

export function MarketOdds({ yesStake, noStake, className = '' }: MarketOddsProps) {
    const totalPool = yesStake + noStake;

    if (totalPool === 0) {
        return (
            <div className={`text-center py-4 ${className}`.trim()}>
                <p className="text-sm text-slate-400">No stakes yet</p>
                <p className="text-xs text-slate-500 mt-1">Be the first to stake!</p>
            </div>
        );
    }

    const odds = calculateOdds(yesStake, noStake);

    return (
        <div className={className}>
            <div className="space-y-3">
                <ProgressBar
                    percentage={odds.yes}
                    label="YES"
                    color="green"
                />

                <ProgressBar
                    percentage={odds.no}
                    label="NO"
                    color="red"
                />
            </div>

            <div className="mt-3 flex justify-between text-xs text-slate-500">
                <span>Current odds based on stake distribution</span>
            </div>
        </div>
    );
}
