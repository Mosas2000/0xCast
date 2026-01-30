import React from 'react';
import { ArrowUpRight, TrendingUp, Zap } from 'lucide-react';

interface Gainer {
    symbol: string;
    change: string;
    price: string;
}

/**
 * Real-time scrolling ticker showcasing the top-performing prediction outcomes.
 */
export const GainerTicker: React.FC = () => {
    const gainers: Gainer[] = [
        { symbol: 'BTC_YES', change: '+12.5%', price: '0.82 STX' },
        { symbol: 'SOL_NO', change: '+8.2%', price: '0.45 STX' },
        { symbol: 'STX_YES', change: '+15.1%', price: '0.91 STX' },
        { symbol: 'ETH_YES', change: '+4.2%', price: '0.66 STX' },
        { symbol: 'DAO_VOTE', change: '+22.0%', price: '0.34 STX' }
    ];

    return (
        <div className="w-full bg-slate-950 border-y border-white/5 py-3 overflow-hidden group">
            <div className="flex animate-marquee group-hover:pause whitespace-nowrap">
                {/* Double the array for seamless scrolling */}
                {[...gainers, ...gainers].map((g, i) => (
                    <div key={i} className="inline-flex items-center space-x-4 px-10 border-r border-white/5 last:border-none">
                        <div className="flex items-center space-x-2">
                            <div className="p-1 bg-emerald-500/10 rounded-md text-emerald-400">
                                <TrendingUp size={12} />
                            </div>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{g.symbol}</span>
                        </div>

                        <span className="text-sm font-black text-white italic">{g.price}</span>

                        <div className="flex items-center space-x-1 text-emerald-400">
                            <ArrowUpRight size={14} />
                            <span className="text-[10px] font-black">{g.change}</span>
                        </div>

                        <Zap size={10} className="text-slate-800 animate-pulse" />
                    </div>
                ))}
            </div>

            <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .pause {
          animation-play-state: paused;
        }
      `}</style>
        </div>
    );
};
