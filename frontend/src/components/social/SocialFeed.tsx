import React from 'react';
import { Newspaper, Users, Zap, MessageSquare, Repeat, Heart } from 'lucide-react';

interface FeedItem {
    id: string;
    user: string;
    action: string;
    content: string;
    timestamp: string;
    avatar: string;
    image?: string;
    likes: number;
    comments: number;
}

/**
 * A centralized social feed displaying top activities, market news, and community highlights.
 */
export const SocialFeed: React.FC = () => {
    const feedItems: FeedItem[] = [
        {
            id: 'f1',
            user: 'StacksGuru',
            action: 'posted a new prediction',
            content: 'I'm calling it: STX will outperform other L2s by the end of Q1.The liquidity flow is unmistakable.',
      timestamp: '15m ago',
            avatar: 'https://i.pravatar.cc/150?u=guru',
            likes: 45,
            comments: 12
        },
        {
            id: 'f2',
            user: 'AlphaViking',
            action: 'won a major market',
            content: 'Just closed my position on "BTC < $40k" with a massive 450% ROI! 🍻',
            timestamp: '1h ago',
            avatar: 'https://i.pravatar.cc/150?u=viking',
            image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=400',
            likes: 128,
            comments: 34
        }
    ];

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center justify-between mb-8 px-4">
                <div className="flex items-center space-x-3 text-indigo-400">
                    <Newspaper size={20} />
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest">Protocol Pulse</h2>
                </div>
                <div className="flex items-center space-x-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">LIVE FEED</span>
                </div>
            </div>

            {feedItems.map((item) => (
                <div key={item.id} className="glass-morphism rounded-[2.5rem] border border-white/10 overflow-hidden hover:border-white/20 transition-all group">
                    <div className="p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <img src={item.avatar} className="w-12 h-12 rounded-2xl border border-white/10 shadow-lg" alt={item.user} />
                                <div>
                                    <h4 className="text-white font-bold leading-none mb-1 hover:text-indigo-400 transition-colors cursor-pointer">{item.user}</h4>
                                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">{item.action}</p>
                                </div>
                            </div>
                            <span className="text-[9px] font-black text-slate-700 font-mono italic">{item.timestamp}</span>
                        </div>

                        <p className="text-slate-300 text-sm leading-relaxed font-medium">
                            {item.content}
                        </p>

                        {item.image && (
                            <div className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                                <img src={item.image} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-1000" alt="News" />
                            </div>
                        )}

                        <div className="flex items-center space-x-8 pt-4 border-t border-white/5">
                            <button className="flex items-center space-x-2 text-slate-600 hover:text-rose-500 transition-colors">
                                <Heart size={18} className="transition-transform active:scale-150" />
                                <span className="text-xs font-black">{item.likes}</span>
                            </button>
                            <button className="flex items-center space-x-2 text-slate-600 hover:text-indigo-400 transition-colors">
                                <MessageSquare size={18} />
                                <span className="text-xs font-black">{item.comments}</span>
                            </button>
                            <button className="flex items-center space-x-2 text-slate-600 hover:text-emerald-400 transition-colors">
                                <Repeat size={18} />
                                <span className="text-xs font-black">RECAST</span>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
