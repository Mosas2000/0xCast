import React from 'react';

interface UserAvatarGroupProps {
    users: { id: string, avatar?: string }[];
    max?: number;
}

/**
 * Visual stacked avatar group to show recent traders or participants on a market.
 */
export const UserAvatarGroup: React.FC<UserAvatarGroupProps> = ({ users, max = 3 }) => {
    const displayUsers = users.slice(0, max);
    const remaining = Math.max(0, users.length - max);

    return (
        <div className="flex items-center -space-x-2.5">
            {displayUsers.map((user, idx) => (
                <div
                    key={user.id}
                    className="relative z-[idx] w-7 h-7 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center overflow-hidden transition-transform hover:scale-110 hover:z-20 cursor-pointer"
                    title={`User ${user.id.substring(0, 6)}`}
                >
                    {user.avatar ? (
                        <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-[10px] text-slate-400">👤</span>
                    )}
                </div>
            ))}

            {remaining > 0 && (
                <div className="w-7 h-7 rounded-full border-2 border-slate-950 bg-slate-900 flex items-center justify-center z-0">
                    <span className="text-[8px] font-black text-slate-400">+{remaining}</span>
                </div>
            )}
        </div>
    );
};
