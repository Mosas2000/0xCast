/**
 * Governance Types
 * 
 * Type definitions for governance proposals and voting.
 */

// Proposal status (UI representation)
export type ProposalStatus = 'pending' | 'active' | 'passed' | 'rejected' | 'queued' | 'executed' | 'cancelled';

// Vote type
export type VoteType = 'for' | 'against' | 'abstain';

// Raw proposal from contract
export interface ContractProposal {
  proposer: string;
  title: string;
  description: string;
  startBlock: number;
  endBlock: number;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  status: number;
  queuedAt: number | null;
  executedAt: number | null;
  snapshotBlock: number;
}

// Parsed proposal for UI
export interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  status: ProposalStatus;
  votesFor: bigint;
  votesAgainst: bigint;
  votesAbstain: bigint;
  totalVotes: bigint;
  quorum: bigint;
  startBlock: number;
  endBlock: number;
  blocksRemaining: number;
  userVote?: VoteType | null;
  queuedAt?: number;
  executedAt?: number;
}

// User vote record
export interface UserVote {
  proposalId: number;
  voteType: VoteType;
  votingPower: bigint;
}

// Governance statistics
export interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  rejectedProposals: number;
  pendingProposals: number;
  userVotingPower: bigint;
  quorumRequired: bigint;
  proposalThreshold: bigint;
  votingPeriod: number;
  timelockPeriod: number;
}

// Governance parameters from contract
export interface GovernanceParameters {
  proposalThreshold: bigint;
  quorumPercentage: number;
  votingPeriod: number;
  timelockPeriod: number;
  executionWindow: number;
}

// Create proposal input
export interface CreateProposalInput {
  title: string;
  description: string;
}

// Vote input
export interface VoteInput {
  proposalId: number;
  voteType: VoteType;
}

// Delegation
export interface Delegation {
  delegator: string;
  delegate: string;
  votingPower: bigint;
}
