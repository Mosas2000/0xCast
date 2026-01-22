interface LoadingStateProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Centralized loading component with consistent styling
 * Used across the app for loading states
 */
export function LoadingState({ message, size = 'md', className = '' }: LoadingStateProps) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    return (
        <div className={`flex flex-col items-center justify-center py-12 ${className}`.trim()}>
            {/* Spinner */}
            <div
                className={`
                    ${sizeClasses[size]}
                    border-4 border-primary-600/20 border-t-primary-600
                    rounded-full animate-spin
                `}
            />

            {/* Optional Message */}
            {message && (
                <p className={`mt-4 text-slate-400 ${textSizeClasses[size]}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
