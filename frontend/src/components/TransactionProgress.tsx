import { TxStatus } from '../hooks/useTransactionStatus';

interface TransactionProgressProps {
    status: TxStatus;
    className?: string;
}

const STEPS = [
    { key: TxStatus.BROADCASTING, label: 'Broadcasting', estimate: '~5s' },
    { key: TxStatus.PENDING, label: 'Pending', estimate: '~30s' },
    { key: TxStatus.SUCCESS, label: 'Confirmed', estimate: 'Done' },
];

/**
 * Progress bar for transaction confirmation
 * Shows: Broadcasting → Pending → Confirmed with step indicators
 */
export function TransactionProgress({ status, className = '' }: TransactionProgressProps) {
    const getCurrentStepIndex = () => {
        if (status === TxStatus.FAILED) return -1;
        return STEPS.findIndex(step => step.key === status);
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
        <div className={`space-y-4 ${className}`.trim()}>
            {/* Progress Bar */}
            <div className="relative">
                <div className="absolute inset-0 bg-slate-700 rounded-full h-2" />
                <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full h-2 transition-all duration-500 ease-out"
                    style={{
                        width: status === TxStatus.FAILED
                            ? '0%'
                            : status === TxStatus.SUCCESS
                                ? '100%'
                                : `${((currentStepIndex + 1) / STEPS.length) * 100}%`,
                    }}
                />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between">
                {STEPS.map((step, index) => {
                    const isActive = index === currentStepIndex;
                    const isComplete = index < currentStepIndex;
                    const isFailed = status === TxStatus.FAILED;

                    return (
                        <div key={step.key} className="flex flex-col items-center flex-1">
                            {/* Circle Indicator */}
                            <div
                                className={`
                                    relative w-8 h-8 rounded-full flex items-center justify-center
                                    transition-all duration-300
                                    ${isComplete
                                        ? 'bg-green-600 ring-2 ring-green-600/30'
                                        : isActive
                                            ? 'bg-blue-600 ring-4 ring-blue-600/30 animate-pulse'
                                            : isFailed
                                                ? 'bg-slate-700'
                                                : 'bg-slate-700'
                                    }
                                `}
                            >
                                {isComplete ? (
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : isActive ? (
                                    <div className="w-3 h-3 bg-white rounded-full animate-ping absolute" />
                                ) : (
                                    <span className="text-xs text-slate-400 font-medium">{index + 1}</span>
                                )}
                            </div>

                            {/* Label */}
                            <div className="mt-2 text-center">
                                <p
                                    className={`
                                        text-xs font-medium
                                        ${isComplete || isActive ? 'text-white' : 'text-slate-500'}
                                    `}
                                >
                                    {step.label}
                                </p>
                                {isActive && (
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {step.estimate}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Failed State */}
            {status === TxStatus.FAILED && (
                <div className="flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span className="text-sm text-red-400 font-medium">Transaction Failed</span>
                </div>
            )}
        </div>
    );
}
