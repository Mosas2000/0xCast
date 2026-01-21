import { Market } from '../types/market';
import { MarketOdds } from './MarketOdds';
import { MarketPool } from './MarketPool';
import { MarketStatus } from './MarketStatus';
import { ActivityIndicator } from './ActivityIndicator';
import { useMarketActivity } from '../hooks/useMarketActivity';

interface FeaturedMarketProps {
    market: Market;
    onStake?: (marketId: number) => void;
    className?: string;
}

export function FeaturedMarket({ market, onStake, className = '' }: FeaturedMarketProps) {
    const { totalStakes, lastStakeTime } = useMarketActivity(market.id);

    return (
        <div className={`relative overflow-hidden ${className}`.trim()}>
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-purple-500/10 to-transparent" />

            {/* Content */}
            <div className="relative p-8 bg-slate-800/50 backdrop-blur-sm border-2 border-primary-500/30 rounded-2xl hover:border-primary-500/50 transition-all duration-300 shadow-2xl shadow-primary-500/10">
                {/* Featured Badge */}
                <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full">
                        <span className="text-xs font-bold text-white">⭐ FEATURED</span>
                    </div>
                </div>

                {/* Market Info */}
                <div className="mb-6">
                    <div className="flex items-start justify-between mb-3">
                        <MarketStatus market={market} />
                        <ActivityIndicator lastActivityTime={lastStakeTime} activityCount={totalStakes} />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                        {market.question}
                    </h2>
                </div>

                {/* Market Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <MarketOdds market={market} />
                    <MarketPool market={market} />
                </div>

                {/* CTA Button */}
                {onStake && (
                    <button
                        onClick={() => onStake(market.id)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transform hover:scale-[1.02]"
                    >
                        Stake Now →
                    </button>
                )}
            </div>
        </div>
    );
}
