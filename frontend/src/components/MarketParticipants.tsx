import { Market } from '../types/market';

interface MarketParticipantsProps {
    market: Market;
    className?: string;
}

export function MarketParticipants({ market, className = '' }: MarketParticipantsProps) {
    // Placeholder - would need to track unique participants
    const participantCount = 0;
    const recentParticipants: string[] = [];

    if (participantCount === 0) {
        return (
            <div className={`text-sm text-slate-500 ${className}`.trim()}>
                Be the first to stake!
            </div>
        );
    }

    return (
        <div className={`flex items-center space-x-3 ${className}`.trim()}>
            {/* Avatar List */}
            {recentParticipants.length > 0 && (
                <div className="flex -space-x-2">
                    {recentParticipants.slice(0, 5).map((address, index) => (
                        <div
                            key={address}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 border-2 border-slate-900 flex items-center justify-center"
                            style={{ zIndex: 5 - index }}
                        >
                            <span className="text-white text-xs font-bold">
                                {address.slice(0, 1).toUpperCase()}
                            </span>
                        </div>
                    ))}
                    {participantCount > 5 && (
                        <div
                            className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center"
                            style={{ zIndex: 0 }}
                        >
                            <span className="text-white text-xs font-medium">
                                +{participantCount - 5}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Participant Count */}
            <p className="text-sm text-slate-400">
                <span className="font-medium text-white">{participantCount}</span>{' '}
                {participantCount === 1 ? 'person has' : 'people have'} staked
            </p>
        </div>
    );
}
