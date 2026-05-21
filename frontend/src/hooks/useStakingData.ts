// Hook for fetching real staking data from the oxcast contract
import { useState, useEffect, useCallback } from 'react';
import { cvToJSON, fetchCallReadOnlyFunction, principalCV } from '@stacks/transactions';
import { CONTRACT_NAMES, getContractAddress } from '@/config/contracts';
import { useNetwork } from '@/contexts/NetworkContext';

export interface StakingData {
  totalStaked: bigint;
  userStaked: bigint;
  userLockedUntil: number;
  userBalance: bigint;
  isLocked: boolean;
  currentBlock: number;
}

export function useStakingData(userAddress: string | null) {
  const { network, networkConfig, stacksNetwork } = useNetwork();
  const [stakingData, setStakingData] = useState<StakingData>({
    totalStaked: 0n,
    userStaked: 0n,
    userLockedUntil: 0,
    userBalance: 0n,
    isLocked: false,
    currentBlock: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStakingData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const contractAddress = getContractAddress(CONTRACT_NAMES.OXCAST, network);
      
      // Fetch total staked
      const totalStakedResult = await fetchCallReadOnlyFunction({
        network: stacksNetwork,
        contractAddress,
        contractName: CONTRACT_NAMES.OXCAST,
        functionName: 'get-total-staked',
        functionArgs: [],
        senderAddress: contractAddress,
      });

      const totalStakedJson = cvToJSON(totalStakedResult);
      const totalStaked = BigInt(totalStakedJson.value?.value || '0');

      let userStaked = 0n;
      let userLockedUntil = 0;
      let userBalance = 0n;

      // Fetch user-specific data if address provided
      if (userAddress) {
        // Fetch user stake
        const userStakeResult = await fetchCallReadOnlyFunction({
          network: stacksNetwork,
          contractAddress,
          contractName: CONTRACT_NAMES.OXCAST,
          functionName: 'get-stake',
          functionArgs: [principalCV(userAddress)],
          senderAddress: contractAddress,
        });

        const userStakeJson = cvToJSON(userStakeResult);
        if (userStakeJson.value) {
          userStaked = BigInt(userStakeJson.value.amount?.value || '0');
          userLockedUntil = Number(userStakeJson.value['locked-until']?.value || '0');
        }

        // Fetch user OXC balance
        const balanceResult = await fetchCallReadOnlyFunction({
          network: stacksNetwork,
          contractAddress,
          contractName: CONTRACT_NAMES.OXCAST,
          functionName: 'get-balance',
          functionArgs: [principalCV(userAddress)],
          senderAddress: contractAddress,
        });

        const balanceJson = cvToJSON(balanceResult);
        userBalance = BigInt(balanceJson.value?.value || '0');
      }

      // Fetch current block height from API
      const apiUrl = `${networkConfig.apiUrl}/v2/info`;
      
      let currentBlock = 0;
      try {
        const infoResponse = await fetch(apiUrl);
        const infoData = await infoResponse.json();
        currentBlock = infoData.stacks_tip_height || 0;
      } catch (e) {
        console.error('Failed to fetch block height:', e);
      }

      const isLocked = currentBlock < userLockedUntil;

      setStakingData({
        totalStaked,
        userStaked,
        userLockedUntil,
        userBalance,
        isLocked,
        currentBlock,
      });
    } catch (err) {
      console.error('Error fetching staking data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch staking data');
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, network, networkConfig.apiUrl, stacksNetwork]);

  useEffect(() => {
    fetchStakingData();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchStakingData, 60000);
    return () => clearInterval(interval);
  }, [fetchStakingData]);

  return { stakingData, isLoading, error, refetch: fetchStakingData };
}
