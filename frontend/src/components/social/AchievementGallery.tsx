import React from 'react';
import { Trophy, Star, Zap, Users, Target, ShieldCheck, Lock } from 'lucide-react';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    unlocked: boolean;
    rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
    progress?: number;
}

/**
 * A visually stunning gallery for displaying user milestones and achievements.
 */
export const AchievementGallery: React.FC = () => {
    const achievements: Achievement[] = [
        { id: '1', title: 'First Stake', description: 'Placed your first prediction on 0xCast.', icon: Zap, unlocked: true, rarity: 'Common' },
        { id: '2', title: 'Oracle Apprentice', description: 'Correctly predicted 5 market outcomes.', icon: Target, unlocked: true, rarity: 'Rare', progress: 100 },
        { id: '3', title: 'Social Butterfly', description: 'Refer 10 friends to the platform.', icon: Users, unlocked: false, rarity: 'Epic', progress: 40 },
        { id: '4', title: 'Diamond Hands', description: 'Hold a winning position for over 30 days.', icon: ShieldCheck, unlocked: false, rarity: 'Legendary', progress: 15 },
        { id: '5', title: 'Top 1% Trader', description: 'Reach the top of the global leaderboard.', icon: Trophy, unlocked: false, rarity: 'Legendary' },
        { id: '6', title: 'Early Adopter', description: 'Join during the Phase 12 beta.', icon: Star, unlocked: true, rarity: 'Epic' }
    ];

    const rarityColors = {
        Common: 'from-slate-400 to-slate-600',
        Rare: 'from-blue-400 to-indigo-600',
        Epic: 'from-purple-400 to-fuchsia-600',
        Legendary: 'from-amber-400 to-orange-600'
    };

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">My Achievements</h2>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Milestones and Progression</p>
                </div>
                <div className="flex items-center space-x-2 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-2xl bg-amber-500/5">
                    <Trophy size={18} />
                    <span className="text-xs font-black">450 POINTS</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((a) => (
                    <div
                        key={a.id}
                        className={`relative group p-6 rounded-[2rem] border transition-all duration-500 ${a.unlocked ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-slate-950/50 border-white/5 grayscale opacity-60'}`}
                    >
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${rarityColors[a.rarity]} p-0.5 mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform`}>
                            <div className="w-full h-full bg-slate-900 rounded-[0.9rem] flex items-center justify-center text-white">
                                <a.icon size={24} />
                            </div>
                        </div>

                        {!a.unlocked && (
                            <div className="absolute top-4 right-4 text-slate-700">
                                <Lock size={16} />
                            </div>
                        )}

                        <h4 className="text-white font-bold text-lg mb-1">{a.title}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed mb-6">{a.description}</p>

                        {a.progress !== undefined && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                    <span>Progress</span>
                                    <span>{a.progress}%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${rarityColors[a.rarity]} transition-all duration-1000`}
                                        style={{ width: `${a.progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className={`mt-4 inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${a.unlocked ? 'text-white' : 'text-slate-600'}`}>
                            {a.rarity}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
