/**
 * useOracleActions Hook
 * 
 * Custom hook for oracle write operations (transactions).
 * Handles oracle management, resolution submission, and dispute actions.
 * 
 * Action Categories:
 * 
 * Admin Actions (owner only):
 * - registerOracle: Add a new trusted oracle
 * - removeOracle: Remove an oracle from the registry
 * - configureOracleSource: Set up price feed for a market
 * - setDisputePeriod/setVotingPeriod: Adjust timing settings
 * - adminResolveDispute: Emergency dispute resolution
 * 
 * Oracle Actions:
 * - submitPriceFeed: Submit price data for a market
 * - submitResolution: Resolve a market with YES/NO outcome
 * - autoResolveWithOracle: Auto-resolve based on price feed
 * - finalizeResolution: Finalize after dispute period ends
 * 
 * User Actions:
 * - submitDispute: Challenge a resolution with STX stake
 * - voteOnDispute: Vote YES/NO on an active dispute
 * - resolveDispute: Trigger dispute resolution after voting
 * 
 * Usage:
 * ```tsx
 * const { submitDispute, voteOnDispute, state } = useOracleActions();
 * 
 * // Submit a dispute
 * await submitDispute(1, 'Incorrect price data', 5000000n);
 * 
 * // Vote on a dispute
 * await voteOnDispute(1, 1); // 1 = YES, 2 = NO
 * ```
 */

import { useCallback, useState } from 'react';
import { openContractCall } from '@stacks/connect';
import {
  uintCV,
  stringAsciiCV,
  stringUtf8CV,
  principalCV,
  PostConditionMode,
  Pc,
} from '@stacks/transactions';
import { getContractPrincipal, CONTRACT_NAMES } from '../config/contracts';
import { useWallet } from '../components/WalletProvider';
import { safeBigIntToNumber } from './useContract';

/**
 * Get oracle contract configuration
 */
function getOracleContract() {
  return getContractPrincipal(CONTRACT_NAMES.ORACLE_INTEGRATION);
}

interface TransactionState {
  isSubmitting: boolean;
  error: string | null;
  txId: string | null;
}

const initialState: TransactionState = {
  isSubmitting: false,
  error: null,
  txId: null,
};

export interface UseOracleActionsReturn {
  // Transaction state
  state: TransactionState;
  resetState: () => void;
  
  // Admin actions (owner only)
  registerOracle: (oracleAddress: string) => Promise<void>;
  removeOracle: (oracleAddress: string) => Promise<void>;
  configureOracleSource: (
    marketId: number,
    oracleType: string,
    dataFeed: string,
    thresholdPrice: number
  ) => Promise<void>;
  setDisputePeriod: (blocks: number) => Promise<void>;
  setVotingPeriod: (blocks: number) => Promise<void>;
  setMinDisputeStake: (amount: bigint) => Promise<void>;
  setDisputeQuorum: (quorum: number) => Promise<void>;
  adminResolveDispute: (marketId: number, finalResult: 1 | 2) => Promise<void>;
  withdrawSlashed: () => Promise<void>;
  
  // Oracle actions
  submitPriceFeed: (marketId: number, price: number) => Promise<void>;
  submitResolution: (marketId: number, result: 1 | 2) => Promise<void>;
  autoResolveWithOracle: (marketId: number) => Promise<void>;
  finalizeResolution: (marketId: number) => Promise<void>;
  
  // User actions
  submitDispute: (marketId: number, reason: string, stake: bigint) => Promise<void>;
  voteOnDispute: (marketId: number, vote: 1 | 2) => Promise<void>;
  resolveDispute: (marketId: number) => Promise<void>;
}

