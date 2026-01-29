import React from 'react';

interface LeaderboardEntry {
    rank: number;
    user: string;
    pnl: string;
    winRate: number;
    volume: string;
}

export const LeaderboardSystem: React.FC = () => {
    const leaders: LeaderboardEntry[] = [
        { rank: 1, user: 'SP31...W5T', pnl: '+12,450', winRate: 78, volume: '45,000' },
        { rank: 2, user: 'SP2J...P68', pnl: '+8,120', winRate: 65, volume: '22,400' },
        { rank: 3, user: 'SP4A...KJG', pnl: '+5,900', winRate: 72, volume: '18,500' },
        { rank: 4, user: 'SP1P...XYZ', pnl: '+4,200', winRate: 58, volume: '12,000' },
        { rank: 5, user: 'SP9M...QR8', pnl: '+3,850', winRate: 61, volume: '9,800' },
    ];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                <div>
                    <h3 className="text-2xl font-bold text-white">Global Leaderboard</h3>
                    <p className="text-sm text-slate-500">Top performers by realized profit and trade volume.</p>
                </div>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                    {['Profit', 'Volume', 'Win Rate'].map(filter => (
                        <button key={filter} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'Profit' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                            }`}>
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/20">
                            <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rank</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Realized P&L</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Win Rate</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Volume</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {leaders.map((entry) => (
                            <tr key={entry.rank} className="hover:bg-slate-800/40 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                                            entry.rank === 2 ? 'bg-slate-400/20 text-slate-400 border border-slate-400/30' :
                                                entry.rank === 3 ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' :
                                                    'bg-slate-800 text-slate-500'
                                        }`}>
                                        {entry.rank}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">👤</div>
                                        <span className="font-bold text-white font-mono group-hover:text-primary-400 transition-colors">{entry.user}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right font-mono font-bold text-green-500">
                                    {entry.pnl} <span className="text-[10px] text-slate-600">STX</span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex flex-col items-end space-y-1">
                                        <span className="font-bold text-white text-sm">{entry.winRate}%</span>
                                        <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary-500" style={{ width: `${entry.winRate}%` }} />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right font-mono text-slate-400 text-sm">
                                    {entry.volume} STX
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-6 bg-slate-800/10 text-center">
                <button className="text-sm font-bold text-primary-400 hover:text-primary-300 transition-all uppercase tracking-widest">
                    Load More Rankings
                </button>
            </div>
        </div>
    );
};
