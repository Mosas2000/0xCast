import { UserAvatar } from './UserAvatar';

interface LeaderboardEntry {
    address: string;
    value: number;
    rank: number;
}

interface LeaderboardProps {
    metric: 'volume' | 'winRate' | 'marketCount';
    entries: LeaderboardEntry[];
    className?: string;
}

const METRIC_LABELS = {
    volume: 'Total Volume',
    winRate: 'Win Rate',
    marketCount: 'Markets Created',
};

export function Leaderboard({ metric, entries, className = '' }: LeaderboardProps) {
    const formatValue = (value: number) => {
        switch (metric) {
            case 'volume':
                return `${value.toFixed(2)} STX`;
            case 'winRate':
                return `${value.toFixed(1)}%`;
            case 'marketCount':
                return value.toString();
        }
    };

    return (
        <div className={`bg-slate-800/50 border border-slate-700 rounded-xl p-6 ${className}`.trim()}>
            <h3 className="text-lg font-bold text-white mb-4">
                Top 10 - {METRIC_LABELS[metric]}
            </h3>

            <div className="space-y-3">
                {entries.slice(0, 10).map((entry) => (
                    <div
                        key={entry.address}
                        className="flex items-center space-x-4 p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-colors"
                    >
                        {/* Rank */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${entry.rank === 1 ? 'bg-yellow-500 text-yellow-900' :
                                entry.rank === 2 ? 'bg-slate-400 text-slate-900' :
                                    entry.rank === 3 ? 'bg-orange-600 text-orange-100' :
                                        'bg-slate-700 text-slate-300'
                            }`}>
                            {entry.rank}
                        </div>

                        {/* Avatar */}
                        <UserAvatar address={entry.address} size="sm" />

                        {/* Address */}
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white font-mono">
                                {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                            </p>
                        </div>

                        {/* Value */}
                        <div className="text-right">
                            <p className="text-sm font-bold text-primary-400">
                                {formatValue(entry.value)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
