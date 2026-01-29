import React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TradingCard } from '../components/trading/TradingCard';
import { OrderBook } from '../components/trading/OrderBook';
import { PriceChart } from '../components/trading/PriceChart';

export const TradingPage: React.FC = () => {
    const { marketId } = useParams<{ marketId: string }>();

    // Mock data for initial implementation
    const outcomes = ['Yes', 'No'];
    const odds = [0.65, 0.35];

    const priceData = [
        { time: '00:00', price: 0.50 },
        { time: '04:00', price: 0.55 },
        { time: '08:00', price: 0.52 },
        { time: '12:00', price: 0.60 },
        { time: '16:00', price: 0.68 },
        { time: '20:00', price: 0.65 },
    ];

    const bids = [
        { price: 0.64, size: 500, total: 500 },
        { price: 0.63, size: 1200, total: 1700 },
        { price: 0.62, size: 800, total: 2500 },
    ];

    const asks = [
        { price: 0.66, size: 300, total: 300 },
        { price: 0.67, size: 900, total: 1200 },
        { price: 0.68, size: 1500, total: 2700 },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Header totalMarkets={1} />

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Chart and Info */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <span className="px-2 py-1 bg-primary-500/20 text-primary-400 text-[10px] font-bold rounded uppercase">Active</span>
                                <span className="text-slate-500 text-sm">Market #{marketId}</span>
                            </div>
                            <h1 className="text-3xl font-bold">Will Stacks Nakamoto upgrade activate by March 2024?</h1>
                            <p className="text-slate-400">
                                This market resolves to "Yes" if the Stacks Nakamoto upgrade is officially activated on mainnet
                                according to official Hiro/Stacks Foundation communications by March 31st, 2024.
                            </p>
                        </div>

                        <PriceChart data={priceData} />

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-xl font-bold mb-4">Market Rules</h3>
                            <ul className="list-disc list-inside text-slate-400 space-y-2 text-sm">
                                <li>Resolution source: Hiro Systems Status Page</li>
                                <li>Trading ends: March 30, 2024</li>
                                <li>Settlement: Automated via Oracle Integration</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column - Trading Interface */}
                    <div className="lg:col-span-4 space-y-8">
                        <TradingCard
                            marketId={Number(marketId)}
                            outcomes={outcomes}
                            odds={odds}
                            onTrade={(idx, amt) => console.log('Trade:', idx, amt)}
                        />
                        <OrderBook bids={bids} asks={asks} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
