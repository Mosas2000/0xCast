import React, { useState } from 'react';
import { UserPlus, UserMinus, Check } from 'lucide-react';

interface FollowButtonProps {
    initialIsFollowing?: boolean;
    onToggle?: (isFollowing: boolean) => void;
}

/**
 * Interactive button for following/unfollowing users with smooth state transitions.
 */
export const FollowButton: React.FC<FollowButtonProps> = ({
    initialIsFollowing = false,
    onToggle
}) => {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isHovering, setIsHovering] = useState(false);

    const handleToggle = () => {
        const newState = !isFollowing;
        setIsFollowing(newState);
        onToggle?.(newState);
    };

    return (
        <button
            onClick={handleToggle}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`relative flex items-center justify-center space-x-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 border ${isFollowing
                    ? 'bg-white/5 border-white/10 text-slate-400 hover:border-rose-500/50 hover:text-rose-400'
                    : 'bg-primary-500 border-primary-600 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20'
                }`}
        >
            {isFollowing ? (
                <>
                    {isHovering ? (
                        <>
                            <UserMinus size={14} />
                            <span>Unfollow</span>
                        </>
                    ) : (
                        <>
                            <Check size={14} />
                            <span>Following</span>
                        </>
                    )}
                </>
            ) : (
                <>
                    <UserPlus size={14} />
                    <span>Follow</span>
                </>
            )}
        </button>
    );
};
