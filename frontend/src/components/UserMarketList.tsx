import { Market } from '../types/market';
import { MarketCard } from './MarketCard';
import { EmptyState } from './EmptyState';

interface UserMarketListProps {
    creatorAddress: string;
    markets: Market[];
    onStake?: (marketId: number) => void;
    className?: string;
}

export function UserMarketList({ creatorAddress, markets, onStake, className = '' }: UserMarketListProps) {
    const userMarkets = markets.filter(m => m.creator === creatorAddress);

    if (userMarkets.length === 0) {
        return (
            <div className={className}>
                <EmptyState
                    message="No markets created yet"
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
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Created Markets</h3>
                <div className="px-3 py-1 bg-slate-700 rounded-full">
                    <span className="text-sm font-medium text-white">{userMarkets.length}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userMarkets.map((market) => (
                    <MarketCard
                        key={market.id}
                        market={market}
                        onStake={onStake}
                    />
                ))}
            </div>
        </div>
    );
}
