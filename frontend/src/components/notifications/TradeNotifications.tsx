import React, { useState, useEffect } from 'react';

interface TradeEvent {
    id: string;
    marketTitle: string;
    outcome: string;
    amount: string;
    status: 'pending' | 'confirmed' | 'failed';
}

export const TradeNotifications: React.FC = () => {
    const [activeTrades, setActiveTrades] = useState<TradeEvent[]>([]);

    useEffect(() => {
        // Simulated trade monitoring
        const mockTrade: TradeEvent = {
            id: 'tx_987...',
            marketTitle: 'BTC reach $100k?',
            outcome: 'Yes',
            amount: '500',
            status: 'pending'
        };

        setActiveTrades([mockTrade]);

        // Simulate confirmation after 5 seconds
        const timer = setTimeout(() => {
            setActiveTrades(prev => prev.map(t => ({ ...t, status: 'confirmed' })));
            // Clear after showing confirmation
            setTimeout(() => {
                setActiveTrades(prev => prev.filter(t => t.status === 'pending'));
            }, 5000);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    if (activeTrades.length === 0) return null;

    return (
        <div className="fixed bottom-24 right-6 z-50 space-y-4">
            {activeTrades.map((trade) => (
                <div
                    key={trade.id}
                    className="w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-right-8 duration-500 overflow-hidden"
                >
                    <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${trade.status === 'confirmed' ? 'bg-green-500/20 text-green-500' :
                                trade.status === 'failed' ? 'bg-red-500/20 text-red-500' : 'bg-primary-500/20 text-primary-500'
                            }`}>
                            {trade.status === 'pending' ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : trade.status === 'confirmed' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-bold text-white truncate">
                                    {trade.status === 'pending' ? 'Processing Trade' : 'Trade Confirmed'}
                                </h4>
                                <button
                                    onClick={() => setActiveTrades([])}
                                    className="text-slate-600 hover:text-slate-400"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1">
                                {trade.amount} STX on <span className="font-bold text-white uppercase">{trade.outcome}</span>
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 font-mono">TX: {trade.id}</span>
                        <a
                            href={`https://explorer.hiro.so/txid/${trade.id}?chain=mainnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:underline font-bold"
                        >
                            View on Explorer
                        </a>
                    </div>

                    <div className={`absolute bottom-0 left-0 h-1 bg-primary-500 transition-all duration-5000 ease-linear ${trade.status === 'confirmed' ? 'w-0' : 'w-full'
                        }`} />
                </div>
            ))}
        </div>
    );
};
