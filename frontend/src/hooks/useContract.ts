// Contract interaction hook for 0xCast MVP
import { useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import {
  uintCV,
  stringAsciiCV,
  principalCV,
  PostConditionMode,
  Pc,
  someCV,
  noneCV,
  bufferCV,
} from '@stacks/transactions';
import { 
  CONTRACT_NAMES,
  getContractPrincipal as getContract,
} from '../config/contracts';
import { getNodeUrl } from '../config/network';
import { useWallet } from '../components/WalletProvider';

// Type for optional Clarity values (someCV or noneCV)
export type OptionalClarityValue = ReturnType<typeof someCV> | ReturnType<typeof noneCV>;

// Get OXC token contract configuration
const getTokenContract = () => {
  return getContract(CONTRACT_NAMES.OXCAST);
};

// Maximum memo length per SIP-010 standard
export const MAX_MEMO_LENGTH = 34;

/**
 * Validate memo string length before transfer
 * @param memo - Memo string to validate
 * @returns true if memo is valid, false otherwise
 */
export const isValidMemo = (memo?: string): boolean => {
  if (!memo) return true;
  return Buffer.from(memo).length <= MAX_MEMO_LENGTH;
};

/**
 * Get remaining bytes available for memo
 * @param memo - Current memo string
 * @returns Number of bytes remaining (can be negative if over limit)
 */
export const getMemoRemainingBytes = (memo: string): number => {
  return MAX_MEMO_LENGTH - Buffer.from(memo).length;
};

/**
 * Build optional memo Clarity value for token transfers
 * @param memo - Optional memo string
 * @returns someCV(bufferCV(...)) if memo provided, noneCV() otherwise
 * @throws Error if memo exceeds MAX_MEMO_LENGTH bytes
 */
export const buildMemoCV = (memo?: string) => {
  if (!memo) return noneCV();
  const buffer = Buffer.from(memo);
  if (buffer.length > MAX_MEMO_LENGTH) {
    throw new Error(`Memo exceeds maximum length of ${MAX_MEMO_LENGTH} bytes`);
  }
  return someCV(bufferCV(buffer));
};

export function useContract() {
  const { address, isConnected } = useWallet();

  // Create a new prediction market
  const createMarket = useCallback(
    async (question: string, durationBlocks: number) => {
      if (!isConnected || !address) throw new Error('Wallet not connected');

      const contract = getTokenContract();
      
      await openContractCall({
        contractAddress: contract.address,
        contractName: contract.name,
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

      const contract = getTokenContract();
      const outcomeValue = outcome === 'yes' ? 1 : 2;

      // Post condition: user sends STX
      const postConditions = [
        Pc.principal(address).willSendEq(amountMicroStx).ustx(),
      ];

      await openContractCall({
        contractAddress: contract.address,
        contractName: contract.name,
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

      const contract = getTokenContract();

      await openContractCall({
        contractAddress: contract.address,
        contractName: contract.name,
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

      const contract = getTokenContract();

      const postConditions = [
        Pc.principal(address).willSendEq(amountMicroOxc).ft(contract.identifier as `${string}.${string}`, 'oxc-token'),
      ];

      await openContractCall({
        contractAddress: contract.address,
        contractName: contract.name,
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

      const contract = getTokenContract();

      await openContractCall({
        contractAddress: contract.address,
        contractName: contract.name,
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

  // Transfer OXC tokens to another address
  // memo: optional message to include with transfer (wrapped in someCV/noneCV)
  // Memo is limited to 34 bytes per SIP-010 standard
  const transferTokens = useCallback(
    async (recipient: string, amountMicroOxc: bigint, memo?: string) => {
      if (!isConnected || !address) throw new Error('Wallet not connected');
      if (!recipient) throw new Error('Recipient address is required');
      if (amountMicroOxc <= 0n) throw new Error('Amount must be greater than zero');

      const contract = getTokenContract();

      const postConditions = [
        Pc.principal(address).willSendEq(amountMicroOxc).ft(contract.identifier as `${string}.${string}`, 'oxc-token'),
      ];

      // Construct function arguments with proper Clarity types
      const functionArgs = [
        uintCV(Number(amountMicroOxc)),
        principalCV(address),
        principalCV(recipient),
        buildMemoCV(memo),
      ];

      await openContractCall({
        contractAddress: contract.address,
        contractName: contract.name,
        functionName: 'transfer',
        functionArgs: functionArgs,
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
  const contract = getTokenContract();
  const apiUrl = getNodeUrl();

  const url = `${apiUrl}/v2/contracts/call-read/${contract.address}/${contract.name}/get-market`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: contract.address,
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
  const contract = getTokenContract();
  const apiUrl = getNodeUrl();

  const url = `${apiUrl}/v2/contracts/call-read/${contract.address}/${contract.name}/get-market-count`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: contract.address,
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
  const contract = getTokenContract();
  const apiUrl = getNodeUrl();

  const url = `${apiUrl}/v2/contracts/call-read/${contract.address}/${contract.name}/get-stake`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: contract.address,
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
  const contract = getTokenContract();
  const apiUrl = getNodeUrl();

  const url = `${apiUrl}/v2/contracts/call-read/${contract.address}/${contract.name}/get-total-staked`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: contract.address,
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
