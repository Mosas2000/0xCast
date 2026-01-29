import React from 'react';

/**
 * Custom SVG icon for STX currency representation with glassmorphism effects.
 */
export const BalanceIcon: React.FC<{ size?: number }> = ({ size = 20 }) => {
    return (
        <div
            className="flex items-center justify-center rounded-full bg-primary-500/10 border border-primary-500/20 shadow-inner"
            style={{ width: size, height: size }}
        >
            <svg
                width={size * 0.6}
                height={size * 0.6}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary-400"
            >
                <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M21 12L12 17L3 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M21 17L12 22L3 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
};
