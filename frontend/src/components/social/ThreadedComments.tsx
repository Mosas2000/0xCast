import React from 'react';
import { MessageSquare, Heart, Reply, MoreHorizontal, Share2 } from 'lucide-react';

interface Comment {
    id: string;
    user: string;
    text: string;
    likes: number;
    replies: Comment[];
    timestamp: string;
}

/**
 * Nested hierarchical comment system for deep market analysis and structured debates.
 */
export const ThreadedComments: React.FC = () => {
    const comments: Comment[] = [
        {
            id: 'c1',
            user: 'AlphaTrader',
            text: 'The macro indicators suggest a significant shift by next week. The YES side is undervalued here.',
            likes: 12,
            timestamp: '1h ago',
            replies: [
                {
                    id: 'c2',
                    user: 'MarketWizard',
                    text: 'Agreed, but watch the liquidity depth. A large move could wipe out the current spread.',
                    likes: 5,
                    timestamp: '45m ago',
                    replies: []
                }
            ]
        },
        {
            id: 'c3',
            user: 'DataScientist',
            text: 'Does anyone have the historical correlation with STX price for this type of market?',
            likes: 8,
            timestamp: '30m ago',
            replies: []
        }
    ];

    const renderComment = (comment: Comment, isReply: boolean = false) => (
        <div key={comment.id} className={`flex space-x-4 ${isReply ? 'ml-12 mt-4' : 'mt-8'} group`}>
            <div className="flex flex-col items-center">
                <img
                    src={`https://i.pravatar.cc/150?u=${comment.user}`}
                    className={`rounded-2xl border border-white/10 shadow-lg ${isReply ? 'w-8 h-8' : 'w-12 h-12'}`}
                    alt={comment.user}
                />
                {comment.replies.length > 0 && (
                    <div className="w-px h-full bg-white/5 my-2" />
                )}
            </div>

            <div className="flex-1 space-y-2">
                <div className="bg-white/5 rounded-[1.5rem] p-5 border border-white/5 group-hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-white hover:text-indigo-400 cursor-pointer uppercase tracking-widest">{comment.user}</span>
                            <span className="text-[9px] font-bold text-slate-600 font-mono">{comment.timestamp}</span>
                        </div>
                        <button className="text-slate-700 hover:text-white transition-colors">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                        {comment.text}
                    </p>
                </div>

                <div className="flex items-center space-x-6 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                    <button className="flex items-center space-x-2 hover:text-rose-500 transition-colors">
                        <Heart size={14} />
                        <span>{comment.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:text-white transition-colors">
                        <Reply size={14} />
                        <span>REPLY</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:text-indigo-500 transition-colors">
                        <Share2 size={14} />
                        <span>SHARE</span>
                    </button>
                </div>

                {comment.replies.map(reply => renderComment(reply, true))}
            </div>
        </div>
    );

    return (
        <div className="glass-morphism rounded-[3rem] p-10 border border-white/10 shadow-2xl">
            <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                    <MessageSquare size={20} />
                </div>
                <h3 className="text-2xl font-bold text-white">Debate and Insights</h3>
            </div>

            <div className="space-y-4">
                {comments.map(c => renderComment(c))}
            </div>

            <div className="mt-12 flex items-center space-x-4 p-4 bg-slate-950 rounded-[2rem] border border-white/5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                    <Reply size={18} />
                </div>
                <input
                    placeholder="Add your expert opinion..."
                    className="bg-transparent border-none text-sm text-white focus:ring-0 w-full font-medium"
                />
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">POST</button>
            </div>
        </div>
    );
};
