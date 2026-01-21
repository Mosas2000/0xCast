import { Avatar } from './Avatar';

export interface AvatarData {
    src?: string;
    alt: string;
    fallback?: string;
}

interface AvatarGroupProps {
    avatars: AvatarData[];
    max?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function AvatarGroup({ avatars, max = 5, size = 'md', className = '' }: AvatarGroupProps) {
    const visibleAvatars = avatars.slice(0, max);
    const remainingCount = avatars.length - max;

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    return (
        <div className={`flex items-center ${className}`.trim()}>
            <div className="flex -space-x-2">
                {visibleAvatars.map((avatar, index) => (
                    <div
                        key={index}
                        className="relative ring-2 ring-slate-900 rounded-full hover:z-10 transition-transform hover:scale-110"
                        title={avatar.alt}
                    >
                        <Avatar
                            src={avatar.src}
                            alt={avatar.alt}
                            fallback={avatar.fallback}
                            size={size}
                        />
                    </div>
                ))}

                {remainingCount > 0 && (
                    <div
                        className={`${sizeClasses[size]} rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center font-medium text-slate-300 hover:bg-slate-600 transition-colors cursor-pointer`}
                        title={`+${remainingCount} more`}
                    >
                        +{remainingCount}
                    </div>
                )}
            </div>
        </div>
    );
}
