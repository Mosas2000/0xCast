import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom 404 Not Found page with glassmorphism design and interactive return button.
 */
export const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 overflow-hidden relative">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] animate-pulse-soft" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-[120px] animate-pulse-soft delay-1000" />

            <div className="z-10 text-center glass-morphism rounded-3xl p-12 border border-white/10 shadow-2xl max-w-lg w-full">
                <h1 className="text-8xl font-black text-white mb-4 animate-float">404</h1>
                <h2 className="text-2xl font-bold text-white mb-6">Lost in the Prediction Space?</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                    The market you're looking for doesn't exist yet, or it's been moved to another dimension.
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-primary-500/20"
                >
                    Return to 0xCast
                </button>
            </div>
        </div>
    );
};

export default NotFoundPage;
