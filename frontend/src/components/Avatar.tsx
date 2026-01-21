import { useState } from 'react';

interface AvatarProps {
    src?: string;
    alt?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    fallback?: string;
    status?: 'online' | 'offline' | 'away';
    className?: string;
}

export function Avatar({
    src,
    alt = '',
    size = 'md',
    fallback,
    status,
    className = '',
}: AvatarProps) {
    const [imageError, setImageError] = useState(false);

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    const statusColors = {
        online: 'bg-green-500',
        offline: 'bg-slate-500',
        away: 'bg-yellow-500',
    };

    const statusSizes = {
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
        xl: 'w-4 h-4',
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className={`relative inline-block ${className}`.trim()}>
            <div
                className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-medium text-white`}
            >
                {src && !imageError ? (
                    <img
                        src={src}
                        alt={alt}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span>{fallback ? getInitials(fallback) : alt.slice(0, 2).toUpperCase()}</span>
                )}
            </div>

            {status && (
                <div
                    className={`absolute bottom-0 right-0 ${statusSizes[size]} ${statusColors[status]} rounded-full border-2 border-slate-900`}
                />
            )}
        </div>
    );
}
