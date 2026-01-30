import { useState, useEffect } from 'react';

interface FollowData {
    followers: Set<string>;
    following: Set<string>;
}

export const useFollowSystem = (currentUserAddress?: string) => {
    const [followData, setFollowData] = useState<FollowData>({
        followers: new Set(),
        following: new Set(),
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!currentUserAddress) return;

        // In a real implementation, fetch from API or contract
        // For now, use localStorage for persistence
        const stored = localStorage.getItem(`follow_${currentUserAddress}`);
        if (stored) {
            const parsed = JSON.parse(stored);
            setFollowData({
                followers: new Set(parsed.followers || []),
                following: new Set(parsed.following || []),
            });
        }
    }, [currentUserAddress]);

    const isFollowing = (targetAddress: string): boolean => {
        return followData.following.has(targetAddress);
    };

    const followUser = async (targetAddress: string) => {
        if (!currentUserAddress || targetAddress === currentUserAddress) return;

        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            const newFollowing = new Set(followData.following);
            newFollowing.add(targetAddress);

            const newData = { ...followData, following: newFollowing };
            setFollowData(newData);

            // Persist to localStorage
            localStorage.setItem(
                `follow_${currentUserAddress}`,
                JSON.stringify({
                    followers: Array.from(newData.followers),
                    following: Array.from(newData.following),
                })
            );
        } catch (error) {
            console.error('Failed to follow user:', error);
        } finally {
            setLoading(false);
        }
    };

    const unfollowUser = async (targetAddress: string) => {
        if (!currentUserAddress) return;

        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            const newFollowing = new Set(followData.following);
            newFollowing.delete(targetAddress);

            const newData = { ...followData, following: newFollowing };
            setFollowData(newData);

            localStorage.setItem(
                `follow_${currentUserAddress}`,
                JSON.stringify({
                    followers: Array.from(newData.followers),
                    following: Array.from(newData.following),
                })
            );
        } catch (error) {
            console.error('Failed to unfollow user:', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        followers: followData.followers,
        following: followData.following,
        isFollowing,
        followUser,
        unfollowUser,
        loading,
    };
};
