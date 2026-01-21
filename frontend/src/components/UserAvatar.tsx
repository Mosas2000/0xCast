import { generateAvatarGradient, shortenAddress } from '../utils/avatarHelpers';

interface UserAvatarProps {
    address: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    onClick?: () => void;
    className?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-2xl',
};

export function UserAvatar({ address, size = 'md', onClick, className = '' }: UserAvatarProps) {
    const [color1, color2] = generateAvatarGradient(address);
    const initials = address.slice(0, 2).toUpperCase();

    return (
        <div
            onClick={onClick}
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
                } ${className}`.trim()}
            style={{
                background: `linear-gradient(135deg, ${color1}, ${color2})`,
            }}
            title={shortenAddress(address)}
        >
            {initials}
        </div>
    );
}
