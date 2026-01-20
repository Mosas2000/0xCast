import { useState } from 'react';
import { Market, MarketStatus } from '../types/market';
import { MarketCard } from './MarketCard';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { ErrorDisplay } from './ErrorDisplay';

interface MarketListProps {
    markets: Market[];
    isLoading: boolean;
    error: string | null;
    onRefresh?: () => void;
    onStake?: (marketId: number) => void;
    className?: string;
}

type FilterTab = 'all' | 'active' | 'resolved';

export function MarketList({ markets, isLoading, error, onRefresh, onStake, className = '' }: MarketListProps) {
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    // Filter markets based on active tab
    const filteredMarkets = markets.filter((market) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'active') return market.status === MarketStatus.ACTIVE;
        if (activeTab === 'resolved') return market.status === MarketStatus.RESOLVED;
        return true;
    });

    // Loading state
    if (isLoading) {
        return (
            <div className={`flex justify-center py-12 ${className}`.trim()}>
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={className}>
                <ErrorDisplay error={error} onRetry={onRefresh} />
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Filter Tabs */}
            <div className="flex space-x-2 mb-6 border-b border-slate-700">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'all'
                            ? 'text-primary-400 border-b-2 border-primary-400'
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                >
                    All Markets ({markets.length})
                </button>
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'active'
                            ? 'text-primary-400 border-b-2 border-primary-400'
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                >
                    Active ({markets.filter(m => m.status === MarketStatus.ACTIVE).length})
                </button>
                <button
                    onClick={() => setActiveTab('resolved')}
                    className={`px-4 py-2 font-medium transition-colors ${activeTab === 'resolved'
                            ? 'text-primary-400 border-b-2 border-primary-400'
                            : 'text-slate-400 hover:text-slate-300'
                        }`}
                >
                    Resolved ({markets.filter(m => m.status === MarketStatus.RESOLVED).length})
                </button>
            </div>

            {/* Empty state */}
            {filteredMarkets.length === 0 && (
                <EmptyState
                    message={
                        activeTab === 'all'
                            ? 'No markets yet'
                            : activeTab === 'active'
                                ? 'No active markets'
                                : 'No resolved markets'
                    }
                    icon={
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                    }
                />
            )}

            {/* Markets Grid */}
            {filteredMarkets.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMarkets.map((market) => (
                        <MarketCard
                            key={market.id}
                            market={market}
                            onStake={onStake}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
