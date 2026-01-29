import React from 'react';

interface Activity {
    id: string;
    user: string;
    action: 'BUY' | 'SELL' | 'CREATE' | 'RESOLVE';
    outcome?: string;
    amount?: string;
    time: string;
}

interface MarketActivityTimelineProps {
    activities: Activity[];
}

export const MarketActivityTimeline: React.FC<MarketActivityTimelineProps> = ({ activities }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recent Activity</h3>

            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                {activities.map((item) => (
                    <div key={item.id} className="relative pl-8 animate-in slide-in-from-top-2 duration-300">
                        <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-slate-950 ${item.action === 'BUY' ? 'bg-green-500' :
                                item.action === 'SELL' ? 'bg-red-500' :
                                    item.action === 'CREATE' ? 'bg-blue-500' : 'bg-orange-500'
                            }`} />

                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-sm text-white">
                                    <span className="font-mono text-slate-400">{item.user.slice(0, 6)}...</span>
                                    <span className="mx-1 font-medium italic">{(item.action as string).toLowerCase()}</span>
                                    {item.amount && <span className="font-bold text-primary-400">{item.amount} STX</span>}
                                    {item.outcome && <span> on <span className="font-bold text-white uppercase">{item.outcome}</span></span>}
                                </p>
                                <div className="text-[10px] text-slate-500 font-medium">TX: {item.id.slice(0, 10)}...</div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">{item.time}</span>
                        </div>
                    </div>
                ))}
            </div>

            {activities.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">No recent activity found.</div>
            )}
        </div>
    );
};
