import React, { useState } from 'react';

/**
 * Refined tooltip component with glassmorphism styling and smooth transitions.
 */
export const TooltipRefined: React.FC<{ content: string; children: React.ReactNode }> = ({
    content,
    children
}) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-lg shadow-xl z-50 whitespace-nowrap animate-fade-in">
                    <span className="text-xs font-medium text-white">{content}</span>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800/90" />
                </div>
            )}
        </div>
    );
};