export function useOracleActions(): UseOracleActionsReturn {
  const { address, isConnected } = useWallet();
  const [state, setState] = useState<TransactionState>(initialState);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  // Helper to execute contract calls
  const executeCall = useCallback(
    async (
      functionName: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      functionArgs: any[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      postConditions: any[] = [],
      postConditionMode: PostConditionMode = PostConditionMode.Deny
    ) => {
      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }

      setState(prev => ({ ...prev, isSubmitting: true, error: null }));

      const contract = getOracleContract();

      try {
        await openContractCall({
          contractAddress: contract.address,
          contractName: contract.name,
          functionName,
          functionArgs,
          postConditionMode,
          postConditions,
          onFinish: (data) => {
            console.log(`${functionName} completed:`, data);
            setState(prev => ({
              ...prev,
              isSubmitting: false,
              txId: data.txId,
            }));
          },
          onCancel: () => {
            setState(prev => ({
              ...prev,
              isSubmitting: false,
              error: 'Transaction cancelled',
            }));
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          error: errorMessage,
        }));
        throw error;
      }
    },
    [isConnected, address]
  );

  // ==================== Admin Actions ====================

  const registerOracle = useCallback(
    async (oracleAddress: string) => {
      await executeCall('register-oracle', [principalCV(oracleAddress)]);
    },
    [executeCall]
  );

  const removeOracle = useCallback(
    async (oracleAddress: string) => {
      await executeCall('remove-oracle', [principalCV(oracleAddress)]);
    },
    [executeCall]
  );

  const configureOracleSource = useCallback(
    async (
      marketId: number,
      oracleType: string,
      dataFeed: string,
      thresholdPrice: number
    ) => {
      await executeCall('configure-oracle-source', [
        uintCV(marketId),
        stringAsciiCV(oracleType),
        stringAsciiCV(dataFeed),
        uintCV(thresholdPrice),
      ]);
    },
    [executeCall]
  );

  const setDisputePeriod = useCallback(
    async (blocks: number) => {
      await executeCall('set-dispute-period', [uintCV(blocks)]);
    },
    [executeCall]
  );

  const setVotingPeriod = useCallback(
    async (blocks: number) => {
      await executeCall('set-voting-period', [uintCV(blocks)]);
    },
    [executeCall]
  );

  const setMinDisputeStake = useCallback(
    async (amount: bigint) => {
      await executeCall('set-min-dispute-stake', [
        uintCV(safeBigIntToNumber(amount, 'stake')),
      ]);
    },
    [executeCall]
  );

  const setDisputeQuorum = useCallback(
    async (quorum: number) => {
      await executeCall('set-dispute-quorum', [uintCV(quorum)]);
    },
    [executeCall]
  );

  const adminResolveDispute = useCallback(
    async (marketId: number, finalResult: 1 | 2) => {
      await executeCall(
        'admin-resolve-dispute',
        [uintCV(marketId), uintCV(finalResult)],
        [],
        PostConditionMode.Allow
      );
    },
    [executeCall]
  );

  const withdrawSlashed = useCallback(async () => {
    await executeCall('withdraw-slashed', [], [], PostConditionMode.Allow);
  }, [executeCall]);

  // ==================== Oracle Actions ====================

  const submitPriceFeed = useCallback(
    async (marketId: number, price: number) => {
      await executeCall('submit-price-feed', [
        uintCV(marketId),
        uintCV(price),
      ]);
    },
    [executeCall]
  );

  const submitResolution = useCallback(
    async (marketId: number, result: 1 | 2) => {
      await executeCall(
        'submit-resolution',
        [uintCV(marketId), uintCV(result)],
        [],
        PostConditionMode.Allow
      );
    },
    [executeCall]
  );

  const autoResolveWithOracle = useCallback(
    async (marketId: number) => {
      await executeCall(
        'auto-resolve-with-oracle',
        [uintCV(marketId)],
        [],
        PostConditionMode.Allow
      );
    },
    [executeCall]
  );

  const finalizeResolution = useCallback(
    async (marketId: number) => {
      await executeCall(
        'finalize-resolution',
        [uintCV(marketId)],
        [],
        PostConditionMode.Allow
      );
    },
    [executeCall]
  );

  // ==================== User Actions ====================

  const submitDispute = useCallback(
    async (marketId: number, reason: string, stake: bigint) => {
      if (!address) throw new Error('Wallet not connected');

      const postConditions = [
        Pc.principal(address).willSendEq(stake).ustx(),
      ];

      await executeCall(
        'submit-dispute',
        [
          uintCV(marketId),
          stringUtf8CV(reason),
          uintCV(safeBigIntToNumber(stake, 'stake')),
        ],
        postConditions as unknown as ReturnType<typeof Pc.principal>[]
      );
    },
    [executeCall, address]
  );

  const voteOnDispute = useCallback(
    async (marketId: number, vote: 1 | 2) => {
      await executeCall('vote-on-dispute', [
        uintCV(marketId),
        uintCV(vote),
      ]);
    },
    [executeCall]
  );

  const resolveDispute = useCallback(
    async (marketId: number) => {
      await executeCall(
        'resolve-dispute',
        [uintCV(marketId)],
        [],
        PostConditionMode.Allow
      );
    },
    [executeCall]
  );

  return {
    state,
    resetState,
    // Admin actions
    registerOracle,
    removeOracle,
    configureOracleSource,
    setDisputePeriod,
    setVotingPeriod,
    setMinDisputeStake,
    setDisputeQuorum,
    adminResolveDispute,
    withdrawSlashed,
    // Oracle actions
    submitPriceFeed,
    submitResolution,
    autoResolveWithOracle,
    finalizeResolution,
    // User actions
    submitDispute,
    voteOnDispute,
    resolveDispute,
  };
}
