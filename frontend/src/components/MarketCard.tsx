import { Link } from 'react-router-dom';
import type { Market } from '../types/market';
import { MarketStatus } from '../types/market';
import { calculateOdds, formatStx, getStatusLabel } from '../utils/helpers';
import { categorizeMarket, getCategoryConfig } from '../utils/marketCategories';

interface MarketCardProps {
  market: Market;
  showCategory?: boolean;
}

export function MarketCard({ market, showCategory = true }: MarketCardProps) {
  const odds = calculateOdds(market.totalYesStake, market.totalNoStake);
  const totalPool = market.totalYesStake + market.totalNoStake;
  const isActive = market.status === MarketStatus.ACTIVE;
  const category = categorizeMarket(market.question);
  const categoryConfig = getCategoryConfig(category);

  return (
    <Link to={`/trade/${market.id}`} className="block h-full no-underline">
      <div className="h-full p-5 sm:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 flex flex-col transition-colors cursor-pointer">
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
            <span className="text-xs sm:text-sm font-semibold text-green-400">Yes {odds.yes}%</span>
            <span className="text-xs sm:text-sm font-semibold text-red-400">No {odds.no}%</span>
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
            <p className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-600 mb-1">Total Pool</p>
            <p className="text-sm sm:text-base font-bold text-black dark:text-white">{formatStx(totalPool)}</p>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-blue-500">

          </span>
        </div>
      </div>
    </Link>
  );
}
