import React from 'react';
import { User, Link as LinkIcon, Twitter, Github, MapPin, Calendar, Edit3 } from 'lucide-react';

interface RichBioProps {
    username: string;
    bio: string;
    location?: string;
    website?: string;
    joinedDate: string;
    socials: { twitter?: string; github?: string };
    isOwn?: boolean;
}

/**
 * Enhanced user profile bio component with social links, metadata, and glassmorphic editing triggers.
 */
export const RichBio: React.FC<RichBioProps> = ({
    username,
    bio,
    location,
    website,
    joinedDate,
    socials,
    isOwn = false
}) => {
    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl space-y-8 relative overflow-hidden">
            <div className="flex justify-between items-start">
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-white font-display uppercase tracking-tight">{username}</h1>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-lg font-medium">
                        {bio}
                    </p>
                </div>
                {isOwn && (
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-slate-500 hover:text-white transition-all shadow-xl">
                        <Edit3 size={18} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                {location && (
                    <div className="flex items-center space-x-2 text-slate-500">
                        <MapPin size={16} />
                        <span className="text-[11px] font-black uppercase tracking-widest">{location}</span>
                    </div>
                )}
                {website && (
                    <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-indigo-400 hover:text-white transition-all">
                        <LinkIcon size={16} />
                        <span className="text-[11px] font-black uppercase tracking-widest truncate">{website.replace(/^https?:\/\//, '')}</span>
                    </a>
                )}
                <div className="flex items-center space-x-2 text-slate-500">
                    <Calendar size={16} />
                    <span className="text-[11px] font-black uppercase tracking-widest">JOINED {joinedDate}</span>
                </div>
            </div>

            <div className="flex items-center space-x-6">
                {socials.twitter && (
                    <a href={`https://twitter.com/${socials.twitter}`} className="p-3 bg-indigo-400/10 text-indigo-400 rounded-xl hover:bg-indigo-400/20 transition-all border border-indigo-400/20">
                        <Twitter size={18} />
                    </a>
                )}
                {socials.github && (
                    <a href={`https://github.com/${socials.github}`} className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 transition-all border border-slate-700">
                        <Github size={18} />
                    </a>
                )}
            </div>

            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        </div>
    );
};
