import React from 'react';
import { Target, Zap, Users, TrendingUp, Sparkles, AlertTriangle } from 'lucide-react';

interface WidgetProps {
    type: 'momentum' | 'liquidity' | 'risk' | 'consensus';
    value: string | number;
    label: string;
    trend?: string;
}

/**
 * High-impact analytic widgets for modular dashboard integration.
 */
export const AnalyticWidgets: React.FC = () => {
    const widgets: WidgetProps[] = [
        { type: 'momentum', value: '+14%', label: 'Volume Velocity', trend: 'UP' },
        { type: 'liquidity', value: '450K', label: 'Pool Depth', trend: 'UP' },
        { type: 'consensus', value: '82%', label: 'YES Sentiment', trend: 'STABLE' },
        { type: 'risk', value: 'LOW', label: 'Volatility Index', trend: 'DOWN' }
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'momentum': return <TrendingUp size={18} className="text-emerald-400" />;
            case 'liquidity': return <Zap size={18} className="text-indigo-400" />;
            case 'consensus': return <Sparkles size={18} className="text-amber-400" />;
            case 'risk': return <AlertTriangle size={18} className="text-rose-400" />;
            default: return <Target size={18} />;
        }
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {widgets.map((w, i) => (
                <div key={i} className="group glass-morphism p-6 rounded-[2rem] border border-white/10 hover:border-white/20 transition-all relative overflow-hidden flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform">
                            {getIcon(w.type)}
                        </div>
                        {w.trend && (
                            <span className={`text-[8px] font-black uppercase tracking-widest ${w.trend === 'UP' ? 'text-emerald-400' : w.trend === 'DOWN' ? 'text-rose-400' : 'text-slate-500'}`}>
                                {w.trend}
                            </span>
                        )}
                    </div>

                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] mb-1">{w.label}</p>
                        <h4 className="text-2xl font-black text-white font-display tracking-tight">{w.value}</h4>
                    </div>

                    {/* Decorative Background Mesh */}
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-20 transition-opacity">
                        {getIcon(w.type)}
                    </div>
                </div>
            ))}
        </div>
    );
};
