import { Market } from '../types/market';
import { MarketCard } from './MarketCard';
import { EmptyState } from './EmptyState';
import { Badge } from './Badge';

interface NewMarketsProps {
    markets: Market[];
    onStake?: (marketId: number) => void;
    className?: string;
}

export function NewMarkets({ markets, onStake, className = '' }: NewMarketsProps) {
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);

    // Filter markets created in last 24 hours
    // Note: This is a placeholder - would need actual creation timestamp from contract
    const newMarkets = markets
        .filter(market => {
            // Placeholder logic - would use actual creation timestamp
            return true; // For now, show all markets
        })
        .sort((a, b) => b.id - a.id) // Sort by newest first (higher ID = newer)
        .slice(0, 6); // Show top 6

    if (newMarkets.length === 0) {
        return (
            <div className={className}>
                <EmptyState
                    message="No new markets"
                    icon={
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">New Markets</h2>
                        <p className="text-sm text-slate-400">Recently created in the last 24 hours</p>
                    </div>
                </div>

                <Badge variant="success">Fresh</Badge>
            </div>

            {/* Markets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newMarkets.map((market) => (
                    <div key={market.id} className="relative">
                        {/* New Badge */}
                        <div className="absolute -top-2 -right-2 z-10">
                            <div className="px-2 py-1 bg-green-500 rounded-full shadow-lg">
                                <span className="text-xs font-bold text-white">NEW</span>
                            </div>
                        </div>

                        <MarketCard
                            market={market}
                            onStake={onStake}
                            className="border-green-500/30 hover:border-green-500/50"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
