import React, { useState } from 'react';

interface AlertRule {
    id: string;
    marketTitle: string;
    condition: 'price_reaches' | 'volume_reaches' | 'settlement_soon';
    value: string;
}

export const MarketAlerts: React.FC = () => {
    const [rules, setRules] = useState<AlertRule[]>([
        {
            id: '1',
            marketTitle: 'Nakamoto Upgrade Activation',
            condition: 'settlement_soon',
            value: '48h before',
        }
    ]);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center text-sm">
                <h3 className="font-bold text-white uppercase tracking-widest">Market Alerts</h3>
                <button className="text-[10px] font-bold text-primary-400 hover:underline uppercase">Add New Alert</button>
            </div>

            <div className="space-y-3">
                {rules.map((rule) => (
                    <div key={rule.id} className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-between group">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-white line-clamp-1">{rule.marketTitle}</p>
                            <div className="flex items-center space-x-2">
                                <span className="text-[10px] text-slate-500 font-medium italic">
                                    {rule.condition === 'settlement_soon' ? 'Alert me' : 'Notify on'}
                                </span>
                                <span className="text-[10px] bg-primary-600/20 text-primary-400 px-1.5 py-0.5 rounded font-bold uppercase">
                                    {rule.value}
                                </span>
                            </div>
                        </div>
                        <button className="text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                ))}

                {rules.length === 0 && (
                    <div className="py-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                        <p className="text-xs text-slate-500">No active alerts set for any market.</p>
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[10px] text-slate-500 leading-tight">
                    Alerts are delivered via browser notifications and the in-app notification center.
                </p>
            </div>
        </div>
    );
};
