type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
    size?: SpinnerSize;
    center?: boolean;
    className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
};

export function LoadingSpinner({ size = 'md', center = false, className = '' }: LoadingSpinnerProps) {
    const sizeClass = sizeClasses[size];
    const centerClass = center ? 'flex items-center justify-center' : '';

    const spinnerClasses = `${sizeClass} border-primary-500 border-t-transparent rounded-full animate-spin`;

    if (center) {
        return (
            <div className={`${centerClass} ${className}`.trim()}>
                <div className={spinnerClasses} />
            </div>
        );
    }

    return <div className={`${spinnerClasses} ${className}`.trim()} />;
}
