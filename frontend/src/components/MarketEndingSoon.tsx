import { Market, MarketStatus } from '../types/market';
import { MarketCard } from './MarketCard';
import { useCurrentBlock } from '../hooks/useCurrentBlock';
import { blocksRemaining, blocksToMinutes, formatTimeRemaining } from '../utils/calculations';
import { EmptyState } from './EmptyState';

interface MarketEndingSoonProps {
    markets: Market[];
    onStake?: (marketId: number) => void;
    className?: string;
}

export function MarketEndingSoon({ markets, onStake, className = '' }: MarketEndingSoonProps) {
    const { blockHeight } = useCurrentBlock();

    // Filter markets ending within 24 hours (approximately 144 blocks)
    const endingSoonMarkets = markets
        .filter(market => {
            if (market.status !== MarketStatus.ACTIVE) return false;
            const remaining = blocksRemaining(market.endDate, blockHeight);
            const minutes = blocksToMinutes(remaining);
            return minutes <= 1440; // 24 hours
        })
        .sort((a, b) => a.endDate - b.endDate) // Sort by soonest first
        .slice(0, 6); // Show top 6

    if (endingSoonMarkets.length === 0) {
        return (
            <div className={className}>
                <EmptyState
                    message="No markets ending soon"
                    icon={
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Ending Soon</h2>
                        <p className="text-sm text-slate-400">Markets closing within 24 hours</p>
                    </div>
                </div>

                <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/50 rounded-full">
                    <span className="text-sm font-bold text-orange-400">⏰ URGENT</span>
                </div>
            </div>

            {/* Markets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {endingSoonMarkets.map((market) => {
                    const remaining = blocksRemaining(market.endDate, blockHeight);
                    const minutes = blocksToMinutes(remaining);
                    const timeLeft = formatTimeRemaining(minutes);

                    return (
                        <div key={market.id} className="relative">
                            {/* Urgency Indicator */}
                            <div className="absolute -top-2 -right-2 z-10">
                                <div className="px-2 py-1 bg-orange-500 rounded-full shadow-lg animate-pulse">
                                    <span className="text-xs font-bold text-white">{timeLeft}</span>
                                </div>
                            </div>

                            <MarketCard
                                market={market}
                                onStake={onStake}
                                className="border-orange-500/30 hover:border-orange-500/50"
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
