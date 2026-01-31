import React, { useState } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useConnect } from '@stacks/connect-react';

interface UserProfileProps {
    address?: string;
    isOwnProfile?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ address, isOwnProfile = false }) => {
    const { profile, loading, error, updateProfile } = useUserProfile(address);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        username: '',
        bio: '',
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error || 'Profile not found'}
            </div>
        );
    }

    const handleEdit = () => {
        setEditForm({
            username: profile.username || '',
            bio: profile.bio || '',
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        await updateProfile(editForm);
        setIsEditing(false);
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>

            {/* Profile Info */}
            <div className="px-6 pb-6">
                <div className="flex items-end -mt-16 mb-4">
                    <img
                        src={profile.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.address}`}
                        alt={profile.username}
                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                    />
                    <div className="ml-4 mb-2 flex-1">
                        {isOwnProfile && !isEditing && (
                            <button
                                onClick={handleEdit}
                                className="float-right px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                value={editForm.username}
                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea
                                value={editForm.bio}
                                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">{profile.username}</h1>
                        <p className="text-gray-600 mt-1">{profile.address.slice(0, 8)}...{profile.address.slice(-6)}</p>
                        {profile.bio && <p className="text-gray-700 mt-3">{profile.bio}</p>}
                        <p className="text-sm text-gray-500 mt-2">Joined {formatDate(profile.joinedDate)}</p>
                    </div>
                )}

                {/* Social Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{profile.followers}</div>
                        <div className="text-sm text-gray-600">Followers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{profile.following}</div>
                        <div className="text-sm text-gray-600">Following</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{profile.achievements.length}</div>
                        <div className="text-sm text-gray-600">Achievements</div>
                    </div>
                </div>

                {/* Trading Stats */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Trading Statistics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">Total Trades</div>
                            <div className="text-2xl font-bold text-gray-900">{profile.stats.totalTrades}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">Win Rate</div>
                            <div className="text-2xl font-bold text-green-600">{profile.stats.winRate.toFixed(1)}%</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">Total Volume</div>
                            <div className="text-2xl font-bold text-gray-900">{formatCurrency(profile.stats.totalVolume)}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">Markets Created</div>
                            <div className="text-2xl font-bold text-gray-900">{profile.stats.marketsCreated}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">Profit/Loss</div>
                            <div className={`text-2xl font-bold ${profile.stats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(profile.stats.profitLoss)}
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">Global Rank</div>
                            <div className="text-2xl font-bold text-purple-600">#{profile.stats.rank}</div>
                        </div>
                    </div>
                </div>

                {/* Level & XP */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-gray-900">Level {profile.stats.level}</h2>
                        <span className="text-sm text-gray-600">{profile.stats.xp} XP</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${(profile.stats.xp % 1000) / 10}%` }}
                        ></div>
                    </div>
                </div>

                {/* Achievements */}
                {profile.achievements.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>
                        <div className="flex flex-wrap gap-2">
                            {profile.achievements.map((achievement) => (
                                <span
                                    key={achievement}
                                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                                >
                                    🏆 {achievement.replace(/_/g, ' ').toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
