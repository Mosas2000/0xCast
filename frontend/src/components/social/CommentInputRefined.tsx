import React, { useState } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';

interface CommentInputRefinedProps {
    onSubmit: (comment: string) => void;
    placeholder?: string;
}

/**
 * Premium comment input field with emoji support triggers and file attachment mocks.
 */
export const CommentInputRefined: React.FC<CommentInputRefinedProps> = ({
    onSubmit,
    placeholder = "Write your prediction analysis..."
}) => {
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        onSubmit(comment);
        setComment('');
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="relative group bg-slate-900 border border-white/5 rounded-2xl focus-within:border-primary-500/50 transition-all p-2"
        >
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent border-none outline-none text-slate-300 placeholder:text-slate-600 p-2 min-h-[80px] text-sm resize-none scrollbar-hide"
            />

            <div className="flex items-center justify-between pt-2 px-2 border-t border-white/5 mt-2">
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all"
                        title="Add Emoji"
                    >
                        <Smile size={18} />
                    </button>
                    <button
                        type="button"
                        className="p-2 text-slate-500 hover:text-primary-400 hover:bg-primary-400/10 rounded-lg transition-all"
                        title="Attach Image"
                    >
                        <Paperclip size={18} />
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={!comment.trim()}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${comment.trim()
                            ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20'
                            : 'bg-white/5 text-slate-600'
                        }`}
                >
                    <span>Post</span>
                    <Send size={14} />
                </button>
            </div>
        </form>
    );
};
