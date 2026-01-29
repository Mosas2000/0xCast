import React, { useState } from 'react';

interface Comment {
    id: string;
    user: string;
    text: string;
    timestamp: string;
    replies?: Comment[];
}

export const MarketComments: React.FC = () => {
    const [comments, setComments] = useState<Comment[]>([
        {
            id: '1',
            user: 'SP2J...P68',
            text: 'This Nakamoto upgrade is a game changer for Stacks. Staking Yes!',
            timestamp: '5 mins ago',
            replies: [
                {
                    id: '2',
                    user: 'SP1P...KJG',
                    text: 'Agreed, the latency reduction is huge.',
                    timestamp: '2 mins ago',
                }
            ]
        },
        {
            id: '3',
            user: 'SP4A...W5T',
            text: 'I\'m worried about the activation timeline though.',
            timestamp: '1 hour ago',
        }
    ]);

    const [newComment, setNewComment] = useState('');

    const handlePost = () => {
        if (newComment.trim()) {
            const comment: Comment = {
                id: Date.now().toString(),
                user: 'You',
                text: newComment,
                timestamp: 'Just now',
            };
            setComments([comment, ...comments]);
            setNewComment('');
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white">Discussion</h3>
            </div>

            <div className="p-6 space-y-8">
                {/* Input Area */}
                <div className="flex space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center font-bold text-primary-400">
                        Y
                    </div>
                    <div className="flex-1 space-y-3">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="What's your take on this market?"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                            rows={3}
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handlePost}
                                disabled={!newComment.trim()}
                                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all"
                            >
                                Post Comment
                            </button>
                        </div>
                    </div>
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="space-y-4">
                            <div className="flex space-x-4">
                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400">
                                    {comment.user[0]}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-bold text-white font-mono">{comment.user}</span>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">{comment.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed">{comment.text}</p>
                                    <button className="text-xs text-primary-400 font-bold hover:underline">Reply</button>
                                </div>
                            </div>

                            {/* Replies */}
                            {comment.replies && (
                                <div className="ml-14 space-y-4 border-l-2 border-slate-800 pl-4">
                                    {comment.replies.map((reply) => (
                                        <div key={reply.id} className="flex space-x-4">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-500 text-xs">
                                                {reply.user[0]}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-bold text-white font-mono">{reply.user}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{reply.timestamp}</span>
                                                </div>
                                                <p className="text-sm text-slate-400 leading-relaxed">{reply.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
