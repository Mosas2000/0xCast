import React from 'react';

/**
 * Premium SVG loader with smooth spinning animation and glassmorphism styling.
 */
export const LoaderRefined: React.FC<{ size?: number; color?: string }> = ({
    size = 40,
    color = 'currentColor'
}) => {
    return (
        <div className="flex items-center justify-center p-4">
            <svg
                width={size}
                height={size}
                viewBox="0 0 50 50"
                className="animate-spin text-primary-500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    cx="25"
                    cy="25"
                    r="20"
                    stroke={color}
                    strokeWidth="4"
                    strokeOpacity="0.1"
                />
                <path
                    d="M25 5C13.9543 5 5 13.9543 5 25"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};
