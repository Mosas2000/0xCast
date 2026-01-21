import { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface LazyImageProps {
    src: string;
    alt: string;
    placeholder?: string;
    className?: string;
}

export function LazyImage({ src, alt, placeholder, className = '' }: LazyImageProps) {
    const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setHasError(true);
    };

    return (
        <div ref={ref} className={`relative overflow-hidden ${className}`.trim()}>
            {!isVisible && placeholder && (
                <div className="absolute inset-0 bg-slate-800 animate-pulse" />
            )}

            {isVisible && !hasError && (
                <img
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                />
            )}

            {hasError && (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                    <div className="text-center text-slate-400">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">Failed to load image</p>
                    </div>
                </div>
            )}
        </div>
    );
}
