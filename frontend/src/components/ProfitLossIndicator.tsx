interface ProfitLossIndicatorProps {
    amount: number; // in STX
    percentage: number; // as decimal (e.g., 0.25 = 25%)
    className?: string;
}

export function ProfitLossIndicator({ amount, percentage, className = '' }: ProfitLossIndicatorProps) {
    const isProfit = amount > 0;
    const isLoss = amount < 0;
    const isNeutral = amount === 0;

    const colorClass = isProfit
        ? 'text-green-400'
        : isLoss
            ? 'text-red-400'
            : 'text-slate-400';

    const bgClass = isProfit
        ? 'bg-green-500/10'
        : isLoss
            ? 'bg-red-500/10'
            : 'bg-slate-500/10';

    const borderClass = isProfit
        ? 'border-green-500/30'
        : isLoss
            ? 'border-red-500/30'
            : 'border-slate-500/30';

    const formattedAmount = Math.abs(amount).toFixed(2);
    const formattedPercentage = (Math.abs(percentage) * 100).toFixed(1);

    return (
        <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${bgClass} ${borderClass} ${className}`.trim()}>
            {/* Arrow Icon */}
            {!isNeutral && (
                <svg
                    className={`w-4 h-4 ${colorClass}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isProfit ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                    )}
                </svg>
            )}

            {/* Amount and Percentage */}
            <div className={`font-medium ${colorClass}`}>
                <span>
                    {isProfit && '+'}
                    {isLoss && '-'}
                    {formattedAmount} STX
                </span>
                <span className="text-sm ml-1">
                    ({isProfit && '+'}
                    {isLoss && '-'}
                    {formattedPercentage}%)
                </span>
            </div>
        </div>
    );
}
