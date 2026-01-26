import { memo, useState, useEffect } from 'react';
import type { Market } from '../types/market';
import { Card } from './Card';
import { MarketStatus } from './MarketStatus';
import { MarketOdds } from './MarketOdds';
import { MarketPool } from './MarketPool';
import { ActivityIndicatorLive } from './ActivityIndicatorLive';
import { isMarketActive } from '../utils/calculations';
import { useCurrentBlock } from '../hooks/useCurrentBlock';

interface MarketCardProps {
    market: Market;
    onStake?: (marketId: number) => void;
    className?: string;
}

export const MarketCard = memo(function MarketCard({ market, onStake, className = '' }: MarketCardProps) {
    const { blockHeight } = useCurrentBlock();
    const isActive = isMarketActive(market.endDate, blockHeight);
    const [isHighlighted, setIsHighlighted] = useState(false);

    // Highlight card briefly when data changes
    useEffect(() => {
        setIsHighlighted(true);
        const timer = setTimeout(() => setIsHighlighted(false), 2000);
        return () => clearTimeout(timer);
    }, [market.totalYesStake, market.totalNoStake]);

    const handleStakeClick = () => {
        if (onStake && isActive) {
            onStake(market.id);
        }
    };

    return (
        <Card className={`transition-all duration-500 ${isHighlighted ? 'ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20' : ''} ${className}`.trim()}>
            {/* Live Activity Indicator */}
            <div className="mb-3">
                <ActivityIndicatorLive />
            </div>

            {/* Header */}
            <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white flex-1 pr-4">
                        {market.question}
                    </h3>
                    <MarketStatus
                        status={market.status}
                        endBlock={market.endDate}
                        currentBlock={blockHeight}
                        resolutionBlock={market.resolutionDate}
                    />
                </div>

                <p className="text-xs text-slate-500">
                    Market #{market.id} · Created by {market.creator.slice(0, 8)}...{market.creator.slice(-4)}
                </p>
            </div>

            {/* Pool Info */}
            <div className="mb-4 p-4 bg-slate-900/50 rounded-lg">
                <MarketPool
                    totalYesStake={market.totalYesStake}
                    totalNoStake={market.totalNoStake}
                />
            </div>

            {/* Odds */}
            <div className="mb-4">
                <MarketOdds
                    yesStake={market.totalYesStake}
                    noStake={market.totalNoStake}
                />
            </div>

            {/* Action Button */}
            {isActive && onStake && (
                <button
                    onClick={handleStakeClick}
                    className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40"
                >
                    Stake Now
                </button>
            )}

            {/* Resolved Outcome */}
            {market.status === 1 && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                    <p className="text-sm text-blue-400 font-medium">
                        Resolved: {market.outcome === 1 ? 'YES' : market.outcome === 2 ? 'NO' : 'Unknown'}
                    </p>
                </div>
            )}
        </Card>
    );
});
