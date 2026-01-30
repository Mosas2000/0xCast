import React from 'react';
import { BarChart, TrendingUp, Filter, Info, Layers } from 'lucide-react';

interface VolumeData {
    hour: number; // 0-23
    volume: number;
}

/**
 * Hourly volume heatmap for market analysis, visualizing peak trading periods.
 */
export const VolumeHeatmap: React.FC = () => {
    // Mock data for 24 hours
    const hourlyData: VolumeData[] = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        volume: Math.floor(Math.random() * 100)
    }));

    const getIntensityColor = (volume: number) => {
        if (volume > 80) return 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]';
        if (volume > 60) return 'bg-indigo-500/70';
        if (volume > 40) return 'bg-indigo-500/40';
        if (volume > 20) return 'bg-indigo-500/20';
        return 'bg-white/5';
    };

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8 overflow-hidden relative">
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <Layers size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Volume Intensity</h3>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                        <TrendingUp size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-black text-white">PEAK AT 14:00</span>
                    </div>
                    <Filter size={18} className="text-slate-700" />
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-end h-40 gap-1.5 px-2">
                    {hourlyData.map((d) => (
                        <div key={d.hour} className="flex-1 flex flex-col items-center group">
                            <div
                                className={`w-full rounded-t-lg transition-all duration-500 group-hover:scale-y-110 ${getIntensityColor(d.volume)}`}
                                style={{ height: `${d.volume}%` }}
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl">
                                    {d.volume} STX
                                </div>
                            </div>
                            <span className="text-[8px] font-black text-slate-700 mt-4 font-mono">{d.hour.toString().padStart(2, '0')}</span>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        <span>Low Volume</span>
                        <div className="flex space-x-1">
                            {[0.1, 0.3, 0.6, 1].map((o, i) => (
                                <div key={i} className="w-2.5 h-2.5 rounded-[2px] bg-indigo-500" style={{ opacity: o }} />
                            ))}
                        </div>
                        <span>High Volume</span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-700 uppercase italic">24-Hour Cycle Analysis</p>
                </div>
            </div>

            <div className="p-6 bg-slate-950/80 rounded-[2rem] border border-white/5 flex items-start space-x-4 relative z-10">
                <Info size={16} className="text-indigo-400 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                    Concentrated volume periods often precede major price swings. Observe the intensity clusters to identify algorithmic trading windows.
                </p>
            </div>

            {/* Background Decor */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
        </div>
    );
};
