import React from 'react';
import { History, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ActivityItem {
    id: string;
    marketTitle: string;
    amount: string;
    outcome: 'YES' | 'NO';
    type: 'stake' | 'payout';
    timestamp: string;
}

/**
 * Component for displaying a user's personal trade and payout activity history.
 */
export const MyActivityList: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-6 text-slate-400">
                <History size={18} />
                <h3 className="text-sm font-black uppercase tracking-widest">Recent Activity</h3>
            </div>

            {activities.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-slate-500 text-sm">No recent activity found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-center justify-between p-4 bg-slate-900 border border-white/5 rounded-2xl hover:border-white/10 transition-colors"
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-xl ${activity.type === 'stake' ? 'bg-primary-500/10 text-primary-400' : 'bg-emerald-500/10 text-emerald-400'
                                    }`}>
                                    {activity.type === 'stake' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white line-clamp-1">{activity.marketTitle}</p>
                                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">
                                        {activity.type === 'stake' ? `Staked ${activity.outcome}` : 'Claimed Payout'} • {activity.timestamp}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-black ${activity.type === 'stake' ? 'text-white' : 'text-emerald-400'
                                    }`}>
                                    {activity.type === 'stake' ? '-' : '+'}{activity.amount} STX
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
