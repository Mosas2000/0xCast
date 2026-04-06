/**
 * GovernancePage Component
 * 
 * Main governance page for proposals and voting.
 * Refactored for mobile responsiveness with Tailwind CSS.
 */

import { useState } from 'react';
import { useWallet } from '../components/WalletProvider';
import { 
  useGovernance, 
  formatVotingPower, 
  calculateVotePercentage,
} from '../hooks/useGovernance';
import { useGovernanceActions } from '../hooks/useGovernanceActions';
import { ProposalCard } from '../components/ProposalCard';
import { CreateProposalModal } from '../components/CreateProposalModal';
import type { Proposal, VoteType, ProposalStatus } from '../types/governance';
import { validateMarketId } from '../utils/validation';

export function GovernancePage() {
  const { isConnected, connect, address } = useWallet();
  const { 
    stats, 
    proposals, 
    parameters,
    isLoading, 
    currentBlock,
    refetch 
  } = useGovernance(address ?? undefined);
  
  const { 
    castVote, 
    createProposal,
    delegateVotingPower,
    revokeDelegation,
    queueProposal,
    executeProposal,
    voteState,
    proposalState,
    delegationState,
    executionState,
  } = useGovernanceActions();
  
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [delegateAddress, setDelegateAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'passed' | 'rejected'>('all');

  const handleVote = async (proposalId: number, vote: VoteType) => {
    if (!isConnected || voteState.isLoading) return;
    
    const proposalIdValidation = validateMarketId(proposalId);
    if (!proposalIdValidation.isValid) {
      setVoteError(proposalIdValidation.error || 'Invalid proposal ID');
      setTimeout(() => setVoteError(null), 5000);
      return;
    }
    
    setVoteError(null);
    await castVote(proposalId, vote);
    
    if (voteState.txId) {
      refetch();
      setSelectedProposal(null);
    }
  };

  const handleCreateProposal = async (title: string, description: string) => {
    await createProposal(title, description);
    if (proposalState.txId) {
      setShowCreateModal(false);
      refetch();
    }
  };

  const handleDelegate = async () => {
    if (!delegateAddress.trim()) return;
    
    await delegateVotingPower(delegateAddress.trim());
    if (delegationState.txId) {
      setShowDelegateModal(false);
      setDelegateAddress('');
      refetch();
    }
  };

  const handleRevokeDelegation = async () => {
    await revokeDelegation();
    if (delegationState.txId) {
      refetch();
    }
  };

  const handleQueueProposal = async (proposalId: number) => {
    await queueProposal(proposalId);
    if (executionState.txId) {
      refetch();
    }
  };

  const handleExecuteProposal = async (proposalId: number) => {
    await executeProposal(proposalId);
    if (executionState.txId) {
      refetch();
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = searchQuery === '' || 
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'text-blue-500';
      case 'passed': 
      case 'executed':
      case 'queued': return 'text-emerald-500';
      case 'rejected':
      case 'cancelled': return 'text-red-500';
      case 'pending': return 'text-amber-500';
      default: return 'text-neutral-400';
    }
  };

  const getStatusBgColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-blue-500/20';
      case 'passed': 
      case 'executed':
      case 'queued': return 'bg-emerald-500/20';
      case 'rejected':
      case 'cancelled': return 'bg-red-500/20';
      case 'pending': return 'bg-amber-500/20';
      default: return 'bg-neutral-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-4">
          </h1>            <span>
          <p className="text-sm sm:text-base lg:text-lg text-neutral-400 max-w-xl mx-auto px-4">
            Shape the future of 0xCast. Vote on proposals and participate in 
            decentralized decision-making with your OXC tokens.
          </p>
        </div>

        {/* Stats Grid - Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatCard label="Total Proposals" value={stats.totalProposals.toString()} />
          <StatCard label="Active" value={stats.activeProposals.toString()} valueColor="text-blue-500" />
          <StatCard label="Passed" value={stats.passedProposals.toString()} valueColor="text-emerald-500" />
          <StatCard 
            label="Your Voting Power" 
            value={isConnected ? formatVotingPower(stats.'} userVotingPower) : '
          />
        </div>

        {/* Governance Parameters */}
        <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-white">Governance Parameters</h3>
            <span className="text-xs text-neutral-500">Current settings</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <ParamItem label="Proposal Threshold" value={`${formatVotingPower(parameters.proposalThreshold)} CAST`} />
            <ParamItem label="Quorum" value={`${parameters.quorumPercentage}%`} />
            <ParamItem label="Voting Period" value={`~${Math.round(parameters.votingPeriod / 144)} days`} />
            <ParamItem label="Timelock Period" value={`~${Math.round(parameters.timelockPeriod / 144)} days`} />
          </div>
        </div>

        {/* User Activity Section */}
        {isConnected && (
          <>
            <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-white mb-4">Your Governance Activity</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ActivityStat 
                  label="Proposals Voted" 
                  value={proposals.filter(p => p.userVote).length} 
                />
                <ActivityStat 
                  label="Votes For" 
                  value={proposals.filter(p => p.userVote === 'for').length}
                  valueColor="text-emerald-500" 
                />
                <ActivityStat 
                  label="Votes Against" 
                  value={proposals.filter(p => p.userVote === 'against').length}
                  valueColor="text-red-500" 
                />
                <ActivityStat 
                  label="Participation" 
                  value={stats.totalProposals > 0 
                    ? `${Math.round((proposals.filter(p => p.userVote).length / stats.totalProposals) * 100)}%`
                    : '0%'}
                  valueColor="text-blue-500" 
                />
              </div>
            </div>

            {/* Delegation Card */}
            <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white mb-1">Delegation</h3>
                  <p className="text-xs sm:text-sm text-neutral-400">
                    {stats.userDelegatedTo 
                      ? `Delegated to: ${stats.userDelegatedTo.slice(0, 8)}...${stats.userDelegatedTo.slice(-6)}`
                      : 'Delegate your voting power to another address'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {stats.userDelegatedTo ? (
                    <button 
                      onClick={handleRevokeDelegation}
                      disabled={delegationState.isLoading}
                      className="btn btn-secondary text-sm py-2 px-4"
                    >
                      {delegationState.isLoading ? 'Revoking...' : 'Revoke'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowDelegateModal(true)}
                      className="btn btn-primary text-sm py-2 px-4"
                    >
                      Delegate
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Connect Wallet Prompt */}
        {!isConnected && (
          <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">Connect to Participate</h3>
            <p className="text-sm text-neutral-400 mb-6 max-w-md mx-auto">
              Connect your wallet to vote on proposals, delegate voting power, and create new proposals.
            </p>
            <button onClick={() => connect()} className="btn btn-primary">
              Connect Wallet
            </button>
          </div>
        )}

        {/* Proposals Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Proposals</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <input
                type="text"
                placeholder="Search proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm placeholder:text-neutral-500 w-full sm:w-64"
              />
              {/* Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="passed">Passed</option>
                <option value="rejected">Rejected</option>
              </select>
              {/* Create Button */}
              {isConnected && (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary text-sm whitespace-nowrap"
                >
                  + Create Proposal
                </button>
              )}
            </div>
          </div>

          {/* Proposals Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-neutral-900 rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-neutral-800 rounded w-3/4 mb-4" />
                  <div className="h-3 bg-neutral-800 rounded w-full mb-2" />
                  <div className="h-3 bg-neutral-800 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="bg-neutral-900/50 rounded-xl p-8 sm:p-12 text-center">
              <p className="text-neutral-400">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No proposals match your search criteria'
                  : 'No proposals yet. Be the first to create one!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  currentBlock={currentBlock}
                  onVote={(vote) => handleVote(proposal.id, vote)}
                  onQueue={() => handleQueueProposal(proposal.id)}
                  onExecute={() => handleExecuteProposal(proposal.id)}
                  onClick={() => setSelectedProposal(proposal)}
                  isVoting={voteState.isLoading}
                  isExecuting={executionState.isLoading}
                />
              ))}
            </div>
          )}
        </div>

        {/* Selected Proposal Modal */}
        {selectedProposal && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedProposal(null)}
          >
            <div 
              className="bg-[#0A0A0A] border border-neutral-700 rounded-2xl p-4 sm:p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedProposal(null)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white text-2xl"
              >
                
              </button>
              
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBgColor(selectedProposal.status)} ${getStatusColor(selectedProposal.status)}`}>
                  {selectedProposal.status}
                </span>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">{selectedProposal.title}</h2>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed mb-6">{selectedProposal.description}</p>
              
              {/* Vote Stats */}
              <div className="bg-neutral-900 rounded-xl p-4 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-emerald-500">For: {calculateVotePercentage(selectedProposal.votesFor, selectedProposal.votesAgainst)}%</span>
                  <span className="text-red-500">Against: {calculateVotePercentage(selectedProposal.votesAgainst, selectedProposal.votesFor)}%</span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${calculateVotePercentage(selectedProposal.votesFor, selectedProposal.votesAgainst)}%` }}
                  />
                </div>
              </div>

              {/* Vote Buttons */}
              {isConnected && selectedProposal.status === 'active' && !selectedProposal.userVote && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleVote(selectedProposal.id, 'for')}
                    disabled={voteState.isLoading}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    {voteState.isLoading ? 'Voting...' : 'Vote For'}
                  </button>
                  <button 
                    onClick={() => handleVote(selectedProposal.id, 'against')}
                    disabled={voteState.isLoading}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    {voteState.isLoading ? 'Voting...' : 'Vote Against'}
                  </button>
                </div>
              )}

              {selectedProposal.userVote && (
                <div className="text-center py-3 bg-neutral-900 rounded-xl">
                  <span className="text-neutral-400">You voted: </span>
                  <span className={selectedProposal.userVote === 'for' ? 'text-emerald-500' : 'text-red-500'}>
                    {selectedProposal.userVote === 'for' ? 'For' : 'Against'}
                  </span>
                </div>
              )}

              {voteError && (
                <div className="mt-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">
                  {voteError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delegate Modal */}
        {showDelegateModal && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDelegateModal(false)}
          >
            <div 
              className="bg-[#0A0A0A] border border-neutral-700 rounded-2xl p-4 sm:p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Delegate Voting Power</h3>
              <p className="text-sm text-neutral-400 mb-4">
                Enter the address you want to delegate your voting power to.
              </p>
              <input
                type="text"
                placeholder="SP... or ST..."
                value={delegateAddress}
                onChange={(e) => setDelegateAddress(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-white mb-4"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDelegateModal(false)}
                  className="flex-1 py-3 bg-neutral-800 text-white rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelegate}
                  disabled={!delegateAddress.trim() || delegationState.isLoading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {delegationState.isLoading ? 'Delegating...' : 'Delegate'}
                </button>
              </div>
              {delegationState.error && (
                <div className="mt-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">
                  {delegationState.error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Proposal Modal */}
        {showCreateModal && (
          <CreateProposalModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateProposal}
            isLoading={proposalState.isLoading}
            error={proposalState.error}
            threshold={parameters.proposalThreshold}
            userVotingPower={stats.userVotingPower}
          />
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 text-center">
      <div className="text-xs sm:text-sm text-neutral-400 mb-1 sm:mb-2 uppercase tracking-wide">{label}</div>
      <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${valueColor || 'text-white'}`}>{value}</div>
    </div>
  );
}

function ParamItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs sm:text-sm text-neutral-400">{label}</span>
      <span className="text-xs sm:text-sm text-white font-medium">{value}</span>
    </div>
  );
}

function ActivityStat({ label, value, valueColor }: { label: string; value: string | number; valueColor?: string }) {
  return (
    <div>
      <div className="text-xs text-neutral-400 mb-1">{label}</div>
      <div className={`text-lg sm:text-xl font-semibold ${valueColor || 'text-white'}`}>{value}</div>
    </div>
  );
}
