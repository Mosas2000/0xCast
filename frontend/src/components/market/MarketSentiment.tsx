import React from 'react';
import { Smile, Frown, Meh, Sparkles, TrendingUp, TrendingDown, Users } from 'lucide-react';

interface SentimentData {
    bullish: number; // percentage
    bearish: number;
    neutral: number;
    totalVotes: number;
}

/**
 * Aggregated community sentiment tracker, providing a psychological pulse for specific markets.
 */
export const MarketSentiment: React.FC<SentimentData> = ({
    bullish = 65,
    bearish = 20,
    neutral = 15,
    totalVotes = 1420
}) => {
    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-10 overflow-hidden relative">
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <Sparkles size={20} />
                    <h3 className="text-xl font-bold text-white uppercase tracking-widest">Market Psychology</h3>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                    <Users size={14} />
                    <span>{totalVotes.toLocaleString()} SENTIMENT VOTES</span>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                {/* Sentiment Progress Bar */}
                <div className="h-4 w-full bg-white/5 rounded-full flex overflow-hidden p-0.5 border border-white/5">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)]" style={{ width: `${bullish}%` }} />
                    <div className="h-full bg-slate-700 transition-all duration-1000" style={{ width: `${neutral}%` }} />
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(244,63,94,0.3)]" style={{ width: `${bearish}%` }} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center group p-4 rounded-2xl bg-white/2 hover:bg-emerald-500/5 transition-all border border-transparent hover:border-emerald-500/20">
                        <div className="text-emerald-400 mb-2 flex justify-center group-hover:scale-125 transition-transform"><Smile size={24} /></div>
                        <p className="text-2xl font-black text-white">{bullish}%</p>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center justify-center space-x-1">
                            <TrendingUp size={10} />
                            <span>BULLISH</span>
                        </p>
                    </div>

                    <div className="text-center group p-4 rounded-2xl bg-white/2 hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
                        <div className="text-slate-500 mb-2 flex justify-center"><Meh size={24} /></div>
                        <p className="text-2xl font-black text-white">{neutral}%</p>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">NEUTRAL</p>
                    </div>

                    <div className="text-center group p-4 rounded-2xl bg-white/2 hover:bg-rose-500/5 transition-all border border-transparent hover:border-rose-500/20">
                        <div className="text-rose-400 mb-2 flex justify-center group-hover:scale-125 transition-transform"><Frown size={24} /></div>
                        <p className="text-2xl font-black text-white">{bearish}%</p>
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center justify-center space-x-1">
                            <TrendingDown size={10} />
                            <span>BEARISH</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-950/80 rounded-[2rem] border border-white/5 text-[10px] font-medium text-slate-500 italic relative z-10 leading-relaxed">
                Community sentiment is an aggregate of user votes and does not represent financial advice. High bullishness can sometimes indicate a local peak in over-excitement (Contrarian Indicator).
            </div>

            {/* Decorative Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />
        </div>
    );
};
