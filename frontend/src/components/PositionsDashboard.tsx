import { useUserPositions } from '../hooks/useUserPositions';
import { useMarkets } from '../hooks/useMarkets';
import { PositionStats } from './PositionStats';
import { PositionsList } from './PositionsList';

interface PositionsDashboardProps {
    className?: string;
}

export function PositionsDashboard({ className = '' }: PositionsDashboardProps) {
    const { markets, isLoading: marketsLoading, error: marketsError, refetch: refetchMarkets } = useMarkets();
    const marketIds = markets.map(m => m.id);
    const { positions, isLoading: positionsLoading, totalStaked, marketsCount } = useUserPositions(marketIds);

    const isLoading = marketsLoading || positionsLoading;
    const error = marketsError;

    const handleRefresh = () => {
        refetchMarkets();
    };

    return (
        <div className={`space-y-8 ${className}`.trim()}>
            {/* Stats Overview */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-6">Portfolio Overview</h2>
                <PositionStats positions={positions} markets={markets} />
            </section>

            {/* Positions List */}
            <section>
                <h2 className="text-2xl font-bold text-white mb-6">My Positions</h2>
                <PositionsList
                    positions={positions}
                    markets={markets}
                    isLoading={isLoading}
                    error={error}
                    onRefresh={handleRefresh}
                />
            </section>
        </div>
    );
}
