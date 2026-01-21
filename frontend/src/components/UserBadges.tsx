interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    earnedDate?: Date;
}

interface UserBadgesProps {
    achievements: Achievement[];
    className?: string;
}

export function UserBadges({ achievements, className = '' }: UserBadgesProps) {
    const earnedAchievements = achievements.filter(a => a.earned);

    if (earnedAchievements.length === 0) {
        return (
            <div className={`bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center ${className}`.trim()}>
                <p className="text-slate-400">No badges earned yet</p>
                <p className="text-sm text-slate-500 mt-2">Start trading to earn achievements!</p>
            </div>
        );
    }

    return (
        <div className={`bg-slate-800/50 border border-slate-700 rounded-xl p-6 ${className}`.trim()}>
            <h3 className="text-lg font-bold text-white mb-4">Achievements</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {earnedAchievements.map((achievement) => (
                    <div
                        key={achievement.id}
                        className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-primary-500/50 transition-colors group"
                        title={achievement.description}
                    >
                        <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                            {achievement.icon}
                        </div>
                        <p className="text-sm font-medium text-white mb-1">{achievement.name}</p>
                        {achievement.earnedDate && (
                            <p className="text-xs text-slate-500">
                                {achievement.earnedDate.toLocaleDateString()}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
