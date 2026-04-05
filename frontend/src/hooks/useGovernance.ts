/**
 * useGovernance Hook
 * 
 * Connects to governance-core and governance-token contracts
 * for proposal management and voting functionality.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchCallReadOnlyFunction, cvToValue, Cl, makeContractCall, broadcastTransaction, AnchorMode } from '@stacks/transactions';
import { getNetwork } from '../config';
import { GOVERNANCE_CONFIG, mapProposalStatus } from '../config/governance';
import type { 
  Proposal, 
  GovernanceStats, 
  GovernanceParameters, 
  VoteType, 
  ProposalStatus,
  ContractProposal 
} from '../types/governance';

// Default stats when data is not available
const DEFAULT_STATS: GovernanceStats = {
  totalProposals: 0,
  activeProposals: 0,
  passedProposals: 0,
  rejectedProposals: 0,
  pendingProposals: 0,
  userVotingPower: 0n,
  quorumRequired: 1000000_000000n, // 1M tokens with 6 decimals
  proposalThreshold: 1000000_000000n,
  votingPeriod: 1440,
  timelockPeriod: 144,
};

// Default governance parameters
const DEFAULT_PARAMS: GovernanceParameters = {
  proposalThreshold: 1000000n,
  quorumPercentage: 10,
  votingPeriod: 1440,
  timelockPeriod: 144,
  executionWindow: 1440,
};

interface GovernanceData {
  stats: GovernanceStats;
  proposals: Proposal[];
  parameters: GovernanceParameters;
  isLoading: boolean;
  error: string | null;
  currentBlock: number;
  refetch: () => void;
  castVote: (proposalId: number, voteType: VoteType) => Promise<string | null>;
  createProposal: (title: string, description: string) => Promise<number | null>;
}

/**
 * Fetch current Stacks block height
 */
async function fetchCurrentBlock(): Promise<number> {
  try {
    const response = await fetch('https://api.hiro.so/extended/v1/block?limit=1');
    const data = await response.json();
    return data.results?.[0]?.height || 0;
  } catch (error) {
    console.warn('Error fetching current block:', error);
    return 0;
  }
}

/**
 * Fetch governance parameters from contract
 */
async function fetchGovernanceParameters(): Promise<GovernanceParameters> {
  try {
    const { address, name } = GOVERNANCE_CONFIG.GOVERNANCE_CORE;
    
    const result = await fetchCallReadOnlyFunction({
      network: getNetwork(),
      contractAddress: address,
      contractName: name,
      functionName: 'get-governance-parameters',
      functionArgs: [],
      senderAddress: address,
    });
    
    const value = cvToValue(result);
    if (value && typeof value === 'object') {
      return {
        proposalThreshold: BigInt(value['proposal-threshold'] || 1000000),
        quorumPercentage: Number(value['quorum-percentage'] || 10),
        votingPeriod: Number(value['voting-period'] || 1440),
        timelockPeriod: Number(value['timelock-period'] || 144),
        executionWindow: Number(value['execution-window'] || 1440),
      };
    }
    return DEFAULT_PARAMS;
  } catch (error) {
    console.warn('Error fetching governance parameters:', error);
    return DEFAULT_PARAMS;
  }
}

/**
 * Fetch proposal count from contract
 */
async function fetchProposalCount(): Promise<number> {
  try {
    const { address, name } = GOVERNANCE_CONFIG.GOVERNANCE_CORE;
    
    const result = await fetchCallReadOnlyFunction({
      network: getNetwork(),
      contractAddress: address,
      contractName: name,
      functionName: 'get-proposal-count',
      functionArgs: [],
      senderAddress: address,
    });
    
    const value = cvToValue(result);
    return typeof value === 'number' ? value : 0;
  } catch (error) {
    console.warn('Error fetching proposal count:', error);
    return 0;
  }
}

/**
 * Fetch single proposal from contract
 */
async function fetchProposal(proposalId: number): Promise<ContractProposal | null> {
  try {
    const { address, name } = GOVERNANCE_CONFIG.GOVERNANCE_CORE;
    
    const result = await fetchCallReadOnlyFunction({
      network: getNetwork(),
      contractAddress: address,
      contractName: name,
      functionName: 'get-proposal',
      functionArgs: [Cl.uint(proposalId)],
      senderAddress: address,
    });
    
    const value = cvToValue(result);
    if (value && typeof value === 'object') {
      return {
        proposer: value.proposer || '',
        title: value.title || '',
        description: value.description || '',
        startBlock: Number(value['start-block'] || 0),
        endBlock: Number(value['end-block'] || 0),
        forVotes: BigInt(value['for-votes'] || 0),
        againstVotes: BigInt(value['against-votes'] || 0),
        abstainVotes: BigInt(value['abstain-votes'] || 0),
        status: Number(value.status || 0),
        queuedAt: value['queued-at'] ? Number(value['queued-at']) : null,
        executedAt: value['executed-at'] ? Number(value['executed-at']) : null,
        snapshotBlock: Number(value['snapshot-block'] || 0),
      };
    }
    return null;
  } catch (error) {
    console.warn(`Error fetching proposal ${proposalId}:`, error);
    return null;
  }
}

