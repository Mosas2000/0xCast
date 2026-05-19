/**
 * ProposalCard Component
 * 
 * Displays a governance proposal with voting progress and actions.
 */

import type { Proposal, VoteType } from '../types/governance';
import { formatVotingPower, calculateVotePercentage, isQuorumReached } from '../hooks/useGovernance';
import { formatBlocksRemaining } from '../config/governance';

interface ProposalCardProps {
  proposal: Proposal;
  isConnected: boolean;
  isVoting: boolean;
  onVote: (proposalId: number, voteType: VoteType) => void;
  onSelect: (proposal: Proposal) => void;
}

export function ProposalCard({
  proposal,
  isConnected,
  isVoting,
  onVote,
  onSelect,
}: ProposalCardProps) {
  const forPercentage = calculateVotePercentage(proposal.votesFor, proposal.totalVotes);
  const againstPercentage = calculateVotePercentage(proposal.votesAgainst, proposal.totalVotes);
  const quorumReached = isQuorumReached(proposal.totalVotes, proposal.quorum);
  const isActive = proposal.status === 'active';

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#3B82F6';
      case 'passed': 
      case 'executed':
      case 'queued': return '#22C55E';
      case 'rejected':
      case 'cancelled': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#9CA3AF';
    }
  };

  const getStatusBgColor = (status: string): string => {
    return `${getStatusColor(status)}20`;
  };

  const truncateAddress = (address: string): string => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  return (
    <div
      onClick={() => onSelect(proposal)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(proposal); } }}
      role="button"
      tabIndex={0}
      aria-label={`View proposal: ${proposal.title}`}
      style={{
        backgroundColor: '#0A0A0A',
        border: '1px solid #1F1F1F',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#FFFFFF',
            marginBottom: '8px',
          }}>
            {proposal.title}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#6B7280',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            <span>Proposed by {truncateAddress(proposal.proposer)}</span>
            <span>•</span>
            {isActive ? (
              <span style={{ color: '#3B82F6' }}>
                {formatBlocksRemaining(proposal.blocksRemaining)}
              </span>
            ) : (
              <span>Ended at block {proposal.endBlock.toLocaleString()}</span>
            )}
          </div>
        </div>
        <span style={{
          display: 'inline-block',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'uppercase',
          backgroundColor: getStatusBgColor(proposal.status),
          color: getStatusColor(proposal.status),
        }}>
          {proposal.status}
        </span>
      </div>
      
      {/* Description (truncated) */}
      <p style={{
        fontSize: '14px',
        color: '#9CA3AF',
        lineHeight: '1.6',
        marginBottom: '16px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {proposal.description}
      </p>
      
      {/* Voting Progress */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          height: '8px',
          backgroundColor: '#1F1F1F',
          borderRadius: '4px',
          overflow: 'hidden',
          display: 'flex',
        }}>
          <div style={{
            width: `${forPercentage}%`,
            height: '100%',
            backgroundColor: '#22C55E',
            transition: 'width 0.3s',
          }} />
          <div style={{
            width: `${againstPercentage}%`,
            height: '100%',
            backgroundColor: '#EF4444',
            transition: 'width 0.3s',
          }} />
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '13px',
          marginTop: '8px',
        }}>
          <span style={{ color: '#22C55E' }}>
            For: {formatVotingPower(proposal.votesFor)} ({forPercentage}%)
          </span>
          <span style={{ color: quorumReached ? '#22C55E' : '#F59E0B' }}>
            Quorum: {quorumReached ? '✓ Reached' : `${calculateVotePercentage(proposal.totalVotes, proposal.quorum)}%`}
          </span>
          <span style={{ color: '#EF4444' }}>
            Against: {formatVotingPower(proposal.votesAgainst)} ({againstPercentage}%)
          </span>
        </div>
      </div>

      {/* Vote Actions */}
      {isConnected && isActive && (
        proposal.userVote ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            backgroundColor: proposal.userVote === 'for' 
              ? '#22C55E20' 
              : proposal.userVote === 'against'
                ? '#EF444420'
                : '#F59E0B20',
            color: proposal.userVote === 'for' 
              ? '#22C55E' 
              : proposal.userVote === 'against'
                ? '#EF4444'
                : '#F59E0B',
          }}>
            {proposal.userVote === 'for' 
              ? '✓ Voted For' 
              : proposal.userVote === 'against'
                ? '✗ Voted Against'
                : '○ Abstained'}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '8px',
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVote(proposal.id, 'for');
              }}
              disabled={isVoting}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isVoting ? 'not-allowed' : 'pointer',
                border: 'none',
                opacity: isVoting ? 0.5 : 1,
                backgroundColor: '#22C55E',
                color: '#FFFFFF',
                transition: 'all 0.2s',
              }}
            >
              Vote For
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVote(proposal.id, 'against');
              }}
              disabled={isVoting}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isVoting ? 'not-allowed' : 'pointer',
                border: 'none',
                opacity: isVoting ? 0.5 : 1,
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                transition: 'all 0.2s',
              }}
            >
              Vote Against
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVote(proposal.id, 'abstain');
              }}
              disabled={isVoting}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isVoting ? 'not-allowed' : 'pointer',
                border: '1px solid #374151',
                opacity: isVoting ? 0.5 : 1,
                backgroundColor: 'transparent',
                color: '#9CA3AF',
                transition: 'all 0.2s',
              }}
            >
              Abstain
            </button>
          </div>
        )
      )}
    </div>
  );
}
