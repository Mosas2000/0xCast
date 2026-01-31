import React from 'react';
import { Layers, Activity, TrendingUp, Info } from 'lucide-react';

interface DepthSnapshot {
    price: number;
    yesVolume: number;
    noVolume: number;
}

/**
 * Visualizes the historical liquidity depth series, allowing users to spot "Wall" formations.
 */
export const DepthSeries: React.FC = () => {
    const snapshots: DepthSnapshot[] = [
        { price: 0.1, yesVolume: 5000, noVolume: 100 },
        { price: 0.3, yesVolume: 8000, noVolume: 500 },
        { price: 0.5, yesVolume: 12000, noVolume: 2000 },
        { price: 0.7, yesVolume: 4000, noVolume: 15000 },
        { price: 0.9, yesVolume: 200, noVolume: 25000 },
    ];

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <Layers size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Liquidity Depth</h3>
                </div>
                <div className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    LIVE ORDERBOOK
                </div>
            </div>

            <div className="space-y-4">
                {snapshots.map((s, i) => (
                    <div key={i} className="group relative flex items-center h-12 bg-white/2 rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all">
                        {/* NO Side (Right to Center) */}
                        <div className="flex-1 flex justify-end pr-4 text-rose-500 font-mono text-[10px] font-bold z-10">{s.noVolume.toLocaleString()}</div>
                        <div
                            className="absolute right-1/2 h-full bg-rose-500/10 border-r border-rose-500/30 transition-all duration-500 group-hover:bg-rose-500/20"
                            style={{ width: `${(s.noVolume / 30000) * 50}%` }}
                        />

                        {/* Price Divider */}
                        <div className="w-16 flex items-center justify-center bg-slate-950 border-x border-white/5 z-20">
                            <span className="text-[10px] font-black text-white">{s.price.toFixed(1)}</span>
                        </div>

                        {/* YES Side (Center to Left) */}
                        <div
                            className="absolute left-1/2 h-full bg-emerald-500/10 border-l border-emerald-500/30 transition-all duration-500 group-hover:bg-emerald-500/20"
                            style={{ width: `${(s.yesVolume / 30000) * 50}%` }}
                        />
                        <div className="flex-1 flex justify-start pl-4 text-emerald-500 font-mono text-[10px] font-bold z-10">{s.yesVolume.toLocaleString()}</div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-white/5 text-[9px] font-black text-slate-700 uppercase tracking-widest">
                <span>Accumulated Sell Depth (NO)</span>
                <span>Accumulated Buy Depth (YES)</span>
            </div>

            <div className="p-6 bg-slate-950/60 rounded-[2rem] border border-white/5 flex items-start space-x-3">
                <Activity size={16} className="text-indigo-400 flex-shrink-0" />
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    A "Stall Wall" is forming at the 0.9 price level for NO outcomes. High resistance detected.
                </p>
            </div>
        </div>
    );
};
