import type { Position, Market } from '../types/market';
import { microStxToStx } from '../constants/markets';
import { isWinningPosition } from '../utils/positionCalculations';

interface UserStatsProps {
    userAddress: string;
    positions: Position[];
    markets: Market[];
    className?: string;
}

export function UserStats({ userAddress, positions, markets, className = '' }: UserStatsProps) {
    // Calculate total staked
    const totalStaked = positions.reduce((sum, pos) => sum + pos.yesStake + pos.noStake, 0);

    // Calculate win rate
    const resolvedPositions = positions.filter(pos => {
        const market = markets.find(m => m.id === pos.marketId);
        return market && market.status === 2; // RESOLVED
    });
    const wonPositions = resolvedPositions.filter(pos => {
        const market = markets.find(m => m.id === pos.marketId);
        return market && isWinningPosition(pos, market);
    });
    const winRate = resolvedPositions.length > 0 ? (wonPositions.length / resolvedPositions.length) * 100 : 0;

    // Count markets created by user
    const marketCount = markets.filter(m => m.creator === userAddress).length;

    // Calculate ROI (placeholder)
    const roi = 0;

    // Find best market (highest win)
    const bestMarket = markets[0] || null;

    const stats = [
        { label: 'Total Staked', value: `${microStxToStx(totalStaked).toFixed(2)} STX`, color: 'text-white' },
        { label: 'Win Rate', value: `${winRate.toFixed(1)}%`, color: winRate >= 50 ? 'text-green-400' : 'text-red-400' },
        { label: 'Markets Created', value: marketCount.toString(), color: 'text-primary-400' },
        { label: 'ROI', value: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`, color: roi >= 0 ? 'text-green-400' : 'text-red-400' },
    ];

    return (
        <div className={`bg-slate-800/50 border border-slate-700 rounded-xl p-6 ${className}`.trim()}>
            <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <div key={index} className="p-4 bg-slate-900/50 rounded-lg">
                        <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {bestMarket && (
                <div className="pt-4 border-t border-slate-700">
                    <p className="text-xs text-slate-400 mb-2">Best Market</p>
                    <p className="text-sm text-white line-clamp-2">{bestMarket.question}</p>
                </div>
            )}
        </div>
    );
}
