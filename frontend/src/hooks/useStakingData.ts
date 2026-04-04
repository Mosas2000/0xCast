// Hook for fetching real staking data from the oxcast contract
import { useState, useEffect, useCallback } from 'react';
import { cvToJSON, fetchCallReadOnlyFunction, principalCV } from '@stacks/transactions';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import { TOKEN_CONTRACT, CURRENT_NETWORK } from '../config/contracts';

// Get the appropriate network
const getNetwork = () => CURRENT_NETWORK === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

export interface StakingData {
  totalStaked: bigint;
  userStaked: bigint;
  userLockedUntil: number;
  userBalance: bigint;
  isLocked: boolean;
  currentBlock: number;
}

export function useStakingData(userAddress: string | null) {
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
      const network = getNetwork();
      
      // Fetch total staked
      const totalStakedResult = await fetchCallReadOnlyFunction({
        network,
        contractAddress: TOKEN_CONTRACT.address,
        contractName: TOKEN_CONTRACT.name,
        functionName: 'get-total-staked',
        functionArgs: [],
        senderAddress: TOKEN_CONTRACT.address,
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
          network,
          contractAddress: TOKEN_CONTRACT.address,
          contractName: TOKEN_CONTRACT.name,
          functionName: 'get-stake',
          functionArgs: [principalCV(userAddress)],
          senderAddress: TOKEN_CONTRACT.address,
        });

        const userStakeJson = cvToJSON(userStakeResult);
        if (userStakeJson.value) {
          userStaked = BigInt(userStakeJson.value.amount?.value || '0');
          userLockedUntil = Number(userStakeJson.value['locked-until']?.value || '0');
        }

        // Fetch user OXC balance
        const balanceResult = await fetchCallReadOnlyFunction({
          network,
          contractAddress: TOKEN_CONTRACT.address,
          contractName: TOKEN_CONTRACT.name,
          functionName: 'get-balance',
          functionArgs: [principalCV(userAddress)],
          senderAddress: TOKEN_CONTRACT.address,
        });

        const balanceJson = cvToJSON(balanceResult);
        userBalance = BigInt(balanceJson.value?.value || '0');
      }

      // Fetch current block height from API
      const apiUrl = CURRENT_NETWORK === 'mainnet' 
        ? 'https://api.mainnet.hiro.so/v2/info'
        : 'https://api.testnet.hiro.so/v2/info';
      
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
  }, [userAddress]);

  useEffect(() => {
    fetchStakingData();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchStakingData, 60000);
    return () => clearInterval(interval);
  }, [fetchStakingData]);

  return { stakingData, isLoading, error, refetch: fetchStakingData };
}
