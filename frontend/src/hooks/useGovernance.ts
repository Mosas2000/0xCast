/**
 * Hook for fetching governance data from the contract
 * 
 * Note: The current oxcast.clar contract focuses on staking.
 * Governance features (proposals, voting) would need a separate
 * governance contract to be fully implemented. For now, this
 * provides a framework and uses staking data for voting power.
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchCallReadOnlyFunction, cvToValue, Cl } from '@stacks/transactions';
import { TOKEN_CONTRACT, getApiUrl, getNetwork } from '../config';

export interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  userVotingPower: bigint;
  quorumRequired: bigint;
}

export interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  status: 'active' | 'passed' | 'rejected' | 'pending';
  votesFor: bigint;
  votesAgainst: bigint;
  totalVotes: bigint;
  quorum: bigint;
  endBlock: number;
  userVote?: 'for' | 'against' | null;
}

interface GovernanceData {
  stats: GovernanceStats;
  proposals: Proposal[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const DEFAULT_STATS: GovernanceStats = {
  totalProposals: 0,
  activeProposals: 0,
  passedProposals: 0,
  userVotingPower: 0n,
  quorumRequired: 5000000_000000n, // 5M OXC with 6 decimals
};

/**
 * Fetch user's staking amount (used as voting power)
 */
async function fetchUserVotingPower(address: string): Promise<bigint> {
  try {
    const [contractAddress, contractName] = TOKEN_CONTRACT.split('.');
    
    const result = await fetchCallReadOnlyFunction({
      network: getNetwork(),
      contractAddress,
      contractName,
      functionName: 'get-stake',
      functionArgs: [Cl.principal(address)],
      senderAddress: address,
    });
    
    const value = cvToValue(result);
    if (value && typeof value === 'object' && 'amount' in value) {
      return BigInt(value.amount);
    }
    return 0n;
  } catch (error) {
    console.warn('Error fetching voting power:', error);
    return 0n;
  }
}

/**
 * Hook to manage governance data
 * 
 * Currently returns placeholder data since governance contract
 * is not yet deployed. Voting power is derived from staking.
 */
export function useGovernance(userAddress?: string): GovernanceData {
  const [stats, setStats] = useState<GovernanceStats>(DEFAULT_STATS);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGovernanceData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch user's voting power from staking
      let votingPower = 0n;
      if (userAddress) {
        votingPower = await fetchUserVotingPower(userAddress);
      }

      // Note: When governance contract is deployed, replace this with
      // actual contract calls to fetch proposals and stats
      setStats({
        totalProposals: 0,
        activeProposals: 0,
        passedProposals: 0,
        userVotingPower: votingPower,
        quorumRequired: 5000000_000000n,
      });

      // No proposals yet - governance contract not deployed
      setProposals([]);
      
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

  return {
    stats,
    proposals,
    isLoading,
    error,
    refetch: fetchGovernanceData,
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
