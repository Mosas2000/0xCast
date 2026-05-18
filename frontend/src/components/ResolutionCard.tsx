/**
 * ResolutionCard Component
 * 
 * Displays market resolution information.
 * Shows oracle, result, status, and dispute period.
 */

import type { MarketResolution } from '../types/oracle';
import { formatBlocksToTime } from '../types/oracle';

interface ResolutionCardProps {
  resolution: MarketResolution;
  marketQuestion?: string;
  currentBlock?: number;
  onDispute?: (marketId: number) => void;
  onFinalize?: (marketId: number) => void;
  canDispute?: boolean;
  canFinalize?: boolean;
  isSubmitting?: boolean;
}

export function ResolutionCard({
  resolution,
  marketQuestion,
  currentBlock = 0,
  onDispute,
  onFinalize,
  canDispute = false,
  canFinalize = false,
  isSubmitting = false,
}: ResolutionCardProps) {
  const inDisputePeriod = !resolution.finalized && currentBlock <= resolution.disputeEnd;
  const blocksRemaining = Math.max(0, resolution.disputeEnd - currentBlock);
  
  const resultLabel = resolution.result === 1 ? 'YES' : 'NO';
  const resultColor = resolution.result === 1 ? 'text-green-400' : 'text-red-400';
  const resultBg = resolution.result === 1 ? 'bg-green-500/20' : 'bg-red-500/20';

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-sm text-gray-500">Market #{resolution.marketId}</span>
          {marketQuestion && (
            <h3 className="text-white font-medium mt-1">{marketQuestion}</h3>
          )}
        </div>
        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
          resolution.finalized
            ? 'bg-gray-700 text-gray-300'
            : inDisputePeriod
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-blue-500/20 text-blue-400'
        }`}>
          {resolution.finalized 
            ? 'Finalized' 
            : inDisputePeriod 
              ? 'In Dispute Period' 
              : 'Awaiting Finalization'}
        </span>
      </div>

      {/* Result Display */}
      <div className={`${resultBg} rounded-lg p-4 mb-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Resolution Result</p>
            <p className={`text-2xl font-bold ${resultColor}`}>{resultLabel}</p>
          </div>
          <div className={`w-12 h-12 rounded-full ${resultBg} flex items-center justify-center`}>
            {resolution.result === 1 ? (
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500">Resolved At</p>
          <p className="text-white">Block #{resolution.resolvedAt}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">
            {resolution.finalized ? 'Finalized At' : 'Dispute Period Ends'}
          </p>
          <p className="text-white">
            {resolution.finalized 
              ? `Block #${resolution.disputeEnd}`
              : inDisputePeriod
                ? formatBlocksToTime(blocksRemaining)
                : 'Period Ended'
            }
          </p>
        </div>
      </div>

      {/* Oracle Info */}
      <div className="mb-4">
        <p className="text-xs text-gray-500">Resolved By</p>
        <p className="text-white font-mono text-sm break-all">{resolution.oracle}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {canDispute && inDisputePeriod && onDispute && (
          <button
            onClick={() => onDispute(resolution.marketId)}
            disabled={isSubmitting}
            className="flex-1 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Dispute Resolution'}
          </button>
        )}

        {canFinalize && !resolution.finalized && !inDisputePeriod && onFinalize && (
          <button
            onClick={() => onFinalize(resolution.marketId)}
            disabled={isSubmitting}
            className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Finalizing...' : 'Finalize Resolution'}
          </button>
        )}

        {resolution.finalized && (
          <div className="flex-1 text-center py-2 text-gray-500">
            Resolution Complete
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ResolutionCardSkeleton Component
 * 
 * Loading placeholder for ResolutionCard.
 */
export function ResolutionCardSkeleton() {
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="h-4 w-24 bg-gray-700 rounded mb-2" />
          <div className="h-5 w-48 bg-gray-700 rounded" />
        </div>
        <div className="h-6 w-28 bg-gray-700 rounded-lg" />
      </div>
      <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-3 w-20 bg-gray-600 rounded mb-2" />
            <div className="h-8 w-16 bg-gray-600 rounded" />
          </div>
          <div className="w-12 h-12 rounded-full bg-gray-600" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="h-3 w-16 bg-gray-700 rounded mb-1" />
          <div className="h-5 w-24 bg-gray-700 rounded" />
        </div>
        <div>
          <div className="h-3 w-20 bg-gray-700 rounded mb-1" />
          <div className="h-5 w-20 bg-gray-700 rounded" />
        </div>
      </div>
      <div className="h-10 bg-gray-700 rounded-lg" />
    </div>
  );
}

/**
 * EmptyResolutionState Component
 * 
 * Shown when no resolutions are found.
 */
export function EmptyResolutionState() {
  return (
    <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
      <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-white mb-2">No Resolutions Found</h3>
      <p className="text-gray-400 text-sm max-w-md mx-auto">
        No oracle resolutions have been submitted yet. Markets are resolved by oracles after their duration ends.
      </p>
    </div>
  );
}