/**
 * Fetch user's vote on a proposal
 */
async function fetchUserVote(proposalId: number, userAddress: string): Promise<VoteType | null> {
  try {
    const { address, name } = GOVERNANCE_CONFIG.GOVERNANCE_CORE;
    
    // First check if user has voted
    const hasVotedResult = await fetchCallReadOnlyFunction({
      network: getNetwork(),
      contractAddress: address,
      contractName: name,
      functionName: 'has-voted',
      functionArgs: [Cl.uint(proposalId), Cl.principal(userAddress)],
      senderAddress: userAddress,
    });
    
    const hasVoted = cvToValue(hasVotedResult);
    if (!hasVoted) return null;
    
    // Get vote details
    const voteResult = await fetchCallReadOnlyFunction({
      network: getNetwork(),
      contractAddress: address,
      contractName: name,
      functionName: 'get-vote',
      functionArgs: [Cl.uint(proposalId), Cl.principal(userAddress)],
      senderAddress: userAddress,
    });
    
    const vote = cvToValue(voteResult);
    if (vote && typeof vote === 'object') {
      const voteType = Number(vote['vote-type']);
      if (voteType === GOVERNANCE_CONFIG.VOTE_TYPE.FOR) return 'for';
      if (voteType === GOVERNANCE_CONFIG.VOTE_TYPE.AGAINST) return 'against';
      if (voteType === GOVERNANCE_CONFIG.VOTE_TYPE.ABSTAIN) return 'abstain';
    }
    return null;
  } catch (error) {
    console.warn('Error fetching user vote:', error);
    return null;
  }
}

/**
 * Fetch user's voting power from governance token
 */
async function fetchUserVotingPower(userAddress: string): Promise<bigint> {
  try {
    const { address, name } = GOVERNANCE_CONFIG.GOVERNANCE_TOKEN;
    
    const result = await fetchCallReadOnlyFunction({
      network: getNetwork(),
      contractAddress: address,
      contractName: name,
      functionName: 'get-voting-power',
      functionArgs: [Cl.principal(userAddress)],
      senderAddress: userAddress,
    });
    
    const value = cvToValue(result);
    if (value && typeof value === 'object' && 'value' in value) {
      return BigInt(value.value || 0);
    }
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(value);
    return 0n;
  } catch (error) {
    console.warn('Error fetching voting power:', error);
    return 0n;
  }
}

/**
 * Main governance hook
 */
