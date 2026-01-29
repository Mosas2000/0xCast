import React from 'react';

interface FollowSystemProps {
    followers: number;
    following: number;
}

export const FollowSystem: React.FC<FollowSystemProps> = ({ followers, following }) => {
    return (
        <div className="flex items-center divide-x divide-slate-800">
            <div className="pr-6 text-center group cursor-pointer">
                <div className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">{followers}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Followers</div>
            </div>
            <div className="pl-6 text-center group cursor-pointer">
                <div className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">{following}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Following</div>
            </div>
        </div>
    );
};
