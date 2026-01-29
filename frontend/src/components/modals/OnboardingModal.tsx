import React, { useState } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';

/**
 * Onboarding wizard to introduce new users to 0xCast prediction markets.
 */
export const OnboardingModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
    isOpen,
    onClose
}) => {
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        else onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 flex justify-between items-center border-b border-white/5">
                    <h2 className="text-xl font-bold text-white font-display">Welcome to 0xCast</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="text-center animate-fade-in">
                            <div className="text-4xl mb-4">🔮</div>
                            <h3 className="text-lg font-bold text-white mb-2">Predict the Future</h3>
                            <p className="text-slate-400">Discover markets and use your knowledge to predict outcomes on the Stacks blockchain.</p>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="text-center animate-fade-in">
                            <div className="text-4xl mb-4">💰</div>
                            <h3 className="text-lg font-bold text-white mb-2">Stake and Earn</h3>
                            <p className="text-slate-400">Place your STX on the outcomes you believe in and earn rewards for correct predictions.</p>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="text-center animate-fade-in">
                            <div className="text-4xl mb-4">🛡️</div>
                            <h3 className="text-lg font-bold text-white mb-2">Secure & Transparent</h3>
                            <p className="text-slate-400">Every trade is secured by smart contracts, ensuring decentralized and fair resolutions.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white/5 flex flex-col items-center">
                    <div className="flex space-x-2 mb-6">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 w-8 rounded-full transition-all ${step === i + 1 ? 'bg-primary-500' : 'bg-slate-700'}`}
                            />
                        ))}
                    </div>
                    <button
                        onClick={nextStep}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center transition-all group"
                    >
                        {step === totalSteps ? 'Get Started' : 'Next Step'}
                        {step === totalSteps ? <Check size={18} className="ml-2" /> : <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            </div>
        </div>
    );
};
