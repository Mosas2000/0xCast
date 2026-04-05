/**
 * GovernancePage Component
 * 
 * Main governance page for proposals and voting.
 * Connects to governance-core and governance-token contracts.
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

  // Filter proposals based on search and status
  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = searchQuery === '' || 
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#000000',
    paddingTop: '120px',
    paddingBottom: '80px',
  };

  const wrapperStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center' as const,
    marginBottom: '48px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '48px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '18px',
    color: '#9CA3AF',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  };

  const statsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '48px',
  };

  const statCardStyle: React.CSSProperties = {
    backgroundColor: '#0A0A0A',
    border: '1px solid #1F1F1F',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center' as const,
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#9CA3AF',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#FFFFFF',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '24px',
  };

  // Used in modal for status badge
  const statusBadgeStyle = (status: ProposalStatus): React.CSSProperties => ({
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    backgroundColor: getStatusBgColor(status),
    color: getStatusColor(status),
  });

  const voteButtonsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  };

  const voteButtonStyle = (type: 'for' | 'against', disabled: boolean): React.CSSProperties => ({
    flex: '1',
    padding: '12px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    opacity: disabled ? 0.5 : 1,
    backgroundColor: type === 'for' ? '#22C55E' : '#EF4444',
    color: '#FFFFFF',
    transition: 'all 0.2s',
  });

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '24px',
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#0A0A0A',
    border: '1px solid #2F2F2F',
    borderRadius: '20px',
    padding: '32px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'auto',
  };

  const modalTitleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: '16px',
  };

  const modalDescStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#9CA3AF',
    lineHeight: '1.7',
    marginBottom: '24px',
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute' as const,
    top: '16px',
    right: '16px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9CA3AF',
    fontSize: '24px',
    cursor: 'pointer',
  };

  const connectCardStyle: React.CSSProperties = {
    backgroundColor: '#0A0A0A',
    border: '1px solid #1F1F1F',
    borderRadius: '16px',
    padding: '48px',
    textAlign: 'center' as const,
    marginBottom: '48px',
  };

  const connectButtonStyle: React.CSSProperties = {
    padding: '16px 32px',
    backgroundColor: '#3B82F6',
    border: 'none',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>
            <span>🏛️</span> Governance
          </h1>
          <p style={subtitleStyle}>
            Shape the future of 0xCast. Vote on proposals and participate in 
            decentralized decision-making with your OXC tokens.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Total Proposals</div>
            <div style={statValueStyle}>{stats.totalProposals}</div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Active</div>
            <div style={{ ...statValueStyle, color: '#3B82F6' }}>
              {stats.activeProposals}
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Passed</div>
            <div style={{ ...statValueStyle, color: '#22C55E' }}>
              {stats.passedProposals}
            </div>
          </div>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>Your Voting Power</div>
            <div style={statValueStyle}>
              {isConnected ? formatVotingPower(stats.userVotingPower) : '—'}
            </div>
          </div>
        </div>

        {/* Governance Parameters Info */}
        <div style={{
          backgroundColor: '#0A0A0A',
          border: '1px solid #1F1F1F',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '32px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', margin: 0 }}>
              Governance Parameters
            </h3>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>
              Current settings
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Proposal Threshold</span>
              <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500' }}>
                {formatVotingPower(parameters.proposalThreshold)} CAST
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Quorum</span>
              <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500' }}>
                {parameters.quorumPercentage}%
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Voting Period</span>
              <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500' }}>
                {parameters.votingPeriod.toLocaleString()} blocks (~{Math.round(parameters.votingPeriod / 144)} days)
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Timelock Period</span>
              <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500' }}>
                {parameters.timelockPeriod.toLocaleString()} blocks (~{Math.round(parameters.timelockPeriod / 144)} days)
              </span>
            </div>
          </div>
        </div>

        {/* Delegation Section */}
        {isConnected && (
          <>
            {/* User Voting Activity */}
            <div style={{
              backgroundColor: '#0A0A0A',
              border: '1px solid #1F1F1F',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '16px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '16px' }}>
                Your Governance Activity
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px',
              }}>
                <div>
                  <div style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '4px' }}>Proposals Voted</div>
                  <div style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: '600' }}>
                    {proposals.filter(p => p.userVote).length}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '4px' }}>Votes For</div>
                  <div style={{ color: '#22C55E', fontSize: '20px', fontWeight: '600' }}>
                    {proposals.filter(p => p.userVote === 'for').length}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '4px' }}>Votes Against</div>
                  <div style={{ color: '#EF4444', fontSize: '20px', fontWeight: '600' }}>
                    {proposals.filter(p => p.userVote === 'against').length}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '4px' }}>Participation</div>
                  <div style={{ color: '#3B82F6', fontSize: '20px', fontWeight: '600' }}>
                    {stats.totalProposals > 0 
                      ? Math.round((proposals.filter(p => p.userVote).length / stats.totalProposals) * 100) 
                      : 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Delegation Section */}
            <div style={{
              backgroundColor: '#0A0A0A',
              border: '1px solid #1F1F1F',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '12px' }}>
                Voting Power Delegation
              </h3>
            <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
              Delegate your voting power to another address to vote on your behalf. You can revoke delegation at any time.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowDelegateModal(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  border: '1px solid #3B82F6',
                  borderRadius: '10px',
                  color: '#3B82F6',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Delegate Voting Power
              </button>
              <button
                onClick={handleRevokeDelegation}
                disabled={delegationState.isLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  border: '1px solid #6B7280',
                  borderRadius: '10px',
                  color: '#9CA3AF',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: delegationState.isLoading ? 'not-allowed' : 'pointer',
                  opacity: delegationState.isLoading ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {delegationState.isLoading ? 'Revoking...' : 'Revoke Delegation'}
              </button>
            </div>
            {delegationState.error && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#EF444420',
                border: '1px solid #EF444440',
                borderRadius: '8px',
                color: '#F87171',
                fontSize: '13px',
              }}>
                {delegationState.error}
              </div>
            )}
          </div>
          </>
        )}

        {/* Connect Wallet CTA or Create Proposal Button */}
        {!isConnected ? (
          <div style={connectCardStyle}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#FFFFFF', marginBottom: '12px' }}>
              Connect to Participate
            </h3>
            <p style={{ color: '#9CA3AF', marginBottom: '24px' }}>
              Connect your wallet to vote on proposals and participate in governance
            </p>
            <button style={connectButtonStyle} onClick={() => connect()}>
              Connect Wallet
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '32px',
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#6B7280' }}>
                Current block: {currentBlock.toLocaleString()}
              </span>
              <button
                onClick={refetch}
                disabled={isLoading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#9CA3AF',
                  fontSize: '13px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3B82F6',
                border: 'none',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              + Create Proposal
            </button>
          </div>
        )}

        {/* Vote Error */}
        {voteError && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#EF444420',
            border: '1px solid #EF444440',
            borderRadius: '10px',
            marginBottom: '24px',
            color: '#F87171',
            fontSize: '14px',
          }}>
            {voteError}
          </div>
        )}

        {/* Search and Filter */}
        <div style={{
          backgroundColor: '#0A0A0A',
          border: '1px solid #1F1F1F',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '24px',
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '10px 16px',
                backgroundColor: '#111111',
                border: '1px solid #2F2F2F',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              {['all', 'active', 'passed', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as typeof statusFilter)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: statusFilter === status ? '#3B82F6' : 'transparent',
                    border: `1px solid ${statusFilter === status ? '#3B82F6' : '#374151'}`,
                    borderRadius: '8px',
                    color: statusFilter === status ? '#FFFFFF' : '#9CA3AF',
                    fontSize: '13px',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Proposals */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{ ...sectionTitleStyle, marginBottom: 0 }}>
            {statusFilter === 'all' ? 'All Proposals' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Proposals`}
          </h2>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>
            {filteredProposals.length} {filteredProposals.length === 1 ? 'proposal' : 'proposals'}
          </span>
        </div>
        
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
            Loading proposals...
          </div>
        ) : filteredProposals.length === 0 ? (
          <div style={{ 
            backgroundColor: '#0A0A0A', 
            border: '1px solid #1F1F1F', 
            borderRadius: '16px', 
            padding: '48px', 
            textAlign: 'center', 
            marginBottom: '32px' 
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#FFFFFF', marginBottom: '8px' }}>
              {searchQuery || statusFilter !== 'all' ? 'No Matching Proposals' : 'No Proposals Yet'}
            </h3>
            <p style={{ color: '#9CA3AF', maxWidth: '400px', margin: '0 auto', marginBottom: '24px' }}>
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter to see more results.'
                : 'There are currently no governance proposals. Be the first to create one!'
              }
            </p>
            {isConnected && !searchQuery && statusFilter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3B82F6',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Create First Proposal
              </button>
            )}
          </div>
        ) : filteredProposals.map(proposal => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            isConnected={isConnected}
            isVoting={voteState.isLoading}
            onVote={handleVote}
            onSelect={setSelectedProposal}
          />
        ))}

        {/* Proposal Detail Modal */}
        {selectedProposal && (
          <div style={modalOverlayStyle} onClick={() => setSelectedProposal(null)}>
            <div style={{ ...modalStyle, position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button style={closeButtonStyle} onClick={() => setSelectedProposal(null)}>
                ×
              </button>
              <span style={statusBadgeStyle(selectedProposal.status)}>
                {selectedProposal.status}
              </span>
              <h2 style={{ ...modalTitleStyle, marginTop: '16px' }}>
                {selectedProposal.title}
              </h2>
              <p style={modalDescStyle}>{selectedProposal.description}</p>
              
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#111111', 
                borderRadius: '12px',
                marginBottom: '24px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Proposer</span>
                  <span style={{ color: '#FFFFFF', fontSize: '14px', fontFamily: 'monospace' }}>
                    {selectedProposal.proposer}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Total Votes</span>
                  <span style={{ color: '#FFFFFF', fontSize: '14px' }}>
                    {formatVotingPower(selectedProposal.totalVotes)} CAST
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#9CA3AF', fontSize: '14px' }}>Start Block</span>
                  <span style={{ color: '#FFFFFF', fontSize: '14px' }}>
                    #{selectedProposal.startBlock.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9CA3AF', fontSize: '14px' }}>End Block</span>
                  <span style={{ color: '#FFFFFF', fontSize: '14px' }}>
                    #{selectedProposal.endBlock.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Voting Progress */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  height: '8px',
                  backgroundColor: '#1F1F1F',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  display: 'flex',
                }}>
                  <div style={{
                    width: `${calculateVotePercentage(selectedProposal.votesFor, selectedProposal.totalVotes)}%`,
                    height: '100%',
                    backgroundColor: '#22C55E',
                  }} />
                  <div style={{
                    width: `${calculateVotePercentage(selectedProposal.votesAgainst, selectedProposal.totalVotes)}%`,
                    height: '100%',
                    backgroundColor: '#EF4444',
                  }} />
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                  marginTop: '8px',
                }}>
                  <span style={{ color: '#22C55E' }}>
                    For: {formatVotingPower(selectedProposal.votesFor)}
                  </span>
                  <span style={{ color: '#EF4444' }}>
                    Against: {formatVotingPower(selectedProposal.votesAgainst)}
                  </span>
                </div>
              </div>

              {selectedProposal.status === 'active' && isConnected && !selectedProposal.userVote && (
                <div style={voteButtonsStyle}>
                  <button
                    style={voteButtonStyle('for', voteState.isLoading)}
                    onClick={() => handleVote(selectedProposal.id, 'for')}
                  >
                    {voteState.isLoading ? 'Voting...' : 'Vote For'}
                  </button>
                  <button
                    style={voteButtonStyle('against', voteState.isLoading)}
                    onClick={() => handleVote(selectedProposal.id, 'against')}
                  >
                    {voteState.isLoading ? 'Voting...' : 'Vote Against'}
                  </button>
                </div>
              )}

              {selectedProposal.userVote && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: selectedProposal.userVote === 'for' ? '#22C55E20' : '#EF444420',
                  color: selectedProposal.userVote === 'for' ? '#22C55E' : '#EF4444',
                  textAlign: 'center',
                  fontWeight: '600',
                }}>
                  You voted {selectedProposal.userVote === 'for' ? 'For' : 'Against'} this proposal
                </div>
              )}

              {/* Execution Actions */}
              {isConnected && selectedProposal.status === 'passed' && (
                <button
                  onClick={() => handleQueueProposal(selectedProposal.id)}
                  disabled={executionState.isLoading}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '12px 20px',
                    backgroundColor: executionState.isLoading ? '#374151' : '#22C55E',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: executionState.isLoading ? 'not-allowed' : 'pointer',
                    opacity: executionState.isLoading ? 0.5 : 1,
                  }}
                >
                  {executionState.isLoading ? 'Queueing...' : 'Queue Proposal'}
                </button>
              )}

              {isConnected && selectedProposal.status === 'queued' && (
                <button
                  onClick={() => handleExecuteProposal(selectedProposal.id)}
                  disabled={executionState.isLoading}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '12px 20px',
                    backgroundColor: executionState.isLoading ? '#374151' : '#3B82F6',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: executionState.isLoading ? 'not-allowed' : 'pointer',
                    opacity: executionState.isLoading ? 0.5 : 1,
                  }}
                >
                  {executionState.isLoading ? 'Executing...' : 'Execute Proposal'}
                </button>
              )}

              {executionState.error && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#EF444420',
                  border: '1px solid #EF444440',
                  borderRadius: '8px',
                  color: '#F87171',
                  fontSize: '13px',
                }}>
                  {executionState.error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Proposal Modal */}
        <CreateProposalModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProposal}
          isSubmitting={proposalState.isLoading}
          userVotingPower={stats.userVotingPower}
          proposalThreshold={stats.proposalThreshold}
          error={proposalState.error}
        />

        {/* Delegate Modal */}
        {showDelegateModal && (
          <div style={modalOverlayStyle} onClick={() => setShowDelegateModal(false)}>
            <div style={{ ...modalStyle, position: 'relative', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
              <button style={closeButtonStyle} onClick={() => setShowDelegateModal(false)}>
                ×
              </button>
              <h2 style={modalTitleStyle}>Delegate Voting Power</h2>
              <p style={modalDescStyle}>
                Enter the Stacks address you want to delegate your voting power to. They will be able to vote on your behalf.
              </p>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#9CA3AF', 
                  fontSize: '14px', 
                  marginBottom: '8px',
                  fontWeight: '500',
                }}>
                  Delegate Address
                </label>
                <input
                  type="text"
                  value={delegateAddress}
                  onChange={(e) => setDelegateAddress(e.target.value)}
                  placeholder="SP2..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#111111',
                    border: '1px solid #2F2F2F',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{
                padding: '12px 16px',
                backgroundColor: '#F59E0B20',
                border: '1px solid #F59E0B40',
                borderRadius: '10px',
                marginBottom: '24px',
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#F59E0B', fontSize: '16px' }}>⚠️</span>
                  <p style={{ color: '#FCD34D', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                    The delegate will be able to vote with your full voting power until you revoke the delegation.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowDelegateModal(false)}
                  style={{
                    flex: '1',
                    padding: '12px 20px',
                    backgroundColor: 'transparent',
                    border: '1px solid #2F2F2F',
                    borderRadius: '10px',
                    color: '#9CA3AF',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelegate}
                  disabled={!delegateAddress.trim() || delegationState.isLoading}
                  style={{
                    flex: '1',
                    padding: '12px 20px',
                    backgroundColor: delegateAddress.trim() && !delegationState.isLoading ? '#3B82F6' : '#374151',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: delegateAddress.trim() && !delegationState.isLoading ? 'pointer' : 'not-allowed',
                    opacity: delegateAddress.trim() && !delegationState.isLoading ? 1 : 0.5,
                  }}
                >
                  {delegationState.isLoading ? 'Delegating...' : 'Delegate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
