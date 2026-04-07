/**
 * Top Markets Table Component
 * 
 * Display top markets ranked by pool size
 */

import { Link } from 'react-router-dom';
import type { MarketStats } from '../types/analytics';
import { MarketBar } from './charts/MarketDistributionChart';

interface TopMarketsTableProps {
  markets: MarketStats[];
  maxRows?: number;
  showRank?: boolean;
}

export function TopMarketsTable({ 
  markets, 
  maxRows = 5,
  showRank = true,
}: TopMarketsTableProps) {
  const displayMarkets = markets.slice(0, maxRows);

  if (displayMarkets.length === 0) {
    return (
      <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 p-8 text-center">
        <p className="text-neutral-500">No markets available</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/50 rounded-xl border border-neutral-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-800">
              {showRank && (
                <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-12">
                  #
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Market
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider w-28">
                Pool
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider w-24">
                Predictors
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-48">
                Distribution
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider w-24">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {displayMarkets.map((market, index) => (
              <tr 
                key={market.id}
                className="hover:bg-neutral-800/30 transition-colors"
              >
                {showRank && (
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-neutral-400">
                      {index + 1}
                    </span>
                  </td>
                )}
                <td className="px-4 py-4">
                  <Link 
                    to={`/trade/${market.id}`}
                    className="text-sm text-white hover:text-blue-400 transition-colors line-clamp-2"
                  >
                    {market.question}
                  </Link>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-sm font-medium text-white">
                    {market.totalPoolFormatted}
                  </span>
                  <span className="text-xs text-neutral-500 ml-1">STX</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-sm text-neutral-300">
                    {market.predictorCount}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <MarketBar
                    yesPercentage={market.yesPercentage}
                    noPercentage={market.noPercentage}
                    showLabels={false}
                    height={6}
                  />
                </td>
                <td className="px-4 py-4 text-center">
                  <StatusBadge status={market.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'active' | 'resolved' | 'disputed' }) {
  const styles = {
    active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    resolved: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    disputed: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Compact card version for mobile
interface TopMarketCardProps {
  market: MarketStats;
  rank: number;
}

export function TopMarketCard({ market, rank }: TopMarketCardProps) {
  return (
    <Link 
      to={`/trade/${market.id}`}
      className="block bg-neutral-900/50 rounded-xl border border-neutral-800 p-4 hover:border-neutral-700 transition-colors"
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-neutral-800 rounded-full text-xs font-medium text-neutral-400">
          {rank}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white line-clamp-2 mb-2">
            {market.question}
          </p>
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>{market.totalPoolFormatted} STX</span>
            <span>{market.predictorCount} predictors</span>
          </div>
          <MarketBar
            yesPercentage={market.yesPercentage}
            noPercentage={market.noPercentage}
            showLabels={true}
            height={4}
          />
        </div>
      </div>
    </Link>
  );
}
