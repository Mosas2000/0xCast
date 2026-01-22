interface BalanceWarningProps {
    balance: number; // in microSTX
    required: number; // in microSTX
    className?: string;
}

const MINIMUM_BALANCE_BUFFER = 100_000; // 0.1 STX buffer for gas

/**
 * Warning component when wallet balance is insufficient
 * Shows if balance is too low for the required stake
 */
export function BalanceWarning({ balance, required, className = '' }: BalanceWarningProps) {
    const totalRequired = required + MINIMUM_BALANCE_BUFFER;
    const isInsufficient = balance < totalRequired;

    if (!isInsufficient) {
        return null;
    }

    const shortfall = (totalRequired - balance) / 1_000_000;
    const minimumSuggested = (totalRequired / 1_000_000).toFixed(2);

    return (
        <div className={`p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg ${className}`.trim()}>
            <div className="flex items-start gap-3">
                <svg
                    className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-yellow-400 mb-1">
                        Insufficient Balance
                    </h4>
                    <p className="text-xs text-yellow-400/80 mb-2">
                        Your balance is too low for this transaction. You need at least{' '}
                        <span className="font-bold">{minimumSuggested} STX</span> (including gas fees).
                    </p>
                    <p className="text-xs text-yellow-400/70">
                        Short by: <span className="font-semibold">{shortfall.toFixed(2)} STX</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
