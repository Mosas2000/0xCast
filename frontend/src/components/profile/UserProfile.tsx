import React, { useState } from 'react';
import { UserStats } from './UserStats';
import { FollowSystem } from './FollowSystem';
import { SocialLinks } from './SocialLinks';

interface UserProfileProps {
    address: string;
    initialName?: string;
    initialBio?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ address, initialName, initialBio }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(initialName || 'Anonymous');
    const [bio, setBio] = useState(initialBio || 'No bio provided yet.');
    const [website, setWebsite] = useState('');

    const handleSave = () => {
        setIsEditing(false);
        // In production, this would call an API or update an on-chain profile
        console.log('Saved profile:', { name, bio });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="h-32 bg-gradient-to-r from-primary-600 to-blue-600 relative">
                    <div className="absolute -bottom-12 left-8 p-1 bg-slate-950 rounded-2xl shadow-xl">
                        <div className="w-24 h-24 bg-slate-800 rounded-xl flex items-center justify-center text-4xl border border-slate-700">
                            👤
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        {isEditing ? (
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="text-2xl font-bold bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-white outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        ) : (
                            <h2 className="text-3xl font-bold text-white">{name}</h2>
                        )}
                        <div className="flex items-center space-x-2 text-slate-500 font-mono text-sm">
                            <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{address}</span>
                            <button className="hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        </div>
                        <SocialLinks twitter="0xCast" website={website} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <FollowSystem followers={125} following={42} />
                        <button
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${isEditing ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                                }`}
                        >
                            {isEditing ? 'Save Profile' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                <div className="px-8 pb-8 space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">About</h3>
                    {isEditing ? (
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                            rows={3}
                        />
                    ) : (
                        <p className="text-slate-400 leading-relaxed max-w-2xl">{bio}</p>
                    )}
                </div>
            </div>

            <UserStats winRate={64} totalTrades={128} netWorth="15,420" />
        </div>
    );
};
