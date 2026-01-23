interface EmptyMarketStateProps {
    onCreateMarket?: () => void;
    className?: string;
}

/**
 * Enhanced empty state for when no markets exist
 * Shows call-to-action to create first market
 */
export function EmptyMarketState({ onCreateMarket, className = '' }: EmptyMarketStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`.trim()}>
            {/* Illustration */}
            <div className="mb-6 relative">
                <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full" />
                <svg
                    className="w-32 h-32 text-slate-700 relative"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                </svg>
            </div>

            {/* Message */}
            <h3 className="text-2xl font-bold text-white mb-2">
                No Markets Yet
            </h3>
            <p className="text-slate-400 text-center max-w-md mb-8">
                Be the first to create a prediction market and start earning from your forecasting skills.
            </p>

            {/* CTA Button */}
            {onCreateMarket && (
                <button
                    onClick={onCreateMarket}
                    className="
                        px-8 py-3
                        bg-gradient-to-r from-primary-600 to-primary-700
                        hover:from-primary-700 hover:to-primary-800
                        text-white font-semibold rounded-lg
                        shadow-lg shadow-primary-500/30
                        hover:shadow-xl hover:shadow-primary-500/40
                        transition-all duration-200
                        flex items-center gap-2
                    "
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create First Market
                </button>
            )}

            {/* Feature Hints */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h4 className="text-sm font-semibold text-white mb-1">Fast Trading</h4>
                    <p className="text-xs text-slate-500">Trade on outcomes with instant execution</p>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h4 className="text-sm font-semibold text-white mb-1">Secure</h4>
                    <p className="text-xs text-slate-500">Smart contracts on Stacks blockchain</p>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h4 className="text-sm font-semibold text-white mb-1">Earn Rewards</h4>
                    <p className="text-xs text-slate-500">Win STX by predicting correctly</p>
                </div>
            </div>
        </div>
    );
}
