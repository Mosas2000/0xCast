interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circle' | 'rect';
    className?: string;
}

export function Skeleton({
    width = '100%',
    height = '1rem',
    variant = 'rect',
    className = ''
}: SkeletonProps) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'circle':
                return 'rounded-full';
            case 'text':
                return 'rounded';
            case 'rect':
            default:
                return 'rounded-lg';
        }
    };

    const widthStyle = typeof width === 'number' ? `${width}px` : width;
    const heightStyle = typeof height === 'number' ? `${height}px` : height;

    return (
        <div
            className={`bg-slate-700 animate-pulse ${getVariantStyles()} ${className}`.trim()}
            style={{ width: widthStyle, height: heightStyle }}
        >
            <div className="shimmer" />
        </div>
    );
}
