interface ConnectionErrorProps {
    error: string;
    onRetry: () => void;
    className?: string;
}

export function ConnectionError({ error, onRetry, className = '' }: ConnectionErrorProps) {
    return (
        <div className={`bg-slate-800 border border-slate-700 rounded-xl p-8 text-center ${className}`.trim()}>
            <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Wallet Connection Error</h3>
            <p className="text-slate-400 mb-6">{error}</p>

            <button
                onClick={onRetry}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors mb-4"
            >
                Retry Connection
            </button>

            <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-sm text-slate-500 mb-2">Need help?</p>
                <div className="flex justify-center space-x-4 text-sm">
                    <a
                        href="https://www.hiro.so/wallet/install-web"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300 transition-colors"
                    >
                        Install Wallet
                    </a>
                    <span className="text-slate-600">|</span>
                    <a
                        href="https://docs.hiro.so/stacks-wallet-web"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300 transition-colors"
                    >
                        Troubleshooting
                    </a>
                </div>
            </div>
        </div>
    );
}
