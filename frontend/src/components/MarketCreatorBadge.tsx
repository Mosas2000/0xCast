interface MarketCreatorBadgeProps {
    creatorAddress: string;
    isCurrentUser: boolean;
    onClick?: () => void;
    className?: string;
}

export function MarketCreatorBadge({ creatorAddress, isCurrentUser, onClick, className = '' }: MarketCreatorBadgeProps) {
    const displayAddress = `${creatorAddress.slice(0, 6)}...${creatorAddress.slice(-4)}`;

    return (
        <div
            onClick={onClick}
            className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${isCurrentUser
                    ? 'bg-primary-500/20 border border-primary-500/50 text-primary-400'
                    : 'bg-slate-700/50 border border-slate-600 text-slate-300'
                } ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`.trim()}
        >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isCurrentUser ? 'bg-primary-500' : 'bg-slate-600'
                }`}>
                <span className="text-white text-xs font-bold">
                    {creatorAddress.slice(0, 1).toUpperCase()}
                </span>
            </div>

            <span className="font-medium">
                {isCurrentUser ? 'You' : displayAddress}
            </span>

            {!isCurrentUser && onClick && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            )}
        </div>
    );
}
