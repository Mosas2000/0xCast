import { useState } from 'react';
import { Position, Market } from '../types/market';
import { PositionCard } from './PositionCard';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { ErrorDisplay } from './ErrorDisplay';
import { PositionFilter, PositionSort, PositionFilters } from './PositionFilters';
import { MarketStatus } from '../types/market';
import { isWinningPosition, calculateClaimableAmount } from '../utils/positionCalculations';

interface PositionsListProps {
    positions: Position[];
    markets: Market[];
    isLoading: boolean;
    error: string | null;
    onRefresh?: () => void;
    onClaim?: (marketId: number) => void;
    className?: string;
}

export function PositionsList({
    positions,
    markets,
    isLoading,
    error,
    onRefresh,
    onClaim,
    className = '',
}: PositionsListProps) {
    const [selectedFilter, setSelectedFilter] = useState<PositionFilter>('all');
    const [selectedSort, setSelectedSort] = useState<PositionSort>('recent');

    // Filter positions
    const filteredPositions = positions.filter((position) => {
        const market = markets.find((m) => m.id === position.marketId);
        if (!market) return false;

        switch (selectedFilter) {
            case 'active':
                return market.status === MarketStatus.ACTIVE;
            case 'won':
                return market.status === MarketStatus.RESOLVED && isWinningPosition(position, market);
            case 'lost':
                return market.status === MarketStatus.RESOLVED && !isWinningPosition(position, market);
            case 'claimable':
                return calculateClaimableAmount(position, market) > 0 && !position.claimed;
            default:
                return true;
        }
    });

    // Sort positions
    const sortedPositions = [...filteredPositions].sort((a, b) => {
        const marketA = markets.find((m) => m.id === a.marketId);
        const marketB = markets.find((m) => m.id === b.marketId);
        if (!marketA || !marketB) return 0;

        switch (selectedSort) {
            case 'recent':
                return b.marketId - a.marketId;
            case 'largest':
                const totalA = a.yesStake + a.noStake;
                const totalB = b.yesStake + b.noStake;
                return totalB - totalA;
            case 'performance':
                // Sort by potential winnings
                return 0; // Placeholder
            default:
                return 0;
        }
    });

    // Calculate counts for filters
    const counts = {
        all: positions.length,
        active: positions.filter((p) => {
            const m = markets.find((market) => market.id === p.marketId);
            return m && m.status === MarketStatus.ACTIVE;
        }).length,
        won: positions.filter((p) => {
            const m = markets.find((market) => market.id === p.marketId);
            return m && m.status === MarketStatus.RESOLVED && isWinningPosition(p, m);
        }).length,
        lost: positions.filter((p) => {
            const m = markets.find((market) => market.id === p.marketId);
            return m && m.status === MarketStatus.RESOLVED && !isWinningPosition(p, m);
        }).length,
        claimable: positions.filter((p) => {
            const m = markets.find((market) => market.id === p.marketId);
            return m && calculateClaimableAmount(p, m) > 0 && !p.claimed;
        }).length,
    };

    if (isLoading) {
        return (
            <div className={`flex justify-center py-12 ${className}`.trim()}>
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={className}>
                <ErrorDisplay error={error} onRetry={onRefresh} />
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Filters */}
            <PositionFilters
                selectedFilter={selectedFilter}
                selectedSort={selectedSort}
                onFilterChange={setSelectedFilter}
                onSortChange={setSelectedSort}
                counts={counts}
            />

            {/* Empty State */}
            {sortedPositions.length === 0 && (
                <EmptyState
                    message={selectedFilter === 'all' ? 'No positions yet' : `No ${selectedFilter} positions`}
                    icon={
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    }
                />
            )}

            {/* Positions Grid */}
            {sortedPositions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedPositions.map((position) => {
                        const market = markets.find((m) => m.id === position.marketId);
                        if (!market) return null;

                        return (
                            <PositionCard
                                key={`${position.marketId}-${position.userAddress}`}
                                position={position}
                                market={market}
                                onClaim={onClaim ? () => onClaim(market.id) : undefined}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
