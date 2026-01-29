import React from 'react';

interface Position {
    id: string;
    marketTitle: string;
    outcome: string;
    amount: number;
    entryPrice: number;
    currentPrice: number;
}

interface PositionListProps {
    positions: Position[];
}

export const PositionList: React.FC<PositionListProps> = ({ positions }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Market</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Outcome</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Size</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Avg. Price</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">P&L</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {positions.map((pos) => {
                            const pnl = (pos.currentPrice - pos.entryPrice) * pos.amount;
                            const pnlPercent = ((pos.currentPrice - pos.entryPrice) / pos.entryPrice) * 100;

                            return (
                                <tr key={pos.id} className="hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-1">
                                            {pos.marketTitle}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[10px] font-bold text-slate-300 uppercase">
                                            {pos.outcome}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-white font-mono">
                                        {pos.amount.toLocaleString()} <span className="text-slate-500 text-[10px]">Shares</span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-white font-mono">
                                        {pos.entryPrice.toFixed(2)} STX
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold font-mono ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}%)
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all">
                                            Sell
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {positions.length === 0 && (
                <div className="p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-white font-bold">No Active Positions</h4>
                        <p className="text-slate-500 text-sm">You haven't traded on any markets yet.</p>
                    </div>
                </div>
            )}
        </div>
    );
};
