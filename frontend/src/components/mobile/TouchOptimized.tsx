import React, { ReactNode } from 'react';

interface TouchOptimizedProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    activeScale?: number;
}

export const TouchOptimized: React.FC<TouchOptimizedProps> = ({
    children,
    onClick,
    className = '',
    activeScale = 0.96
}) => {
    return (
        <button
            onClick={onClick}
            className={`relative active:scale-[${activeScale}] transition-transform duration-100 ease-out outline-none select-none touch-none ${className}`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
        >
            {/* Invisible larger hit area for smaller children */}
            <div className="absolute inset-[-12px] z-[-1]" />
            {children}
        </button>
    );
};
