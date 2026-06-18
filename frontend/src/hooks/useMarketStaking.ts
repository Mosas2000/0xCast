/**
 * Market staking hook
 *
 * Calls the `place-yes-stake` or `place-no-stake` function on the market-core contract
 * via the user's wallet (Stacks Connect).
 */
import { useState, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import {
  uintCV,
  PostConditionMode,
  Pc,
} from '@stacks/transactions';
import { useWallet } from '@/components/WalletProvider';
import { useNetwork } from '@/contexts/NetworkContext';
import { MARKET_CONTRACT } from '@/config/contracts';

export interface PlaceStakeInput {
  marketId: number;
  outcome: 'yes' | 'no';
  amountStx: number;
}

export function useMarketStaking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const { isConnected, address } = useWallet();
  const { stacksNetwork } = useNetwork();

  const placeStake = useCallback(
    async (input: PlaceStakeInput) => {
      if (!isConnected || !address) {
        setError('Please connect your wallet first');
        return null;
      }

      if (input.amountStx <= 0) {
        setError('Amount must be greater than 0 STX');
        return null;
      }

      setIsLoading(true);
      setError(null);
      setTxId(null);

      try {
        const microStxAmount = Math.floor(input.amountStx * 1000000);
        const functionName = input.outcome === 'yes' ? 'place-yes-stake' : 'place-no-stake';

        // Construct STX post-condition to guarantee only the specified amount is transferred
        const postCondition = Pc.principal(address)
          .willSendEq(BigInt(microStxAmount))
          .ustx();

        console.log(
          `[PlaceStake] marketId=${input.marketId}, outcome=${input.outcome}, amountStx=${input.amountStx} (${microStxAmount} micro-STX), functionName=${functionName}`
        );

        openContractCall({
          contractAddress: MARKET_CONTRACT.address,
          contractName: MARKET_CONTRACT.name,
          functionName: functionName,
          functionArgs: [uintCV(input.marketId), uintCV(microStxAmount)],
          postConditionMode: PostConditionMode.Deny,
          postConditions: [postCondition],
          network: stacksNetwork,
          onFinish: (data) => {
            setTxId(data.txId);
            setIsLoading(false);
          },
          onCancel: () => {
            setError('Transaction was cancelled');
            setIsLoading(false);
          },
        });
      } catch (err) {
        console.error('Error placing stake:', err);
        const raw = err instanceof Error ? err.message : String(err);
        const rawLower = raw.toLowerCase();
        
        let errorMessage: string;
        if (rawLower.includes('failed to fetch') || rawLower.includes('networkerror')) {
          errorMessage = 'Unable to reach the Stacks API. Please check your connection and try again.';
        } else if (rawLower.includes('rate-limit') || rawLower.includes('429') || rawLower.includes('rate')) {
          errorMessage = 'The Stacks API is rate-limiting requests. Please wait a moment and try again.';
        } else {
          errorMessage = raw;
        }

        setError(errorMessage);
        setIsLoading(false);
        return null;
      }
    },
    [isConnected, address, stacksNetwork]
  );

  const reset = useCallback(() => {
    setError(null);
    setTxId(null);
    setIsLoading(false);
  }, []);

  return {
    placeStake,
    isLoading,
    error,
    txId,
    reset,
  };
}
