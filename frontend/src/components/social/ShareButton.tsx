import React, { useState } from 'react';

interface ShareButtonProps {
    marketId: string;
    marketTitle: string;
    variant?: 'button' | 'icon';
}

export const ShareButton: React.FC<ShareButtonProps> = ({
    marketId,
    marketTitle,
    variant = 'button',
}) => {
    const [showModal, setShowModal] = useState(false);

    const shareUrl = `${window.location.origin}/market/${marketId}`;

    const handleShare = (platform: string) => {
        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedTitle = encodeURIComponent(marketTitle);

        const urls: Record<string, string> = {
            twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
            whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        };

        if (urls[platform]) {
            window.open(urls[platform], '_blank', 'width=600,height=400');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className={
                    variant === 'button'
                        ? 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2'
                        : 'p-2 text-gray-600 hover:text-blue-600 transition-colors'
                }
            >
                <span>🔗</span>
                {variant === 'button' && 'Share'}
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Share Market</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">{marketTitle}</p>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                onClick={() => handleShare('twitter')}
                                className="flex items-center justify-center gap-2 p-3 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                            >
                                <span>🐦</span>
                                <span>Twitter</span>
                            </button>
                            <button
                                onClick={() => handleShare('facebook')}
                                className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <span>📘</span>
                                <span>Facebook</span>
                            </button>
                            <button
                                onClick={() => handleShare('linkedin')}
                                className="flex items-center justify-center gap-2 p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                            >
                                <span>💼</span>
                                <span>LinkedIn</span>
                            </button>
                            <button
                                onClick={() => handleShare('telegram')}
                                className="flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <span>✈️</span>
                                <span>Telegram</span>
                            </button>
                            <button
                                onClick={() => handleShare('whatsapp')}
                                className="flex items-center justify-center gap-2 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <span>💬</span>
                                <span>WhatsApp</span>
                            </button>
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center justify-center gap-2 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <span>📋</span>
                                <span>Copy Link</span>
                            </button>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 mb-1">Share URL:</p>
                            <p className="text-sm text-gray-900 break-all">{shareUrl}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
