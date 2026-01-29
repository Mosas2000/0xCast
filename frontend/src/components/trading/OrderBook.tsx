import React from 'react';

interface OrderBookEntry {
    price: number;
    size: number;
    total: number;
}

interface OrderBookProps {
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
}

export const OrderBook: React.FC<OrderBookProps> = ({ bids, asks }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Order Book</h3>
            </div>

            <div className="p-4 grid grid-cols-2 gap-8">
                {/* Asks (Sell Side) */}
                <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>Price</span>
                        <span>Size</span>
                    </div>
                    <div className="space-y-1">
                        {asks.map((ask, i) => (
                            <div key={i} className="flex justify-between text-sm group cursor-pointer">
                                <span className="text-red-500 font-mono">{ask.price.toFixed(2)}</span>
                                <span className="text-slate-400 font-mono">{ask.size.toLocaleString()}</span>
                                <div
                                    className="absolute right-0 h-full bg-red-500/5 -z-10 group-hover:bg-red-500/10 transition-all"
                                    style={{ width: `${(ask.size / 1000) * 100}%` }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bids (Buy Side) */}
                <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>Size</span>
                        <span>Price</span>
                    </div>
                    <div className="space-y-1">
                        {bids.map((bid, i) => (
                            <div key={i} className="flex justify-between text-sm group cursor-pointer text-right">
                                <span className="text-slate-400 font-mono">{bid.size.toLocaleString()}</span>
                                <span className="text-green-500 font-mono">{bid.price.toFixed(2)}</span>
                                <div
                                    className="absolute left-0 h-full bg-green-500/5 -z-10 group-hover:bg-green-500/10 transition-all"
                                    style={{ width: `${(bid.size / 1000) * 100}%` }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-800/30 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-bold uppercase">Spread</span>
                <span className="text-white font-mono text-sm">
                    {Math.abs((asks[asks.length - 1]?.price || 0) - (bids[0]?.price || 0)).toFixed(4)} STX
                </span>
            </div>
        </div>
    );
};
