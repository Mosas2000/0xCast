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
      const tokenContractAddress = getContractAddress(CONTRACT_NAMES.GOVERNANCE_TOKEN, network);
      
      let totalStaked = 0n;
      try {
        // Fetch total staked
        const totalStakedResult = await fetchCallReadOnlyFunction({
          network: stacksNetwork,
          contractAddress: tokenContractAddress,
          contractName: CONTRACT_NAMES.GOVERNANCE_TOKEN,
          functionName: 'get-total-staked',
          functionArgs: [],
          senderAddress: tokenContractAddress,
        });

        const totalStakedJson = cvToJSON(totalStakedResult);
        totalStaked = BigInt(totalStakedJson.value?.value || '0');
      } catch (e) {
        console.warn('Staking contract get-total-staked failed or not deployed, defaulting to 0');
      }

      let userStaked = 0n;
      let userLockedUntil = 0;
      let userBalance = 0n;

      // Fetch user-specific data if address provided
      if (userAddress) {
        try {
          // Fetch user stake
          const userStakeResult = await fetchCallReadOnlyFunction({
            network: stacksNetwork,
            contractAddress: tokenContractAddress,
            contractName: CONTRACT_NAMES.GOVERNANCE_TOKEN,
            functionName: 'get-stake',
            functionArgs: [principalCV(userAddress)],
            senderAddress: tokenContractAddress,
          });

          const userStakeJson = cvToJSON(userStakeResult);
          if (userStakeJson.value) {
            userStaked = BigInt(userStakeJson.value.amount?.value || '0');
            userLockedUntil = Number(userStakeJson.value['locked-until']?.value || '0');
          }
        } catch (e) {
          console.warn('Staking contract get-stake failed or not deployed, defaulting to 0');
        }

        try {
          // Fetch user governance token balance
          const balanceResult = await fetchCallReadOnlyFunction({
            network: stacksNetwork,
            contractAddress: tokenContractAddress,
            contractName: CONTRACT_NAMES.GOVERNANCE_TOKEN,
            functionName: 'get-balance',
            functionArgs: [principalCV(userAddress)],
            senderAddress: tokenContractAddress,
          });

          const balanceJson = cvToJSON(balanceResult);
          userBalance = BigInt(balanceJson.value?.value || '0');
        } catch (e) {
          console.error('Failed to fetch governance token balance:', e);
        }
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
