import React from 'react';

interface TrendIndicatorProps {
    trend: 'up' | 'down' | 'neutral';
    size?: 'sm' | 'md' | 'lg';
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
    trend,
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    if (trend === 'up') {
        return (
            <svg className={`${sizeClasses[size]} text-green-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        );
    }

    if (trend === 'down') {
        return (
            <svg className={`${sizeClasses[size]} text-red-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        );
    }

    return (
        <svg className={`${sizeClasses[size]} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
        </svg>
    );
};
