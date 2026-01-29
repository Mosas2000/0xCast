import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { MarketActivityTimeline } from '../components/analytics/MarketActivityTimeline';
import { VolumeDistribution } from '../components/analytics/VolumeDistribution';
import { SentimentOscillator } from '../components/analytics/SentimentOscillator';
import { PriceChart } from '../components/trading/PriceChart';

export const AnalyticsPage: React.FC = () => {
    const volumeData = [
        { name: 'Yes', value: 65000, color: '#3b82f6' },
        { name: 'No', value: 35000, color: '#64748b' },
    ];

    const recentActivity: any[] = [
        { id: 'tx1', user: 'SP123...456', action: 'BUY', outcome: 'Yes', amount: '50', time: '2m ago' },
        { id: 'tx2', user: 'SP789...012', action: 'BUY', outcome: 'Yes', amount: '120', time: '15m ago' },
        { id: 'tx3', user: 'SP345...678', action: 'SELL', outcome: 'Yes', amount: '30', time: '1h ago' },
        { id: 'tx4', user: 'SP901...234', action: 'CREATE', time: '3h ago' },
    ];

    const chartData = [
        { time: 'Mon', price: 0.52 },
        { time: 'Tue', price: 0.55 },
        { time: 'Wed', price: 0.58 },
        { time: 'Thu', price: 0.54 },
        { time: 'Fri', price: 0.61 },
        { time: 'Sat', price: 0.65 },
        { time: 'Sun', price: 0.63 },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Header totalMarkets={1} />

            <main className="container mx-auto px-4 py-12 space-y-12">
                <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold">Advanced Analytics</h1>
                        <p className="text-slate-400">Deep insights into predictive trends and on-chain liquidity flows.</p>
                    </div>
                    <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                        {['Overview', 'Traders', 'Liquidity', 'Oracles'].map(tab => (
                            <button key={tab} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${tab === 'Overview' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
                                }`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        <PriceChart data={chartData} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <VolumeDistribution data={volumeData} />
                            <SentimentOscillator sentiment={42} sampleSize={1250} />
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <MarketActivityTimeline activities={recentActivity} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
