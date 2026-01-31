import React, { useState } from 'react';

export interface Comment {
    id: string;
    author: {
        address: string;
        username: string;
        avatar: string;
    };
    content: string;
    timestamp: number;
    likes: number;
    replies?: Comment[];
}

interface CommentThreadProps {
    comment: Comment;
    onReply?: (commentId: string, content: string) => void;
    onLike?: (commentId: string) => void;
    depth?: number;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
    comment,
    onReply,
    onLike,
    depth = 0,
}) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    const handleSubmitReply = () => {
        if (replyContent.trim() && onReply) {
            onReply(comment.id, replyContent);
            setReplyContent('');
            setShowReplyForm(false);
        }
    };

    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const maxDepth = 3;
    const marginLeft = depth > 0 ? 'ml-8' : '';

    return (
        <div className={`${marginLeft} ${depth > 0 ? 'border-l-2 border-gray-200 pl-4' : ''}`}>
            <div className="flex gap-3 mb-4">
                <img
                    src={comment.author.avatar}
                    alt={comment.author.username}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{comment.author.username}</span>
                            <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm">
                        <button
                            onClick={() => onLike?.(comment.id)}
                            className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
                        >
                            <span>👍</span>
                            <span>{comment.likes}</span>
                        </button>
                        {depth < maxDepth && (
                            <button
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                className="text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                Reply
                            </button>
                        )}
                    </div>

                    {showReplyForm && (
                        <div className="mt-3">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={2}
                            />
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={handleSubmitReply}
                                    className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                >
                                    Reply
                                </button>
                                <button
                                    onClick={() => {
                                        setShowReplyForm(false);
                                        setReplyContent('');
                                    }}
                                    className="px-4 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {comment.replies && comment.replies.length > 0 && (
                <div className="space-y-4">
                    {comment.replies.map((reply) => (
                        <CommentThread
                            key={reply.id}
                            comment={reply}
                            onReply={onReply}
                            onLike={onLike}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
