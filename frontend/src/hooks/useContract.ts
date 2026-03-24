// Contract interaction hook for 0xCast MVP
import { useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import {
  uintCV,
  stringAsciiCV,
  principalCV,
  PostConditionMode,
  Pc,
} from '@stacks/transactions';
import { OXC_TOKEN, CURRENT_NETWORK } from '../config/token';
import { useWallet } from '../components/WalletProvider';

// Get contract principal based on network
const getContractPrincipal = () => {
  const contracts = OXC_TOKEN.contracts[CURRENT_NETWORK];
  return contracts.oxcast;
};

// Contract name
const CONTRACT_NAME = 'oxcast';

export function useContract() {
  const { address, isConnected } = useWallet();

  // Create a new prediction market
  const createMarket = useCallback(
    async (question: string, durationBlocks: number) => {
      if (!isConnected || !address) throw new Error('Wallet not connected');

      const contractAddress = getContractPrincipal().split('.')[0];
      
      await openContractCall({
        contractAddress,
        contractName: CONTRACT_NAME,
        functionName: 'create-market',
        functionArgs: [
          stringAsciiCV(question),
          uintCV(durationBlocks),
        ],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        onFinish: (data) => {
          console.log('Market created:', data);
        },
        onCancel: () => {
          console.log('Transaction cancelled');
        },
      });
    },
    [isConnected, address]
  );

  // Place a prediction (YES or NO)
  const predict = useCallback(
    async (marketId: number, outcome: 'yes' | 'no', amountMicroStx: bigint) => {
      if (!isConnected || !address) throw new Error('Wallet not connected');

      const contractAddress = getContractPrincipal().split('.')[0];
      const outcomeValue = outcome === 'yes' ? 1 : 2;

      // Post condition: user sends STX
      const postConditions = [
        Pc.principal(address).willSendEq(amountMicroStx).ustx(),
      ];

      await openContractCall({
        contractAddress,
        contractName: CONTRACT_NAME,
        functionName: 'predict',
        functionArgs: [
          uintCV(marketId),
          uintCV(outcomeValue),
          uintCV(Number(amountMicroStx)),
        ],
        postConditionMode: PostConditionMode.Deny,
        postConditions,
        onFinish: (data) => {
          console.log('Prediction placed:', data);
        },
        onCancel: () => {
          console.log('Transaction cancelled');
        },
      });
    },
    [isConnected, address]
  );

  // Claim winnings from a resolved market
  const claimWinnings = useCallback(
    async (marketId: number) => {
      if (!isConnected || !address) throw new Error('Wallet not connected');

      const contractAddress = getContractPrincipal().split('.')[0];

      await openContractCall({
        contractAddress,
        contractName: CONTRACT_NAME,
        functionName: 'claim-winnings',
        functionArgs: [uintCV(marketId)],
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
        onFinish: (data) => {
          console.log('Winnings claimed:', data);
        },
        onCancel: () => {
          console.log('Transaction cancelled');
        },
      });
    },
    [isConnected, address]
  );

  // Stake OXC tokens
  const stakeTokens = useCallback(
    async (amountMicroOxc: bigint) => {
      if (!isConnected || !address) throw new Error('Wallet not connected');

      const contractPrincipal = getContractPrincipal();
      const contractAddress = contractPrincipal.split('.')[0];

      const postConditions = [
        Pc.principal(address).willSendEq(amountMicroOxc).ft(contractPrincipal, 'oxc-token'),
      ];

      await openContractCall({
        contractAddress,
        contractName: CONTRACT_NAME,
        functionName: 'stake',
        functionArgs: [uintCV(Number(amountMicroOxc))],
        postConditionMode: PostConditionMode.Deny,
        postConditions,
        onFinish: (data) => {
          console.log('Tokens staked:', data);
        },
        onCancel: () => {
          console.log('Transaction cancelled');
        },
      });
    },
    [isConnected, address]
  );

  // Unstake OXC tokens
  const unstakeTokens = useCallback(
    async (amountMicroOxc: bigint) => {
      if (!isConnected || !address) throw new Error('Wallet not connected');

      const contractAddress = getContractPrincipal().split('.')[0];

      await openContractCall({
        contractAddress,
        contractName: CONTRACT_NAME,
        functionName: 'unstake',
        functionArgs: [uintCV(Number(amountMicroOxc))],
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
        onFinish: (data) => {
          console.log('Tokens unstaked:', data);
        },
        onCancel: () => {
          console.log('Transaction cancelled');
        },
      });
    },
    [isConnected, address]
  );

  // Transfer OXC tokens
  const transferTokens = useCallback(
    async (recipient: string, amountMicroOxc: bigint, memo?: string) => {
      if (!isConnected || !address) throw new Error('Wallet not connected');

      const contractPrincipal = getContractPrincipal();
      const contractAddress = contractPrincipal.split('.')[0];

      const postConditions = [
        Pc.principal(address).willSendEq(amountMicroOxc).ft(contractPrincipal, 'oxc-token'),
      ];

      const functionArgs = [
        uintCV(Number(amountMicroOxc)),
        principalCV(address),
        principalCV(recipient),
        memo ? { type: 'some', value: Buffer.from(memo) } : { type: 'none' },
      ];

      await openContractCall({
        contractAddress,
        contractName: CONTRACT_NAME,
        functionName: 'transfer',
        functionArgs: functionArgs as any,
        postConditionMode: PostConditionMode.Deny,
        postConditions,
        onFinish: (data) => {
          console.log('Tokens transferred:', data);
        },
        onCancel: () => {
          console.log('Transaction cancelled');
        },
      });
    },
    [isConnected, address]
  );

  return {
    createMarket,
    predict,
    claimWinnings,
    stakeTokens,
    unstakeTokens,
    transferTokens,
    isConnected,
    address,
  };
}

// Read-only contract calls (no wallet needed)
export async function getMarket(marketId: number) {
  const contractAddress = getContractPrincipal();
  if (!contractAddress) return null;

  const [principal, name] = contractAddress.split('.');
  const url = `https://stacks-node-api.${CURRENT_NETWORK}.stacks.co/v2/contracts/call-read/${principal}/${name}/get-market`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: principal,
        arguments: [`0x0100000000000000000000000000000000${marketId.toString(16).padStart(2, '0')}`],
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching market:', error);
    return null;
  }
}

export async function getMarketCount() {
  const contractAddress = getContractPrincipal();
  if (!contractAddress) return 0;

  const [principal, name] = contractAddress.split('.');
  const url = `https://stacks-node-api.${CURRENT_NETWORK}.stacks.co/v2/contracts/call-read/${principal}/${name}/get-market-count`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: principal,
        arguments: [],
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching market count:', error);
    return 0;
  }
}

export async function getStake(stakerAddress: string) {
  const contractAddress = getContractPrincipal();
  if (!contractAddress) return null;

  const [principal, name] = contractAddress.split('.');
  const url = `https://stacks-node-api.${CURRENT_NETWORK}.stacks.co/v2/contracts/call-read/${principal}/${name}/get-stake`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: principal,
        arguments: [`0x0516${stakerAddress}`], // principal encoding
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching stake:', error);
    return null;
  }
}

export async function getTotalStaked() {
  const contractAddress = getContractPrincipal();
  if (!contractAddress) return 0n;

  const [principal, name] = contractAddress.split('.');
  const url = `https://stacks-node-api.${CURRENT_NETWORK}.stacks.co/v2/contracts/call-read/${principal}/${name}/get-total-staked`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: principal,
        arguments: [],
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching total staked:', error);
    return 0n;
  }
}
