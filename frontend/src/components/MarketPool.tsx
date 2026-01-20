import { formatStakeAmount, getTotalPoolSize } from '../utils/contractHelpers';

interface MarketPoolProps {
    totalYesStake: number;
    totalNoStake: number;
    className?: string;
}

export function MarketPool({ totalYesStake, totalNoStake, className = '' }: MarketPoolProps) {
    const totalPool = getTotalPoolSize(totalYesStake, totalNoStake);

    if (totalPool === 0) {
        return (
            <div className={`text-center ${className}`.trim()}>
                <p className="text-2xl font-bold text-slate-600">0 STX</p>
                <p className="text-sm text-slate-500 mt-1">No stakes yet</p>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="text-center mb-3">
                <p className="text-sm text-slate-400 mb-1">Total Pool</p>
                <p className="text-3xl font-bold text-white">{formatStakeAmount(totalPool)}</p>
            </div>

            <div className="flex justify-between text-sm">
                <div className="text-center flex-1">
                    <p className="text-green-400 font-medium">{formatStakeAmount(totalYesStake)}</p>
                    <p className="text-slate-500 text-xs">on YES</p>
                </div>

                <div className="text-slate-600 flex items-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                    </svg>
                </div>

                <div className="text-center flex-1">
                    <p className="text-red-400 font-medium">{formatStakeAmount(totalNoStake)}</p>
                    <p className="text-slate-500 text-xs">on NO</p>
                </div>
            </div>
        </div>
    );
}
