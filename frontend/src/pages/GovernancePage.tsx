import { useState } from 'react';
import { useWallet } from '../components/WalletProvider';
import { 
  useGovernance, 
  formatVotingPower, 
  calculateVotePercentage,
  isQuorumReached,
  type Proposal,
} from '../hooks/useGovernance';

type ProposalStatus = 'active' | 'passed' | 'rejected' | 'pending';
type VoteType = 'for' | 'against' | null;

export function GovernancePage() {
  const { isConnected, connect, address } = useWallet();
  const { stats, proposals, isLoading, error, refetch } = useGovernance(address);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (proposalId: number, vote: 'for' | 'against') => {
    if (!isConnected || isVoting) return;
    setIsVoting(true);
    try {
      console.log(`Voting ${vote} on proposal ${proposalId}`);
      // Note: Voting functionality requires governance contract deployment
      console.warn('Governance contract not yet deployed - voting disabled');
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setIsVoting(false);
      setSelectedProposal(null);
    }
  };

  const getStatusColor = (status: ProposalStatus): string => {
    switch (status) {
      case 'active': return '#3B82F6';
      case 'passed': return '#22C55E';
      case 'rejected': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return '#9CA3AF';
    }
  };

  const getStatusBgColor = (status: ProposalStatus): string => {
    switch (status) {
      case 'active': return '#3B82F620';
      case 'passed': return '#22C55E20';
      case 'rejected': return '#EF444420';
      case 'pending': return '#F59E0B20';
      default: return '#9CA3AF20';
    }
  };

  const calculatePercentage = (votes: bigint, total: bigint): number => {
    if (total === 0n) return 0;
    return Number((votes * 100n) / total);
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

  const proposalCardStyle: React.CSSProperties = {
    backgroundColor: '#0A0A0A',
    border: '1px solid #1F1F1F',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const proposalHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
  };

  const proposalTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '8px',
  };

  const proposalDescStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#9CA3AF',
    lineHeight: '1.6',
    marginBottom: '16px',
  };

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

  const progressContainerStyle: React.CSSProperties = {
    marginBottom: '16px',
  };

  const progressBarBgStyle: React.CSSProperties = {
    height: '8px',
    backgroundColor: '#1F1F1F',
    borderRadius: '4px',
    overflow: 'hidden',
    display: 'flex',
  };

  const progressBarForStyle = (percentage: number): React.CSSProperties => ({
    width: `${percentage}%`,
    height: '100%',
    backgroundColor: '#22C55E',
    transition: 'width 0.3s',
  });

  const progressBarAgainstStyle = (percentage: number): React.CSSProperties => ({
    width: `${percentage}%`,
    height: '100%',
    backgroundColor: '#EF4444',
    transition: 'width 0.3s',
  });

  const voteStatsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginTop: '8px',
  };

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

  const votedBadgeStyle = (vote: VoteType): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: vote === 'for' ? '#22C55E20' : '#EF444420',
    color: vote === 'for' ? '#22C55E' : '#EF4444',
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

        {/* Connect Wallet CTA */}
        {!isConnected && (
          <div style={connectCardStyle}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#FFFFFF', marginBottom: '12px' }}>
              Connect to Participate
            </h3>
            <p style={{ color: '#9CA3AF', marginBottom: '24px' }}>
              Connect your wallet and stake OXC to vote on proposals
            </p>
            <button style={connectButtonStyle} onClick={() => connect()}>
              Connect Wallet
            </button>
          </div>
        )}

        {/* Active Proposals */}
        <h2 style={sectionTitleStyle}>Active Proposals</h2>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
            Loading proposals...
          </div>
        ) : proposals.filter(p => p.status === 'active').length === 0 ? (
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
              No Active Proposals
            </h3>
            <p style={{ color: '#9CA3AF', maxWidth: '400px', margin: '0 auto' }}>
              There are currently no active governance proposals. 
              Governance features will be enabled when the governance contract is deployed.
            </p>
          </div>
        ) : proposals.filter(p => p.status === 'active').map(proposal => {
          const forPercentage = calculateVotePercentage(proposal.votesFor, proposal.totalVotes);
          const againstPercentage = calculateVotePercentage(proposal.votesAgainst, proposal.totalVotes);
          const quorumReached = isQuorumReached(proposal.totalVotes, proposal.quorum);

          return (
            <div
              key={proposal.id}
              style={proposalCardStyle}
              onClick={() => setSelectedProposal(proposal)}
            >
              <div style={proposalHeaderStyle}>
                <div>
                  <div style={proposalTitleStyle}>{proposal.title}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    Proposed by {proposal.proposer} • Ends at block {proposal.endBlock.toLocaleString()}
                  </div>
                </div>
                <span style={statusBadgeStyle(proposal.status)}>
                  {proposal.status}
                </span>
              </div>
              
              <p style={proposalDescStyle}>{proposal.description}</p>
              
              <div style={progressContainerStyle}>
                <div style={progressBarBgStyle}>
                  <div style={progressBarForStyle(forPercentage)} />
                  <div style={progressBarAgainstStyle(againstPercentage)} />
                </div>
                <div style={voteStatsStyle}>
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

              {isConnected && (
                proposal.userVote ? (
                  <div style={votedBadgeStyle(proposal.userVote)}>
                    {proposal.userVote === 'for' ? '✓ Voted For' : '✗ Voted Against'}
                  </div>
                ) : (
                  <div style={voteButtonsStyle}>
                    <button
                      style={voteButtonStyle('for', isVoting)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(proposal.id, 'for');
                      }}
                    >
                      Vote For
                    </button>
                    <button
                      style={voteButtonStyle('against', isVoting)}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(proposal.id, 'against');
                      }}
                    >
                      Vote Against
                    </button>
                  </div>
                )
              )}
            </div>
          );
        })}

        {/* Past Proposals */}
        <h2 style={{ ...sectionTitleStyle, marginTop: '48px' }}>Past Proposals</h2>
        {proposals.filter(p => p.status !== 'active').length === 0 ? (
          <div style={{ 
            backgroundColor: '#0A0A0A', 
            border: '1px solid #1F1F1F', 
            borderRadius: '16px', 
            padding: '32px', 
            textAlign: 'center', 
            marginBottom: '32px',
            opacity: 0.8
          }}>
            <p style={{ color: '#9CA3AF' }}>
              No past proposals yet.
            </p>
          </div>
        ) : proposals.filter(p => p.status !== 'active').map(proposal => {
          const forPercentage = calculateVotePercentage(proposal.votesFor, proposal.totalVotes);
          const againstPercentage = calculateVotePercentage(proposal.votesAgainst, proposal.totalVotes);

          return (
            <div
              key={proposal.id}
              style={{ ...proposalCardStyle, opacity: 0.8 }}
              onClick={() => setSelectedProposal(proposal)}
            >
              <div style={proposalHeaderStyle}>
                <div>
                  <div style={proposalTitleStyle}>{proposal.title}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    Proposed by {proposal.proposer} • Ended at block {proposal.endBlock.toLocaleString()}
                  </div>
                </div>
                <span style={statusBadgeStyle(proposal.status)}>
                  {proposal.status}
                </span>
              </div>
              
              <div style={progressContainerStyle}>
                <div style={progressBarBgStyle}>
                  <div style={progressBarForStyle(forPercentage)} />
                  <div style={progressBarAgainstStyle(againstPercentage)} />
                </div>
                <div style={voteStatsStyle}>
                  <span style={{ color: '#22C55E' }}>
                    For: {formatVotingPower(proposal.votesFor)} ({forPercentage}%)
                  </span>
                  <span style={{ color: '#EF4444' }}>
                    Against: {formatVotingPower(proposal.votesAgainst)} ({againstPercentage}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}

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
                    {formatOXC(selectedProposal.totalVotes)} OXC
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9CA3AF', fontSize: '14px' }}>End Block</span>
                  <span style={{ color: '#FFFFFF', fontSize: '14px' }}>
                    #{selectedProposal.endBlock.toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedProposal.status === 'active' && isConnected && !selectedProposal.userVote && (
                <div style={voteButtonsStyle}>
                  <button
                    style={voteButtonStyle('for', isVoting)}
                    onClick={() => handleVote(selectedProposal.id, 'for')}
                  >
                    {isVoting ? 'Voting...' : 'Vote For'}
                  </button>
                  <button
                    style={voteButtonStyle('against', isVoting)}
                    onClick={() => handleVote(selectedProposal.id, 'against')}
                  >
                    {isVoting ? 'Voting...' : 'Vote Against'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
