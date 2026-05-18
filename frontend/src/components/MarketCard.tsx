import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Market } from '../types/market';
import { MarketStatus } from '../types/market';
import { calculateOdds, formatStx, getStatusLabel } from '../utils/helpers';
import { categorizeMarket, getCategoryConfig } from '../utils/marketCategories';
import { useWatchlist } from '../contexts/WatchlistContext';
import type { MouseEvent } from 'react';

interface MarketCardProps {
  market: Market;
  showCategory?: boolean;
}

export function MarketCard({ market, showCategory = true }: MarketCardProps) {
  const { t } = useTranslation(['common', 'markets']);
  const odds = calculateOdds(market.totalYesStake, market.totalNoStake);
  const totalPool = market.totalYesStake + market.totalNoStake;
  const isActive = market.status === MarketStatus.ACTIVE;
  const category = categorizeMarket(market.question);
  const categoryConfig = getCategoryConfig(category);
  const { isWatched, toggleMarket } = useWatchlist();
  const watched = isWatched(market.id);

  const handleToggleWatchlist = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggleMarket(market.id);
  };

  return (
    <div className="relative block h-full">
      <Link
        to={`/trade/${market.id}`}
        aria-label={`Open market ${market.question}`}
        className="absolute inset-0 z-0 pointer-events-auto rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black"
      >
        <span className="sr-only">Open market {market.question}</span>
      </Link>
      <div className="relative z-10 h-full p-5 sm:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 flex flex-col transition-colors cursor-pointer pointer-events-none">
        <button
          type="button"
          onClick={handleToggleWatchlist}
          aria-pressed={watched}
          aria-label={watched ? t('markets:actions.removeFromWatchlist') : t('markets:actions.addToWatchlist')}
          className={`pointer-events-auto absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
            watched
              ? 'border-rose-500/40 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25'
              : 'border-neutral-300 dark:border-neutral-700 bg-white/90 dark:bg-neutral-950/90 text-neutral-500 hover:border-blue-500/40 hover:text-blue-500'
          }`}
        >
          <svg
            className="h-5 w-5"
            fill={watched ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.645 20.91l-1.157-1.051C5.696 15.855 2.5 12.968 2.5 9.4 2.5 6.51 4.73 4.25 7.5 4.25c1.56 0 3.042.75 3.966 1.94A5.13 5.13 0 0 1 15.5 4.25c2.77 0 5 2.26 5 5.15 0 3.568-3.196 6.455-7.988 10.459l-0.867 0.718z"
            />
          </svg>
        </button>
        {/* Header */}
        <div className="flex justify-between items-start gap-2 mb-4 sm:mb-5">
          <div className="flex gap-2 items-center flex-wrap">
            <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold ${
              isActive 
                ? 'bg-green-500/15 text-green-400' 
                : 'bg-blue-500/15 text-blue-400'
            }`}>
              {getStatusLabel(market.status)}
            </span>
            {showCategory && categoryConfig && (
              <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-purple-500/15 text-purple-400 text-[10px] sm:text-xs font-medium flex items-center gap-1">
                <span>{categoryConfig.icon}</span>
                <span className="hidden sm:inline">{categoryConfig.label}</span>
              </span>
            )}
          </div>
          <span className="text-xs text-neutral-600 dark:text-neutral-600 font-mono shrink-0">
            #{market.id}
          </span>
        </div>

        {/* Question */}
        <h3 className="text-sm sm:text-base lg:text-[17px] font-semibold text-black dark:text-white leading-snug sm:leading-relaxed mb-5 sm:mb-6 flex-1 line-clamp-2">
          {market.question}
        </h3>

        {/* Odds */}
        <div className="mb-5 sm:mb-6">
          <div className="flex justify-between mb-2 sm:mb-2.5">
            <span className="text-xs sm:text-sm font-semibold text-green-400">{t('common:outcome.yes')} {odds.yes}%</span>
            <span className="text-xs sm:text-sm font-semibold text-red-400">{t('common:outcome.no')} {odds.no}%</span>
          </div>
          <div className="h-1.5 sm:h-2 rounded bg-neutral-300 dark:bg-neutral-800 flex overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300" 
              style={{ width: `${odds.yes}%` }} 
            />
            <div 
              className="h-full bg-red-500 transition-all duration-300" 
              style={{ width: `${odds.no}%` }} 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 sm:pt-5 border-t border-neutral-300 dark:border-neutral-800">
          <div>
            <p className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-600 mb-1">{t('markets:labels.totalPool')}</p>
            <p className="text-sm sm:text-base font-bold text-black dark:text-white">{formatStx(totalPool)}</p>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-blue-500">

          </span>
        </div>
      </div>
    </div>
  );
}
