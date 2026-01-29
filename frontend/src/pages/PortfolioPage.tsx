import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PositionList } from '../components/portfolio/PositionList';
import { PortfolioStats } from '../components/portfolio/PortfolioStats';

export const PortfolioPage: React.FC = () => {
    const mockPositions = [
        {
            id: '1',
            marketTitle: 'Will Stacks Nakamoto upgrade activate by March 2024?',
            outcome: 'Yes',
            amount: 1000,
            entryPrice: 0.50,
            currentPrice: 0.65,
        },
        {
            id: '2',
            marketTitle: 'Will Bitcoin reach $100k by end of 2024?',
            outcome: 'No',
            amount: 250,
            entryPrice: 0.75,
            currentPrice: 0.60,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Header totalMarkets={2} />

            <main className="container mx-auto px-4 py-12 space-y-12">
                <section className="space-y-4">
                    <h1 className="text-4xl font-bold">My Portfolio</h1>
                    <p className="text-slate-400">Track your positions, analyze performance, and manage your stakes across all markets.</p>
                </section>

                <PortfolioStats />

                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Active Positions</h2>
                        <div className="flex space-x-2">
                            <button className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-all">
                                Export CSV
                            </button>
                        </div>
                    </div>
                    <PositionList positions={mockPositions} />
                </section>

                <section className="bg-gradient-to-br from-primary-600/20 to-blue-600/20 border border-primary-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold">Become a Market Creator</h3>
                        <p className="text-slate-300">Earn fees whenever users trade on your markets. It's time to build your own economy.</p>
                    </div>
                    <button className="whitespace-nowrap px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg transition-all scale-110 md:scale-100">
                        Create First Market
                    </button>
                </section>
            </main>

            <Footer />
        </div>
    );
};
