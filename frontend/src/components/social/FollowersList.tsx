import React, { useState } from 'react';

interface Follower {
    address: string;
    username: string;
    avatar: string;
    isFollowing: boolean;
}

interface FollowersListProps {
    userAddress: string;
    type: 'followers' | 'following';
    onUserClick?: (address: string) => void;
}

export const FollowersList: React.FC<FollowersListProps> = ({
    userAddress,
    type,
    onUserClick,
}) => {
    const [followers] = useState<Follower[]>(() => {
        // Mock data - in real app, fetch from API
        return Array.from({ length: 10 }, (_, i) => ({
            address: `SP${Math.random().toString(36).substring(7).toUpperCase()}`,
            username: `User${Math.floor(Math.random() * 1000)}`,
            avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${i}`,
            isFollowing: Math.random() > 0.5,
        }));
    });

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
                {type === 'followers' ? 'Followers' : 'Following'}
            </h2>

            <div className="space-y-3">
                {followers.map((follower) => (
                    <div
                        key={follower.address}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <button
                            onClick={() => onUserClick?.(follower.address)}
                            className="flex items-center gap-3 flex-1"
                        >
                            <img
                                src={follower.avatar}
                                alt={follower.username}
                                className="w-12 h-12 rounded-full"
                            />
                            <div className="text-left">
                                <div className="font-semibold text-gray-900">{follower.username}</div>
                                <div className="text-sm text-gray-500">
                                    {follower.address.slice(0, 8)}...{follower.address.slice(-6)}
                                </div>
                            </div>
                        </button>

                        <button
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${follower.isFollowing
                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                        >
                            {follower.isFollowing ? 'Following' : 'Follow'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
