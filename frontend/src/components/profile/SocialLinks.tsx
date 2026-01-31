import React from 'react';
import { Twitter, Smartphone, Github, Globe } from 'lucide-react';

interface SocialLinksProps {
    twitter?: string;
    telegram?: string;
    github?: string;
    website?: string;
}

/**
 * Component for displaying a group of social media badges on a user profile.
 */
export const SocialLinks: React.FC<SocialLinksProps> = ({
    twitter,
    telegram,
    github,
    website
}) => {
    const links = [
        { icon: Twitter, value: twitter, url: (v: string) => `https://twitter.com/${v}`, label: 'X (Twitter)' },
        { icon: Smartphone, value: telegram, url: (v: string) => `https://t.me/${v}`, label: 'Telegram' },
        { icon: Github, value: github, url: (v: string) => `https://github.com/${v}`, label: 'GitHub' },
        { icon: Globe, value: website, url: (v: string) => v.startsWith('http') ? v : `https://${v}`, label: 'Website' },
    ].filter(link => link.value);

    if (links.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 py-4">
            {links.map((link, idx) => (
                <a
                    key={idx}
                    href={link.url(link.value!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.label}
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-primary-400 hover:bg-primary-500/5 transition-all active:scale-95 group"
                >
                    <link.icon size={18} className="group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                </a>
            ))}
        </div>
    );
};
