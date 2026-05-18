import { useState } from 'react';
import { ShareModal } from './ShareModal';

interface SocialButtonsProps {
  marketId: number;
  marketQuestion?: string;
  yesPercentage?: number;
  noPercentage?: number;
  poolSize?: number;
  variant?: 'icon' | 'button' | 'compact';
  showLabel?: boolean;
}

export function SocialButtons({
  marketId,
  marketQuestion,
  yesPercentage,
  noPercentage,
  poolSize,
  variant = 'icon',
  showLabel = true,
}: SocialButtonsProps) {
  const [showShareModal, setShowShareModal] = useState(false);

  const baseClasses = {
    icon: 'p-2 rounded-lg transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800',
    button: 'px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2',
    compact: 'px-3 py-1.5 rounded text-xs font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1',
  };

  const iconClasses = 'text-black dark:text-white w-5 h-5';

  return (
    <>
      <button
        onClick={() => setShowShareModal(true)}
        className={baseClasses[variant]}
        aria-label="Share this market"
      >
        <svg
          className={variant === 'icon' ? iconClasses : 'w-4 h-4'}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C3.949 18.077.029 24 0 24m16.737-3.684c2.849-2.635 6.236-4.058 10-4.058 4.584 0 8.755 1.899 11.667 4.946m-17.167 6.816c5.854 0 10.663 1.915 14.737 5.233m-14.737-5.233l-4.737 4.737m20-10.970c2.849-2.635 6.236-4.058 10-4.058 4.584 0 8.755 1.899 11.667 4.946M5.684 3.342C10.419-1.393 16.339-3.537 24-3.537c5.316 0 10.322 1.351 14.667 3.731"
          />
        </svg>
        {(variant === 'button' || variant === 'compact') && showLabel && (
          <span>{variant === 'compact' ? 'Share' : 'Share Market'}</span>
        )}
      </button>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        marketId={marketId}
        marketQuestion={marketQuestion}
        yesPercentage={yesPercentage}
        noPercentage={noPercentage}
        poolSize={poolSize}
      />
    </>
  );
}
