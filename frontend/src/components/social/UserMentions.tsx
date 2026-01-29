import React, { useState, useEffect } from 'react';

interface UserMention {
    address: string;
    name?: string;
}

interface UserMentionsProps {
    onSelect: (user: UserMention) => void;
    query: string;
}

export const UserMentions: React.FC<UserMentionsProps> = ({ onSelect, query }) => {
    const [suggestions, setSuggestions] = useState<UserMention[]>([]);

    useEffect(() => {
        if (query.length > 0) {
            // Mock user search
            const mockUsers: UserMention[] = [
                { address: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T', name: 'CastAdmin' },
                { address: 'SP2J...P68', name: 'Nakata' },
                { address: 'SP1P...KJG', name: 'StacksMaxi' },
            ].filter(u =>
                u.address.toLowerCase().includes(query.toLowerCase()) ||
                u.name?.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(mockUsers);
        } else {
            setSuggestions([]);
        }
    }, [query]);

    if (suggestions.length === 0) return null;

    return (
        <div className="absolute z-50 bottom-full mb-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-2 border-b border-slate-800 bg-slate-800/50">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mention User</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
                {suggestions.map((user) => (
                    <button
                        key={user.address}
                        onClick={() => onSelect(user)}
                        className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-primary-600/10 transition-colors text-left group"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400 text-xs">
                            {user.name?.[0] || 'S'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white truncate group-hover:text-primary-400 transition-colors">
                                {user.name || 'Anonymous'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">
                                {user.address}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