export function useGovernance(userAddress?: string): GovernanceData {
  const [stats, setStats] = useState<GovernanceStats>(DEFAULT_STATS);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [parameters, setParameters] = useState<GovernanceParameters>(DEFAULT_PARAMS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBlock, setCurrentBlock] = useState(0);

  const fetchGovernanceData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch current block and parameters in parallel
      const [block, params] = await Promise.all([
        fetchCurrentBlock(),
        fetchGovernanceParameters(),
      ]);
      
      setCurrentBlock(block);
      setParameters(params);
      
      // Fetch proposal count
      const proposalCount = await fetchProposalCount();
      
      // Fetch all proposals
      const proposalPromises: Promise<ContractProposal | null>[] = [];
      for (let i = 1; i <= proposalCount; i++) {
        proposalPromises.push(fetchProposal(i));
      }
      
      const contractProposals = await Promise.all(proposalPromises);
      
      // Fetch user votes if connected
      let userVotes: Map<number, VoteType | null> = new Map();
      let votingPower = 0n;
      
      if (userAddress) {
        votingPower = await fetchUserVotingPower(userAddress);
        
        const votePromises = contractProposals.map((_, i) => 
          fetchUserVote(i + 1, userAddress)
        );
        const votes = await Promise.all(votePromises);
        votes.forEach((vote, i) => userVotes.set(i + 1, vote));
      }
      
      // Parse proposals
      const parsedProposals: Proposal[] = contractProposals
        .filter((p): p is ContractProposal => p !== null)
        .map((p, index) => {
          const id = index + 1;
          const totalVotes = p.forVotes + p.againstVotes + p.abstainVotes;
          const blocksRemaining = Math.max(0, p.endBlock - block);
          
          return {
            id,
            title: p.title,
            description: p.description,
            proposer: p.proposer,
            status: mapProposalStatus(p.status, p.startBlock, p.endBlock, block),
            votesFor: p.forVotes,
            votesAgainst: p.againstVotes,
            votesAbstain: p.abstainVotes,
            totalVotes,
            quorum: BigInt(params.quorumPercentage * 100000_000000), // Simplified quorum calc
            startBlock: p.startBlock,
            endBlock: p.endBlock,
            blocksRemaining,
            userVote: userVotes.get(id) || null,
            queuedAt: p.queuedAt || undefined,
            executedAt: p.executedAt || undefined,
          };
        });
      
      // Calculate stats
      const activeCount = parsedProposals.filter(p => p.status === 'active').length;
      const passedCount = parsedProposals.filter(p => p.status === 'passed' || p.status === 'executed' || p.status === 'queued').length;
      const rejectedCount = parsedProposals.filter(p => p.status === 'rejected' || p.status === 'cancelled').length;
      const pendingCount = parsedProposals.filter(p => p.status === 'pending').length;
      
      setStats({
        totalProposals: proposalCount,
        activeProposals: activeCount,
        passedProposals: passedCount,
        rejectedProposals: rejectedCount,
        pendingProposals: pendingCount,
        userVotingPower: votingPower,
        quorumRequired: BigInt(params.quorumPercentage * 100000_000000),
        proposalThreshold: params.proposalThreshold,
        votingPeriod: params.votingPeriod,
        timelockPeriod: params.timelockPeriod,
      });
      
      setProposals(parsedProposals);
      
    } catch (err) {
      console.error('Error fetching governance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch governance data');
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetchGovernanceData();
    
    // Refresh every 2 minutes
    const interval = setInterval(fetchGovernanceData, 120000);
    return () => clearInterval(interval);
  }, [fetchGovernanceData]);

  /**
   * Cast a vote on a proposal
   */
  const castVote = useCallback(async (proposalId: number, voteType: VoteType): Promise<string | null> => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }
    
    const { address, name } = GOVERNANCE_CONFIG.GOVERNANCE_CORE;
    const voteTypeNum = voteType === 'for' ? 1 : voteType === 'against' ? 0 : 2;
    
    try {
      const txOptions = {
        network: getNetwork(),
        anchorMode: AnchorMode.Any,
        contractAddress: address,
        contractName: name,
        functionName: 'cast-vote',
        functionArgs: [Cl.uint(proposalId), Cl.uint(voteTypeNum)],
        postConditions: [],
        senderKey: '', // Will be signed by wallet
      };
      
      // Note: In production, this would use the wallet provider to sign
      // For now, return a placeholder
      console.log('Would cast vote:', txOptions);
      return null;
    } catch (error) {
      console.error('Error casting vote:', error);
      throw error;
    }
  }, [userAddress]);

  /**
   * Create a new proposal
   */
  const createProposal = useCallback(async (title: string, description: string): Promise<number | null> => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }
    
    const { address, name } = GOVERNANCE_CONFIG.GOVERNANCE_CORE;
    
    try {
      const txOptions = {
        network: getNetwork(),
        anchorMode: AnchorMode.Any,
        contractAddress: address,
        contractName: name,
        functionName: 'create-proposal',
        functionArgs: [
          Cl.stringUtf8(title),
          Cl.stringUtf8(description),
        ],
        postConditions: [],
        senderKey: '',
      };
      
      console.log('Would create proposal:', txOptions);
      return null;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  }, [userAddress]);

  return {
    stats,
    proposals,
    parameters,
    isLoading,
    error,
    currentBlock,
    refetch: fetchGovernanceData,
    castVote,
    createProposal,
  };
}

/**
 * Format voting power for display
 */
export function formatVotingPower(amount: bigint): string {
  const value = Number(amount) / 1_000_000;
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

/**
 * Calculate voting percentage
 */
export function calculateVotePercentage(votes: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Math.round(Number(votes * 10000n / total) / 100);
}

/**
 * Check if quorum is reached
 */
export function isQuorumReached(totalVotes: bigint, quorum: bigint): boolean {
  return totalVotes >= quorum;
}

// Re-export types for backward compatibility
export type { Proposal, GovernanceStats, VoteType, ProposalStatus };

