interface NetworkIndicatorProps {
    isConnected: boolean;
    network?: 'mainnet' | 'testnet';
    className?: string;
}

export function NetworkIndicator({ isConnected, network = 'mainnet', className = '' }: NetworkIndicatorProps) {
    const isWrongNetwork = network !== 'mainnet';

    return (
        <div className={`flex items-center space-x-2 ${className}`.trim()}>
            {/* Connection Status Dot */}
            <div className="relative">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'
                    }`} />
                {isConnected && (
                    <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping opacity-75" />
                )}
            </div>

            {/* Network Label */}
            <span className={`text-xs font-medium ${isWrongNetwork ? 'text-orange-400' : 'text-slate-400'
                }`}>
                {network.charAt(0).toUpperCase() + network.slice(1)}
            </span>

            {/* Warning Icon for Wrong Network */}
            {isWrongNetwork && (
                <div className="group relative">
                    <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Please switch to Mainnet
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
                    </div>
                </div>
            )}
        </div>
    );
}
