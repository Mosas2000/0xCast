import React, { useState } from 'react';
import { OutcomeConfigurator } from './OutcomeConfigurator';
import { MarketPreview } from './MarketPreview';
import { useMarketCreation } from '../../hooks/market/useMarketCreation';

export const MarketCreationWizard: React.FC = () => {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [outcomes, setOutcomes] = useState<string[]>(['Yes', 'No']);
    const [endBlockOffset, setEndBlockOffset] = useState(1008); // ~1 week default

    const { createMarket, isSubmitting } = useMarketCreation();

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        try {
            // In production, fetch current block height
            const currentBlock = 840000;
            await createMarket(title, description, outcomes, currentBlock + endBlockOffset);
        } catch (err) {
            console.error('Failed to create market:', err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold text-white">Create New Market</h2>
                    <p className="text-slate-400">Step {step} of 3</p>
                </div>
                <div className="flex space-x-2">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className={`h-1.5 w-12 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary-500' : 'bg-slate-800'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Market Question</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Will BTC reach $100k by end of 2024?"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Description (Optional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide more context for this market..."
                                    rows={4}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <OutcomeConfigurator outcomes={outcomes} onChange={setOutcomes} />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Market Duration (Blocks)</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[144, 1008, 4320, 17280].map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setEndBlockOffset(val)}
                                            className={`py-2 text-xs font-bold rounded-lg border transition-all ${endBlockOffset === val ? 'bg-primary-600 border-primary-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                        >
                                            {val === 144 ? '1D' : val === 1008 ? '1W' : val === 4320 ? '1M' : '4M'}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="range"
                                    min={144}
                                    max={50000}
                                    value={endBlockOffset}
                                    onChange={(e) => setEndBlockOffset(Number(e.target.value))}
                                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500 mt-4"
                                />
                                <p className="text-right text-xs text-slate-500">~{Math.round(endBlockOffset / 144)} Days ({endBlockOffset} blocks)</p>
                            </div>
                        </div>
                    )}

                    <div className="flex space-x-4 pt-4">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
                            >
                                Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={!title}
                                className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Create Market'
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="hidden lg:block">
                    <MarketPreview
                        title={title}
                        description={description}
                        outcomes={outcomes}
                        endBlock={840000 + endBlockOffset}
                    />
                </div>
            </div>
        </div>
    );
};
