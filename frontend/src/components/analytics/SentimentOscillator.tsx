import React from 'react';

interface SentimentOscillatorProps {
    sentiment: number; // -100 to 100
    sampleSize: number;
}

export const SentimentOscillator: React.FC<SentimentOscillatorProps> = ({ sentiment, sampleSize }) => {
    const normalizedValue = (sentiment + 100) / 2; // 0 to 100

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Market Sentiment</h3>
                <span className="text-xs text-slate-500 font-bold">N = {sampleSize.toLocaleString()}</span>
            </div>

            <div className="space-y-4">
                <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-0 w-1/2 bg-red-500/20" />
                    <div className="absolute inset-y-0 right-0 w-1/2 bg-green-500/20" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700 z-10" />

                    <div
                        className={`absolute top-0 bottom-0 w-1 rounded-full transition-all duration-1000 ease-out z-20 ${sentiment > 0 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' :
                                sentiment < 0 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-slate-400'
                            }`}
                        style={{ left: `${normalizedValue}%`, marginLeft: '-2px' }}
                    />
                </div>

                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-red-500">Bearish</span>
                    <span className="text-slate-500">Neutral</span>
                    <span className="text-green-500">Bullish</span>
                </div>
            </div>

            <div className="text-center space-y-1">
                <div className={`text-4xl font-black ${sentiment > 20 ? 'text-green-500' : sentiment < -20 ? 'text-red-500' : 'text-slate-300'
                    }`}>
                    {sentiment > 0 ? '+' : ''}{sentiment}%
                </div>
                <p className="text-xs text-slate-500 font-medium">
                    {sentiment > 50 ? 'Extreme Optimism' :
                        sentiment > 10 ? 'Market Optimism' :
                            sentiment < -50 ? 'Extreme Fear' :
                                sentiment < -10 ? 'Market Fear' : 'Balanced Sentiment'}
                </p>
            </div>
        </div>
    );
};
