import React from 'react';

interface TickerItem {
    id: string;
    label: string;
    value: string;
    change?: string;
}

/**
 * Global horizontal scrolling ticker for market activity.
 */
export const MarketTicker: React.FC<{ items: TickerItem[] }> = ({ items }) => {
    return (
        <div className="w-full bg-slate-900 border-y border-white/5 py-2 overflow-hidden whitespace-nowrap">
            <div className="flex animate-[ticker_30s_linear_infinite] hover:[animation-play-state:paused]">
                {[...items, ...items].map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="inline-flex items-center mx-8 space-x-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                        <span className="text-xs font-black text-white px-2 py-0.5 bg-white/5 rounded-md">{item.value}</span>
                        {item.change && (
                            <span className={`text-[10px] font-bold ${item.change.startsWith('+') ? 'text-accent-400' : 'text-red-400'}`}>
                                {item.change}
                            </span>
                        )}
                    </div>
                ))}
            </div>
            <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    );
};
