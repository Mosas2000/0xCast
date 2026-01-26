import { useState } from 'react';
import type { Market } from '../types/market';
import { Modal } from './Modal';
import { generateMarketUrl, generateTweetText, copyToClipboard } from '../utils/shareHelpers';

interface MarketShareButtonProps {
    market: Market;
    className?: string;
}

export function MarketShareButton({ market, className = '' }: MarketShareButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const marketUrl = generateMarketUrl(market.id);
    const tweetText = generateTweetText(market);

    const handleCopyLink = async () => {
        const success = await copyToClipboard(marketUrl);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShareTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className={`p-2 text-slate-400 hover:text-white transition-colors ${className}`.trim()}
                title="Share market"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
            </button>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Share Market">
                <div className="space-y-4">
                    {/* Market Preview */}
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                        <p className="text-white text-sm">{market.question}</p>
                    </div>

                    {/* Copy Link */}
                    <button
                        onClick={handleCopyLink}
                        className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>

                    {/* Share to Twitter */}
                    <button
                        onClick={handleShareTwitter}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        <span>Share on Twitter</span>
                    </button>
                </div>
            </Modal>
        </>
    );
}
