import { Position, Market, MarketStatus } from '../types/market';
import { calculateClaimableAmount, isWinningPosition } from '../utils/positionCalculations';
import { microStxToStx } from '../constants/markets';

interface PositionStatsProps {
    positions: Position[];
    markets: Market[];
    className?: string;
}

export function PositionStats({ positions, markets, className = '' }: PositionStatsProps) {
    // Calculate total staked
    const totalStaked = positions.reduce((sum, position) => {
        return sum + position.yesStake + position.noStake;
    }, 0);

    // Count active positions (markets not resolved)
    const activePositions = positions.filter(position => {
        const market = markets.find(m => m.id === position.marketId);
        return market && market.status === MarketStatus.ACTIVE;
    }).length;

    // Count resolved positions
    const resolvedPositions = positions.filter(position => {
        const market = markets.find(m => m.id === position.marketId);
        return market && market.status === MarketStatus.RESOLVED;
    }).length;

    // Calculate total winnings (claimable + already claimed)
    const totalWinnings = positions.reduce((sum, position) => {
        const market = markets.find(m => m.id === position.marketId);
        if (!market) return sum;

        if (market.status === MarketStatus.RESOLVED && isWinningPosition(position, market)) {
            const claimable = calculateClaimableAmount(position, market);
            return sum + claimable;
        }

        return sum;
    }, 0);

    const stats = [
        {
            label: 'Total Staked',
            value: `${microStxToStx(totalStaked).toFixed(2)} STX`,
            color: 'text-white',
        },
        {
            label: 'Active Positions',
            value: activePositions.toString(),
            color: 'text-blue-400',
        },
        {
            label: 'Resolved Positions',
            value: resolvedPositions.toString(),
            color: 'text-slate-400',
        },
        {
            label: 'Total Winnings',
            value: `${microStxToStx(totalWinnings).toFixed(2)} STX`,
            color: 'text-green-400',
        },
    ];

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`.trim()}>
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-200"
                >
                    <div className="text-sm text-slate-400 mb-2">{stat.label}</div>
                    <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                </div>
            ))}
        </div>
    );
}
