interface PositionHistoryItem {
    id: string;
    date: Date;
    marketQuestion: string;
    action: 'staked' | 'claimed';
    amount: number;
    outcome?: 'YES' | 'NO';
}

interface PositionHistoryProps {
    items: PositionHistoryItem[];
    className?: string;
}

export function PositionHistory({ items, className = '' }: PositionHistoryProps) {
    const sortedItems = [...items].sort((a, b) => b.date.getTime() - a.date.getTime());

    const formatDate = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getActionColor = (action: string) => {
        return action === 'staked' ? 'text-blue-400' : 'text-green-400';
    };

    const getActionIcon = (action: string) => {
        if (action === 'staked') {
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            );
        }
        return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        );
    };

    if (items.length === 0) {
        return (
            <div className={`text-center py-8 text-slate-400 ${className}`.trim()}>
                No activity yet
            </div>
        );
    }

    return (
        <div className={className}>
            <h3 className="text-lg font-bold text-white mb-4">Activity Timeline</h3>

            <div className="space-y-4">
                {sortedItems.map((item, index) => (
                    <div key={item.id} className="flex gap-4">
                        {/* Timeline Line */}
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.action === 'staked' ? 'bg-blue-500/20' : 'bg-green-500/20'
                                }`}>
                                <div className={getActionColor(item.action)}>
                                    {getActionIcon(item.action)}
                                </div>
                            </div>
                            {index < sortedItems.length - 1 && (
                                <div className="w-0.5 h-full min-h-[40px] bg-slate-700 mt-2" />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-6">
                            <div className="flex items-start justify-between mb-1">
                                <div>
                                    <span className={`font-medium ${getActionColor(item.action)}`}>
                                        {item.action === 'staked' ? 'Staked' : 'Claimed'}
                                    </span>
                                    {item.outcome && (
                                        <span className={`ml-2 text-sm ${item.outcome === 'YES' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {item.outcome}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-slate-500">{formatDate(item.date)}</span>
                            </div>

                            <p className="text-sm text-slate-400 mb-1 line-clamp-2">{item.marketQuestion}</p>

                            <p className="text-sm font-medium text-white">
                                {item.amount.toFixed(2)} STX
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
