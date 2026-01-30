import React from 'react';
import { useReputation } from '../../hooks/useReputation';

interface ReputationBadgeProps {
    userStats: {
        totalTrades: number;
        winRate: number;
        marketsCreated: number;
        profitLoss: number;
    };
    showProgress?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({
    userStats,
    showProgress = false,
    size = 'medium',
}) => {
    const { score, level, progression } = useReputation(userStats);

    const sizeClasses = {
        small: 'px-2 py-1 text-xs',
        medium: 'px-3 py-1.5 text-sm',
        large: 'px-4 py-2 text-base',
    };

    const colorClasses = {
        gray: 'bg-gray-100 text-gray-800 border-gray-300',
        blue: 'bg-blue-100 text-blue-800 border-blue-300',
        green: 'bg-green-100 text-green-800 border-green-300',
        purple: 'bg-purple-100 text-purple-800 border-purple-300',
        orange: 'bg-orange-100 text-orange-800 border-orange-300',
        red: 'bg-red-100 text-red-800 border-red-300',
    };

    return (
        <div className="inline-block">
            <div
                className={`${sizeClasses[size]} ${colorClasses[level.color as keyof typeof colorClasses]} rounded-full border-2 font-bold inline-flex items-center gap-1`}
            >
                <span>{level.icon}</span>
                <span>{level.title}</span>
                {size !== 'small' && <span className="opacity-70">({score})</span>}
            </div>

            {showProgress && progression.next && (
                <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress to {progression.next.title}</span>
                        <span>{Math.floor(progression.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${level.color === 'gray' ? 'bg-gray-500' :
                                    level.color === 'blue' ? 'bg-blue-500' :
                                        level.color === 'green' ? 'bg-green-500' :
                                            level.color === 'purple' ? 'bg-purple-500' :
                                                level.color === 'orange' ? 'bg-orange-500' :
                                                    'bg-red-500'
                                }`}
                            style={{ width: `${progression.progress}%` }}
                        ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {progression.next.minScore - score} points to next level
                    </div>
                </div>
            )}
        </div>
    );
};
