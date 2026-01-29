import React from 'react';
import { MarketCreationWizard } from '../components/market/MarketCreationWizard';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const CreateMarketPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Header totalMarkets={0} />

            <main className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto space-y-12">
                    <section className="text-center space-y-4">
                        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Create a Prediction Market
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                            Set the question, define the outcomes, and let the community trade on the future.
                            All markets are transparent and resolved on-chain.
                        </p>
                    </section>

                    <div className="relative">
                        <div className="absolute inset-0 bg-primary-500/10 blur-[120px] rounded-full -z-10" />
                        <MarketCreationWizard />
                    </div>

                    <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-slate-800">
                        <div className="space-y-3">
                            <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-primary-500 font-bold">1</div>
                            <h4 className="font-bold">Define the Question</h4>
                            <p className="text-sm text-slate-500">Be clear and objective. Ensure the outcome can be verified with publicly available data.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-primary-500 font-bold">2</div>
                            <h4 className="font-bold">Set Outcomes</h4>
                            <p className="text-sm text-slate-500">Add up to 10 mutually exclusive outcomes. Binary results like "Yes" and "No" are most common.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-primary-500 font-bold">3</div>
                            <h4 className="font-bold">Choose Duration</h4>
                            <p className="text-sm text-slate-500">Specify exactly when the market should stop accepting trades based on Stacks block height.</p>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
};
