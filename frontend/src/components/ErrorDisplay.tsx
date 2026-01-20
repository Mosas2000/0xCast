interface ErrorDisplayProps {
    error: string;
    onRetry?: () => void;
    className?: string;
}

export function ErrorDisplay({ error, onRetry, className = '' }: ErrorDisplayProps) {
    return (
        <div className={`bg-red-500/10 border border-red-500/50 rounded-lg p-6 ${className}`.trim()}>
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    <svg
                        className="w-6 h-6 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>

                <div className="flex-1">
                    <h3 className="text-sm font-medium text-red-400 mb-1">Error</h3>
                    <p className="text-sm text-red-300">{error}</p>

                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
