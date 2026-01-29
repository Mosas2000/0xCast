import React from 'react';

/**
 * Premium SVG empty state illustration with animated glassmorphism layers.
 */
export const EmptyStateIllustration: React.FC<{ message?: string }> = ({
    message = "No data found"
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="relative w-48 h-48 mb-6">
                <div className="absolute inset-0 bg-primary-500/10 rounded-full blur-3xl animate-pulse-soft" />
                <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full relative z-10 animate-float"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M100 20C55.8172 20 20 55.8172 20 100C20 144.183 55.8172 180 100 180C144.183 180 180 144.183 180 100"
                        stroke="url(#grad1)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="10 20"
                    />
                    <circle cx="100" cy="100" r="40" fill="url(#grad2)" fillOpacity="0.2" />
                    <path
                        d="M85 85L115 115M115 85L85 115"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeLinecap="round"
                        className="text-primary-400"
                    />
                    <defs>
                        <linearGradient id="grad1" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#3b82f6" />
                            <stop offset="1" stopColor="#8b5cf6" />
                        </linearGradient>
                        <linearGradient id="grad2" x1="60" y1="60" x2="140" y2="140" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#3b82f6" />
                            <stop offset="1" stopColor="#8b5cf6" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <p className="text-xl font-bold text-white mb-2">{message}</p>
            <p className="text-slate-400 max-w-xs mx-auto">
                Join the market space and start your prediction journey today.
            </p>
        </div>
    );
};
