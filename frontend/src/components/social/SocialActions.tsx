import React, { useState } from 'react';

interface SocialActionsProps {
    marketId: number;
    likesInitial?: number;
}

export const SocialActions: React.FC<SocialActionsProps> = ({ likesInitial = 0 }) => {
    const [likes, setLikes] = useState(likesInitial);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikes(prev => isLiked ? prev - 1 : prev + 1);
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        });
    };

    return (
        <div className="flex items-center space-x-6">
            <button
                onClick={handleLike}
                className={`flex items-center space-x-2 transition-all group ${isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
            >
                <div className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-red-500/10' : 'group-hover:bg-red-500/10'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLiked ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
                <span className="text-sm font-bold">{likes}</span>
            </button>

            <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-slate-500 hover:text-primary-400 transition-all group"
            >
                <div className="p-2 rounded-full group-hover:bg-primary-500/10 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                </div>
                <span className="text-sm font-bold">Share</span>
            </button>

            <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`flex items-center space-x-2 transition-all group ${isBookmarked ? 'text-primary-500' : 'text-slate-500 hover:text-primary-500'}`}
            >
                <div className={`p-2 rounded-full transition-colors ${isBookmarked ? 'bg-primary-500/10' : 'group-hover:bg-primary-500/10'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isBookmarked ? 'fill-current' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </div>
                <span className="text-sm font-bold">{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>
        </div>
    );
};
