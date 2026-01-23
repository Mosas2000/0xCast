import { useState } from 'react';
import { Market, MarketStatus } from '../types/market';
import { MarketCard } from './MarketCard';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { ErrorDisplay } from './ErrorDisplay';
import { LastUpdated } from './LastUpdated';
import { FilterSidebar } from './FilterSidebar';
import { useIsMobile } from '../hooks/useIsMobile';

interface MarketListProps {
    markets: Market[];
    isLoading: boolean;
    error: string | null;
    onRefresh?: () => void;
    onStake?: (marketId: number) => void;
    isRefreshing?: boolean;
    lastRefresh?: Date | null;
    className?: string;
}

type FilterTab = 'all' | 'active' | 'resolved';

const ITEMS_PER_PAGE = 10;

export function MarketList({ markets, isLoading, error, onRefresh, onStake, isRefreshing = false, lastRefresh = null, className = '' }: MarketListProps) {
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const isMobile = useIsMobile();

    // Filter markets based on active tab
    const filteredMarkets = markets.filter((market) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'active') return market.status === MarketStatus.ACTIVE;
        if (activeTab === 'resolved') return market.status === MarketStatus.RESOLVED;
        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredMarkets.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedMarkets = filteredMarkets.slice(startIndex, endIndex);

    // Reset to page 1 when changing tabs
    const handleTabChange = (tab: FilterTab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

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
        <div className={`relative ${className}`.trim()}>
            {/* Refreshing Overlay */}
            {isRefreshing && (
                <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center py-2 bg-blue-500/10 backdrop-blur-sm border-b border-blue-500/30 rounded-t-lg">
                    <div className="flex items-center gap-2 text-blue-400 text-sm font-medium">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent" />
                        Refreshing...
                    </div>
                </div>
            )}

            {/* Filter Tabs and Last Updated */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 border-b border-slate-700 pb-2">
                <div className="flex space-x-2 overflow-x-auto">
                <button
                    onClick={() => handleTabChange('all')}
                    className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'all'
                        ? 'text-primary-400 border-b-2 border-primary-400'
                        : 'text-slate-400 hover:text-slate-300'
                        }`}
                >
                    All Markets ({markets.length})
                </button>
                <button
                    onClick={() => handleTabChange('active')}
                    className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'active'
                        ? 'text-primary-400 border-b-2 border-primary-400'
                        : 'text-slate-400 hover:text-slate-300'
                        }`}
                >
                    Active ({markets.filter(m => m.status === MarketStatus.ACTIVE).length})
                </button>
                <button
                    onClick={() => handleTabChange('resolved')}
                    className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'resolved'
                        ? 'text-primary-400 border-b-2 border-primary-400'
                        : 'text-slate-400 hover:text-slate-300'
                        }`}
                >
                    Resolved ({markets.filter(m => m.status === MarketStatus.RESOLVED).length})
                </button>
                </div>

                <div className="flex items-center gap-3">
                    {/* Filters Button */}
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        {!isMobile && <span>Filters</span>}
                    </button>

                    {/* Last Updated Indicator */}
                    <LastUpdated timestamp={lastRefresh} />
                </div>
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
            {paginatedMarkets.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedMarkets.map((market) => (
                            <MarketCard
                                key={market.id}
                                market={market}
                                onStake={onStake}
                            />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center space-x-4 mt-8">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
                            >
                                Previous
                            </button>

                            <span className="text-slate-300">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Filter Sidebar */}
            <FilterSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApply={() => {
                    // Filter logic will be handled by the useFilters hook
                    // For now, just close the sidebar
                    setIsFilterOpen(false);
                }}
                statusCounts={{
                    active: markets.filter(m => m.status === MarketStatus.ACTIVE).length,
                    ended: 0, // Will be calculated based on actual data
                    resolved: markets.filter(m => m.status === MarketStatus.RESOLVED).length,
                }}
            />
        </div>
    );
}
