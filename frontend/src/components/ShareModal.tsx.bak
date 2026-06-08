import { useState } from 'react';
import { useCallback } from 'react';
import { formatStx } from '@/utils/helpers';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketId: number;
  marketQuestion?: string;
  yesPercentage?: number;
  noPercentage?: number;
  poolSize?: number;
}

export function ShareModal({
  isOpen,
  onClose,
  marketId,
  marketQuestion = 'Check this prediction market',
  yesPercentage = 50,
  noPercentage = 50,
  poolSize = 0,
}: ShareModalProps) {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const shareUrl = `${window.location.origin}/trade/${marketId}`;
  
  const poolDisplay = poolSize ? formatStx(poolSize) : 'TBD';
  const shareText = `I'm trading on "${marketQuestion}" on 0xCast. Yes: ${yesPercentage}% | No: ${noPercentage}% - Pool: ${poolDisplay} STX. Join me!`;

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopySuccess('link');
    setTimeout(() => setCopySuccess(null), 2000);
  }, [shareUrl]);

  const handleCopyEmbed = useCallback(() => {
    const embedCode = `<iframe src="${shareUrl}" width="400" height="300" frameborder="0" allowfullscreen></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopySuccess('embed');
    setTimeout(() => setCopySuccess(null), 2000);
  }, [shareUrl]);

  const shareToTwitter = useCallback(() => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=0xCast,Stacks,BTC`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  }, [shareText, shareUrl]);

  const shareToDiscord = useCallback(() => {
    const discordText = `${shareText}\n${shareUrl}`;
    navigator.clipboard.writeText(discordText);
    alert('Market link copied to clipboard. Paste in Discord!');
  }, [shareText, shareUrl]);

  const shareToTelegram = useCallback(() => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank', 'width=600,height=400');
  }, [shareText, shareUrl]);

  const shareToReddit = useCallback(() => {
    const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(marketQuestion)}`;
    window.open(redditUrl, '_blank', 'width=600,height=400');
  }, [shareUrl, marketQuestion]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-300 dark:border-neutral-800 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-300 dark:border-neutral-800 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-black dark:text-white">Share Market</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Market Link Section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-black dark:text-white">Market Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-sm text-black dark:text-white font-mono"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                  copySuccess === 'link'
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copySuccess === 'link' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-black dark:text-white">Share On</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={shareToTwitter}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                aria-label="Share on Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </button>

              <button
                onClick={shareToDiscord}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                aria-label="Share on Discord"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515a.074.074 0 00-.079.037c-.211.375-.444.865-.607 1.25a18.27 18.27 0 00-5.487 0c-.163-.385-.396-.875-.607-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.08.08 0 00.087-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 00-.042-.106c-.645-.245-1.26-.561-1.844-.906a.077.077 0 00-.009-.128c.124-.093.248-.189.368-.288a.076.076 0 00.084-.01c3.852 1.755 8.018 1.755 11.829 0a.077.077 0 00.083.01c.12.099.244.195.369.288a.077.077 0 00-.008.129c-.585.345-1.198.66-1.843.906a.077.077 0 00-.041.107c.359.719.77 1.364 1.226 1.994a.076.076 0 00.084.028c2.243-.613 4.438-1.587 5.994-3.03a.076.076 0 00.03-.057c.5-4.718-.838-8.812-3.543-12.46a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156c0-1.193.964-2.157 2.157-2.157c1.193 0 2.156.964 2.156 2.157c0 1.191-.963 2.156-2.156 2.156zm7.975 0c-1.183 0-2.157-.965-2.157-2.156c0-1.193.964-2.157 2.157-2.157c1.193 0 2.157.964 2.157 2.157c0 1.191-.964 2.156-2.157 2.156z" />
                </svg>
                Discord
              </button>

              <button
                onClick={shareToTelegram}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
                aria-label="Share on Telegram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a11.955 11.955 0 0 0-.064 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.155.339-.315.612-.495 4.563-3.173 6.071-4.209 7.377-5.427.566-.502 1.06-.886 1.493-1.169.42-.276.922-.42 1.466-.42z" />
                </svg>
                Telegram
              </button>

              <button
                onClick={shareToReddit}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                aria-label="Share on Reddit"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.385 4.859-7.181 4.859-3.796 0-7.182-2.165-7.182-4.859a3.5 3.5 0 0 1 .476-1.84c-.424-.355-.641-.89-.641-1.427 0-.968.786-1.754 1.754-1.754.418 0 .801.134 1.122.357 1.191-.857 2.844-1.416 4.665-1.489l.812-3.827c.207-.026.426-.026.607 0l2.94.625c.321-.586.922-.961 1.6-.961z" />
                </svg>
                Reddit
              </button>
            </div>
          </div>

          {/* Embed Code Section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-black dark:text-white">Embed Code</label>
            <div className="flex items-start gap-2">
              <textarea
                value={`<iframe src="${shareUrl}" width="400" height="300" frameborder="0" allowfullscreen></iframe>`}
                readOnly
                className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs text-black dark:text-white font-mono h-20 resize-none"
              />
              <button
                onClick={handleCopyEmbed}
                className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                  copySuccess === 'embed'
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copySuccess === 'embed' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Embed this market on your website or blog
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-300 dark:border-neutral-800 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white rounded-lg font-medium hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
