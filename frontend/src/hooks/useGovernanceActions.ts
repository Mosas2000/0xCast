/**
 * useGovernanceActions Hook
 * 
 * Provides actions for interacting with governance contracts:
 * - Casting votes on proposals
 * - Creating new proposals
 * - Delegating voting power
 * - Executing passed proposals
 */

import { useState, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { Cl, PostConditionMode } from '@stacks/transactions';
import { useWallet } from '../components/WalletProvider';
import { GOVERNANCE_CONFIG } from '../config/governance';
import { getNetwork } from '../config';
import type { VoteType } from '../types/governance';
import { useRateLimit } from './useRateLimit';

interface ActionState {
  isLoading: boolean;
  error: string | null;
  txId: string | null;
}

interface UseGovernanceActionsReturn {
  // Actions
  castVote: (proposalId: number, voteType: VoteType) => Promise<void>;
  createProposal: (title: string, description: string) => Promise<void>;
  delegateVotingPower: (delegate: string) => Promise<void>;
  revokeDelegation: () => Promise<void>;
  queueProposal: (proposalId: number) => Promise<void>;
  executeProposal: (proposalId: number) => Promise<void>;
  cancelProposal: (proposalId: number) => Promise<void>;
  
  // State
  voteState: ActionState;
  proposalState: ActionState;
  delegationState: ActionState;
  executionState: ActionState;
  
  // Reset
  resetStates: () => void;
}

const initialState: ActionState = {
  isLoading: false,
  error: null,
  txId: null,
};

export function useGovernanceActions(): UseGovernanceActionsReturn {
  const { isConnected, address } = useWallet();
  const { checkRateLimit } = useRateLimit();
  
  const [voteState, setVoteState] = useState<ActionState>(initialState);
  const [proposalState, setProposalState] = useState<ActionState>(initialState);
  const [delegationState, setDelegationState] = useState<ActionState>(initialState);
  const [executionState, setExecutionState] = useState<ActionState>(initialState);

  /**
   * Cast a vote on a proposal
   */
  const castVote = useCallback(async (proposalId: number, voteType: VoteType) => {
    if (!isConnected || !address) {
      setVoteState({ isLoading: false, error: 'Wallet not connected', txId: null });
      return;
    }

    const rateLimitResult = await checkRateLimit('vote');
    if (!rateLimitResult.allowed) {
      setVoteState({ isLoading: false, error: rateLimitResult.reason || 'Rate limit exceeded', txId: null });
      return;
    }

    setVoteState({ isLoading: true, error: null, txId: null });

    try {
      const voteTypeNum = voteType === 'for' ? 1 : voteType === 'against' ? 0 : 2;
      const { address: contractAddress, name: contractName } = GOVERNANCE_CONFIG.GOVERNANCE_CORE;

      await openContractCall({
        network: getNetwork(),
        contractAddress,
        contractName,
        functionName: 'cast-vote',
        functionArgs: [
          Cl.uint(proposalId),
          Cl.uint(voteTypeNum),
        ],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        onFinish: (data) => {
          setVoteState({ isLoading: false, error: null, txId: data.txId });
        },
        onCancel: () => {
          setVoteState({ isLoading: false, error: 'Transaction cancelled', txId: null });
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cast vote';
      setVoteState({ isLoading: false, error: message, txId: null });
    }
  }, [isConnected, address, checkRateLimit]);

  /**
   * Create a new proposal
   */
  const createProposal = useCallback(async (title: string, description: string) => {
    if (!isConnected || !address) {
      setProposalState({ isLoading: false, error: 'Wallet not connected', txId: null });
      return;
    }

    // Validate inputs
    if (!title.trim() || title.length > 256) {
      setProposalState({ isLoading: false, error: 'Title must be 1-256 characters', txId: null });
      return;
    }
    if (!description.trim() || description.length > 1024) {
      setProposalState({ isLoading: false, error: 'Description must be 1-1024 characters', txId: null });
      return;
    }

    setProposalState({ isLoading: true, error: null, txId: null });

    try {
      const { address: contractAddress, name: contractName } = GOVERNANCE_CONFIG.GOVERNANCE_CORE;

      await openContractCall({
        network: getNetwork(),
        contractAddress,
        contractName,
        functionName: 'create-proposal',
        functionArgs: [
          Cl.stringUtf8(title.trim()),
          Cl.stringUtf8(description.trim()),
        ],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        onFinish: (data) => {
          setProposalState({ isLoading: false, error: null, txId: data.txId });
        },
        onCancel: () => {
          setProposalState({ isLoading: false, error: 'Transaction cancelled', txId: null });
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create proposal';
      setProposalState({ isLoading: false, error: message, txId: null });
    }
  }, [isConnected, address]);

  /**
   * Delegate voting power to another address
   */
  const delegateVotingPower = useCallback(async (delegate: string) => {
    if (!isConnected || !address) {
      setDelegationState({ isLoading: false, error: 'Wallet not connected', txId: null });
      return;
    }

    if (!delegate.startsWith('SP') && !delegate.startsWith('ST')) {
      setDelegationState({ isLoading: false, error: 'Invalid delegate address', txId: null });
      return;
    }

    setDelegationState({ isLoading: true, error: null, txId: null });

    try {
      const { address: contractAddress, name: contractName } = GOVERNANCE_CONFIG.GOVERNANCE_TOKEN;

      await openContractCall({
        network: getNetwork(),
        contractAddress,
        contractName,
        functionName: 'delegate-voting-power',
        functionArgs: [Cl.principal(delegate)],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        onFinish: (data) => {
          setDelegationState({ isLoading: false, error: null, txId: data.txId });
        },
        onCancel: () => {
          setDelegationState({ isLoading: false, error: 'Transaction cancelled', txId: null });
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delegate';
      setDelegationState({ isLoading: false, error: message, txId: null });
    }
  }, [isConnected, address]);

  /**
   * Revoke voting power delegation
   */
  const revokeDelegation = useCallback(async () => {
    if (!isConnected || !address) {
      setDelegationState({ isLoading: false, error: 'Wallet not connected', txId: null });
      return;
    }

    setDelegationState({ isLoading: true, error: null, txId: null });

    try {
      const { address: contractAddress, name: contractName } = GOVERNANCE_CONFIG.GOVERNANCE_TOKEN;

      await openContractCall({
        network: getNetwork(),
        contractAddress,
        contractName,
        functionName: 'revoke-delegation',
        functionArgs: [],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        onFinish: (data) => {
          setDelegationState({ isLoading: false, error: null, txId: data.txId });
        },
        onCancel: () => {
          setDelegationState({ isLoading: false, error: 'Transaction cancelled', txId: null });
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to revoke delegation';
      setDelegationState({ isLoading: false, error: message, txId: null });
    }
  }, [isConnected, address]);

  /**
   * Queue a passed proposal for execution
   */
  const queueProposal = useCallback(async (proposalId: number) => {
    if (!isConnected || !address) {
      setExecutionState({ isLoading: false, error: 'Wallet not connected', txId: null });
      return;
    }

    setExecutionState({ isLoading: true, error: null, txId: null });

    try {
      const { address: contractAddress, name: contractName } = GOVERNANCE_CONFIG.GOVERNANCE_CORE;

      await openContractCall({
        network: getNetwork(),
        contractAddress,
        contractName,
        functionName: 'queue-proposal',
        functionArgs: [Cl.uint(proposalId)],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        onFinish: (data) => {
          setExecutionState({ isLoading: false, error: null, txId: data.txId });
        },
        onCancel: () => {
          setExecutionState({ isLoading: false, error: 'Transaction cancelled', txId: null });
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to queue proposal';
      setExecutionState({ isLoading: false, error: message, txId: null });
    }
  }, [isConnected, address]);

  /**
   * Execute a queued proposal
   */
  const executeProposal = useCallback(async (proposalId: number) => {
    if (!isConnected || !address) {
      setExecutionState({ isLoading: false, error: 'Wallet not connected', txId: null });
      return;
    }

    const rateLimitResult = await checkRateLimit('resolve-market');
    if (!rateLimitResult.allowed) {
      setExecutionState({ isLoading: false, error: rateLimitResult.reason || 'Rate limit exceeded', txId: null });
      return;
    }

    setExecutionState({ isLoading: true, error: null, txId: null });

    try {
      const { address: contractAddress, name: contractName } = GOVERNANCE_CONFIG.GOVERNANCE_CORE;

      await openContractCall({
        network: getNetwork(),
        contractAddress,
        contractName,
        functionName: 'execute-proposal',
        functionArgs: [Cl.uint(proposalId)],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        onFinish: (data) => {
          setExecutionState({ isLoading: false, error: null, txId: data.txId });
        },
        onCancel: () => {
          setExecutionState({ isLoading: false, error: 'Transaction cancelled', txId: null });
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to execute proposal';
      setExecutionState({ isLoading: false, error: message, txId: null });
    }
  }, [isConnected, address, checkRateLimit]);

  /**
   * Cancel a proposal (proposer or admin only)
   */
  const cancelProposal = useCallback(async (proposalId: number) => {
    if (!isConnected || !address) {
      setExecutionState({ isLoading: false, error: 'Wallet not connected', txId: null });
      return;
    }

    setExecutionState({ isLoading: true, error: null, txId: null });

    try {
      const { address: contractAddress, name: contractName } = GOVERNANCE_CONFIG.GOVERNANCE_CORE;

      await openContractCall({
        network: getNetwork(),
        contractAddress,
        contractName,
        functionName: 'cancel-proposal',
        functionArgs: [Cl.uint(proposalId)],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        onFinish: (data) => {
          setExecutionState({ isLoading: false, error: null, txId: data.txId });
        },
        onCancel: () => {
          setExecutionState({ isLoading: false, error: 'Transaction cancelled', txId: null });
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel proposal';
      setExecutionState({ isLoading: false, error: message, txId: null });
    }
  }, [isConnected, address]);

  /**
   * Reset all action states
   */
  const resetStates = useCallback(() => {
    setVoteState(initialState);
    setProposalState(initialState);
    setDelegationState(initialState);
    setExecutionState(initialState);
  }, []);

  return {
    castVote,
    createProposal,
    delegateVotingPower,
    revokeDelegation,
    queueProposal,
    executeProposal,
    cancelProposal,
    voteState,
    proposalState,
    delegationState,
    executionState,
    resetStates,
  };
}
