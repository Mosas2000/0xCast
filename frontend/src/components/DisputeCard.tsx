/**
 * DisputeCard Component
 * 
 * Displays dispute information in a card format.
 * Shows dispute details, voting progress, and action buttons.
 */

import { useState } from 'react';
import type { Dispute, DisputeVote } from '../types/oracle';
import { formatDisputeStatus, getDisputeStatusColor, formatBlocksToTime, DISPUTE_STATUS } from '../types/oracle';

interface DisputeCardProps {
  dispute: Dispute;
  userVote?: DisputeVote | null;
  currentBlock?: number;
  onVote?: (marketId: number, vote: 1 | 2) => void;
  onResolve?: (marketId: number) => void;
  isVoting?: boolean;
  isResolving?: boolean;
}

export function DisputeCard({
  dispute,
  userVote,
  currentBlock = 0,
  onVote,
  onResolve,
  isVoting = false,
  isResolving = false,
}: DisputeCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const totalVotes = dispute.yesVotes + dispute.noVotes;
  const yesPercent = totalVotes > 0 ? (dispute.yesVotes / totalVotes) * 100 : 50;
  const noPercent = totalVotes > 0 ? (dispute.noVotes / totalVotes) * 100 : 50;
  
  const votingEnded = currentBlock > dispute.votingEnd;
  const canVote = dispute.status === DISPUTE_STATUS.ACTIVE && !votingEnded && !userVote;
  const canResolve = dispute.status === DISPUTE_STATUS.ACTIVE && votingEnded;

  const blocksRemaining = Math.max(0, dispute.votingEnd - currentBlock);

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-700/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded); } }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              dispute.status === DISPUTE_STATUS.ACTIVE ? 'bg-yellow-500 animate-pulse' :
              dispute.status === DISPUTE_STATUS.UPHELD ? 'bg-green-500' :
              'bg-red-500'
            }`} />
            <div>
              <p className="text-white font-medium">
                Dispute #{dispute.disputeId} • Market #{dispute.marketId}
              </p>
              <p className="text-sm text-gray-400">
                {Number(dispute.stake) / 1_000_000} STX staked
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm ${getDisputeStatusColor(dispute.status)} bg-opacity-20`}>
              {formatDisputeStatus(dispute.status)}
            </span>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Vote Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-green-400">{dispute.yesVotes} Yes ({yesPercent.toFixed(0)}%)</span>
            <span className="text-red-400">{dispute.noVotes} No ({noPercent.toFixed(0)}%)</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden flex">
            <div 
              className="bg-green-500 transition-all duration-300"
              style={{ width: `${yesPercent}%` }}
            />
            <div 
              className="bg-red-500 transition-all duration-300"
              style={{ width: `${noPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-700 pt-4">
          {/* Reason */}
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-1">Reason for Dispute</p>
            <p className="text-white bg-gray-700/50 rounded-lg p-3 text-sm">
              {dispute.reason}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Disputer</p>
              <p className="text-white font-mono text-xs break-all">{dispute.disputer}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Voters</p>
              <p className="text-white">{dispute.totalVoters}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Created At</p>
              <p className="text-white">Block #{dispute.createdAt}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Time Remaining</p>
              <p className={`${votingEnded ? 'text-red-400' : 'text-white'}`}>
                {votingEnded ? 'Voting Ended' : formatBlocksToTime(blocksRemaining)}
              </p>
            </div>
          </div>

          {/* User Vote Status */}
          {userVote && (
            <div className="mb-4 p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg">
              <p className="text-purple-300 text-sm">
                You voted: <span className={userVote.vote === 1 ? 'text-green-400' : 'text-red-400'}>
                  {userVote.vote === 1 ? 'Yes (Uphold)' : 'No (Reject)'}
                </span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {canVote && onVote && (
              <>
                <button
                  onClick={() => onVote(dispute.marketId, 1)}
                  disabled={isVoting}
                  className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isVoting ? 'Voting...' : 'Vote Yes'}
                </button>
                <button
                  onClick={() => onVote(dispute.marketId, 2)}
                  disabled={isVoting}
                  className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isVoting ? 'Voting...' : 'Vote No'}
                </button>
              </>
            )}

            {canResolve && onResolve && (
              <button
                onClick={() => onResolve(dispute.marketId)}
                disabled={isResolving}
                className="flex-1 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isResolving ? 'Resolving...' : 'Resolve Dispute'}
              </button>
            )}

            {!canVote && !canResolve && dispute.status === DISPUTE_STATUS.ACTIVE && (
              <p className="text-gray-500 text-sm text-center w-full py-2">
                {userVote ? 'Waiting for voting period to end' : 'You have already voted'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * DisputeCardSkeleton Component
 * 
 * Loading placeholder for DisputeCard.
 */
export function DisputeCardSkeleton() {
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-gray-600" />
          <div>
            <div className="h-5 w-48 bg-gray-700 rounded mb-1" />
            <div className="h-4 w-24 bg-gray-700 rounded" />
          </div>
        </div>
        <div className="h-6 w-20 bg-gray-700 rounded-full" />
      </div>
      <div className="mt-3">
        <div className="flex justify-between mb-1">
          <div className="h-3 w-16 bg-gray-700 rounded" />
          <div className="h-3 w-16 bg-gray-700 rounded" />
        </div>
        <div className="h-2 bg-gray-700 rounded-full" />
      </div>
    </div>
  );
}

/**
 * EmptyDisputeState Component
 * 
 * Shown when no disputes are found.
 */
export function EmptyDisputeState() {
  return (
    <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
      <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-white mb-2">No Active Disputes</h3>
      <p className="text-gray-400 text-sm max-w-md mx-auto">
        All market resolutions are proceeding without disputes. Check back later or view resolved disputes in the history.
      </p>
    </div>
  );
}
