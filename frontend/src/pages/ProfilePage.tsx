import { UserProfile } from '../components/UserProfile';
import { UserStats } from '../components/UserStats';
import { UserBadges } from '../components/UserBadges';
import { UserMarketList } from '../components/UserMarketList';
import { PositionsList } from '../components/PositionsList';
import { useMarkets } from '../hooks/useMarkets';
import { useUserPositions } from '../hooks/useUserPositions';

interface ProfilePageProps {
    address: string;
}

export function ProfilePage({ address }: ProfilePageProps) {
    const { markets, isLoading: marketsLoading } = useMarkets();
    const marketIds = markets.map(m => m.id);
    const { positions, isLoading: positionsLoading } = useUserPositions(marketIds);

    // Placeholder achievements
    const achievements = [
        { id: '1', name: 'First Market', description: 'Created your first market', icon: '🎯', earned: false },
        { id: '2', name: 'High Roller', description: 'Staked over 100 STX', icon: '💎', earned: false },
        { id: '3', name: 'Prophet', description: 'Won 10 markets', icon: '🔮', earned: false },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
            <div className="container mx-auto px-4 space-y-8">
                {/* Profile Header */}
                <UserProfile userAddress={address} />

                {/* Stats */}
                <UserStats
                    userAddress={address}
                    positions={positions}
                    markets={markets}
                />

                {/* Badges */}
                <UserBadges achievements={achievements} />

                {/* Created Markets */}
                <UserMarketList
                    creatorAddress={address}
                    markets={markets}
                />

                {/* User Positions */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6">My Positions</h2>
                    <PositionsList
                        positions={positions}
                        markets={markets}
                        isLoading={positionsLoading || marketsLoading}
                        error={null}
                    />
                </div>
            </div>
        </div>
    );
}
