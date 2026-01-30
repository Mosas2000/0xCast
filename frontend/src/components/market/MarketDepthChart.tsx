import React from 'react';
import { BarChart3, TrendingUp, Filter } from 'lucide-react';

interface MarketDepthChartProps {
    yesLiquidity: number[];
    noLiquidity: number[];
}

/**
 * Interactive depth chart showing buy/sell pressure for YES and NO outcomes.
 */
export const MarketDepthChart: React.FC<MarketDepthChartProps> = ({ yesLiquidity, noLiquidity }) => {
    return (
        <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold">Market Depth</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">STX Liquidity Concentration</p>
                    </div>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl">
                    <button className="px-3 py-1 text-[10px] font-black text-white bg-white/10 rounded-lg">LIVE</button>
                    <button className="px-3 py-1 text-[10px] font-black text-slate-500 hover:text-white transition-colors">1H</button>
                </div>
            </div>

            <div className="h-64 flex items-end justify-between space-x-1 px-4 relative">
                {/* Zero Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2 z-0"></div>

                {/* NO Depth (Left Side) */}
                <div className="flex-1 flex items-end justify-end space-x-1">
                    {noLiquidity.map((val, i) => (
                        <div
                            key={`no-${i}`}
                            className="w-full bg-rose-500/20 hover:bg-rose-500/40 transition-all rounded-t-sm"
                            style={{ height: `${val}%`, minWidth: '4px' }}
                            title={`NO Liquidity: ${val} STX`}
                        />
                    ))}
                </div>

                {/* YES Depth (Right Side) */}
                <div className="flex-1 flex items-end justify-start space-x-1">
                    {yesLiquidity.map((val, i) => (
                        <div
                            key={`yes-${i}`}
                            className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 transition-all rounded-t-sm"
                            style={{ height: `${val}%`, minWidth: '4px' }}
                            title={`YES Liquidity: ${val} STX`}
                        />
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center space-x-2 text-rose-400">
                    <TrendingUp size={12} className="rotate-180" />
                    <span>Sellers (NO)</span>
                </div>
                <div className="flex items-center space-x-2 text-emerald-400">
                    <span>Buyers (YES)</span>
                    <TrendingUp size={12} />
                </div>
            </div>
        </div>
    );
};
