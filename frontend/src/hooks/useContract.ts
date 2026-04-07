/**
 * Contract interaction hook for 0xCast MVP
 * 
 * This module provides hooks and utilities for interacting with Stacks smart contracts.
 * 
 * BigInt Handling:
 * - All token amounts are handled as BigInt to preserve precision
 * - Use safeBigIntToNumber() when converting to uintCV (validates against MAX_SAFE_INTEGER)
 * - Use parseToMicroAmount() to convert user input strings to BigInt
 * - Use formatMicroAmount() to display BigInt amounts to users
 * - Use validateTransactionAmount() to check amounts before transactions
 * 
 * Exports:
 * - MAX_SAFE_INTEGER: Maximum safe value for Number conversion
 * - MAX_SAFE_OXC_AMOUNT: Maximum safe OXC token amount (with 6 decimals)
 * - safeBigIntToNumber: Safe BigInt to Number conversion
 * - isSafeBigInt: Check if BigInt is within safe range
 * - formatMicroAmount: Format BigInt micro-amount for display
 * - parseToMicroAmount: Parse string to BigInt micro-amount
 * - validateTransactionAmount: Validate amount for transaction
 */
import { useCallback, useMemo } from 'react';
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
import { useNetwork } from '../contexts/NetworkContext';

// Type for optional Clarity values (someCV or noneCV)
export type OptionalClarityValue = ReturnType<typeof someCV> | ReturnType<typeof noneCV>;

// Maximum safe integer for JavaScript Number type
// Values larger than this will lose precision when converted to Number
export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

// For OXC tokens with 6 decimals, this is the maximum safe amount in tokens
// MAX_SAFE_INTEGER / 10^6 = ~9,007,199,254 tokens
export const MAX_SAFE_OXC_AMOUNT = Math.floor(MAX_SAFE_INTEGER / 1_000_000);

/**
 * Safely convert BigInt to number for uintCV, checking for precision loss
 * @param value - BigInt value to convert
 * @param paramName - Parameter name for error messages
 * @returns number value if safe, throws error if would lose precision
 * @throws Error if value exceeds MAX_SAFE_INTEGER
 */
export const safeBigIntToNumber = (value: bigint, paramName: string = 'value'): number => {
  if (value > BigInt(MAX_SAFE_INTEGER)) {
    throw new Error(
      `${paramName} (${value}) exceeds maximum safe integer (${MAX_SAFE_INTEGER}). ` +
      'This amount is too large for precise conversion.'
    );
  }
  if (value < 0n) {
    throw new Error(`${paramName} must be non-negative, got ${value}`);
  }
  return Number(value);
};

/**
 * Check if a BigInt value can be safely converted to Number
 * @param value - BigInt value to check
 * @returns true if value is within safe range
 */
export const isSafeBigInt = (value: bigint): boolean => {
  return value >= 0n && value <= BigInt(MAX_SAFE_INTEGER);
};

/**
 * Format a BigInt as a human-readable token amount
 * @param microAmount - Amount in micro-units (6 decimals)
 * @returns Formatted string with token amount
 */
export const formatMicroAmount = (microAmount: bigint): string => {
  const integerPart = microAmount / 1_000_000n;
  const fractionalPart = microAmount % 1_000_000n;
  const fractionalStr = fractionalPart.toString().padStart(6, '0').replace(/0+$/, '');
  return fractionalStr ? `${integerPart}.${fractionalStr}` : integerPart.toString();
};

/**
 * Parse a token amount string to micro-units BigInt
 * @param amount - Amount string (e.g., "100.5")
 * @returns BigInt micro-amount
 */
export const parseToMicroAmount = (amount: string): bigint => {
  const parts = amount.split('.');
  const integerPart = BigInt(parts[0] || '0');
  const fractionalStr = (parts[1] || '').padEnd(6, '0').slice(0, 6);
  const fractionalPart = BigInt(fractionalStr);
  return integerPart * 1_000_000n + fractionalPart;
};

/**
 * Validate that a token amount is within safe transaction limits
 * @param microAmount - Amount in micro-units
 * @returns Object with isValid boolean and optional error message
 */
export const validateTransactionAmount = (microAmount: bigint): { isValid: boolean; error?: string } => {
  if (microAmount <= 0n) {
    return { isValid: false, error: 'Amount must be greater than zero' };
  }
  if (!isSafeBigInt(microAmount)) {
    return { 
      isValid: false, 
      error: `Amount exceeds maximum safe limit of ${formatMicroAmount(BigInt(MAX_SAFE_INTEGER))} tokens` 
    };
  }
  return { isValid: true };
};

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
  const { network, stacksNetwork, contractAddress } = useNetwork();
  
  // Get token contract for current network
  const tokenContract = useMemo(() => {
    return getContract(CONTRACT_NAMES.OXCAST);
  }, [network]);

  // Create a new prediction market
  const createMarket = useCallback(
    async (question: string, durationBlocks: number) => {
      if (!isConnected || !address) throw new Error('Wallet not connected');
      
      await openContractCall({
        network: stacksNetwork,
        contractAddress: tokenContract.address,
        contractName: tokenContract.name,
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
    [isConnected, address, stacksNetwork, tokenContract]
  );

  // Place a prediction (YES or NO)
  const predict = useCallback(
    async (marketId: number, outcome: 'yes' | 'no', amountMicroStx: bigint) => {
      if (!isConnected || !address) throw new Error('Wallet not connected');

      const outcomeValue = outcome === 'yes' ? 1 : 2;

      // Post condition: user sends STX
      const postConditions = [
        Pc.principal(address).willSendEq(amountMicroStx).ustx(),
      ];

      await openContractCall({
        network: stacksNetwork,
        contractAddress: tokenContract.address,
        contractName: tokenContract.name,
        functionName: 'predict',
        functionArgs: [
          uintCV(marketId),
          uintCV(outcomeValue),
          uintCV(safeBigIntToNumber(amountMicroStx, 'amountMicroStx')),
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
    [isConnected, address, stacksNetwork, tokenContract]
  );

  // Claim winnings from a resolved market
  const claimWinnings = useCallback(
    async (marketId: number) => {
      if (!isConnected || !address) throw new Error('Wallet not connected');

      await openContractCall({
        network: stacksNetwork,
        contractAddress: tokenContract.address,
        contractName: tokenContract.name,
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
    [isConnected, address, stacksNetwork, tokenContract]
  );

  // Stake OXC tokens
  const stakeTokens = useCallback(
    async (amountMicroOxc: bigint) => {
      if (!isConnected || !address) throw new Error('Wallet not connected');

      const postConditions = [
        Pc.principal(address).willSendEq(amountMicroOxc).ft(tokenContract.identifier as `${string}.${string}`, 'oxc-token'),
      ];

      await openContractCall({
        network: stacksNetwork,
        contractAddress: tokenContract.address,
        contractName: tokenContract.name,
        functionName: 'stake',
        functionArgs: [uintCV(safeBigIntToNumber(amountMicroOxc, 'amountMicroOxc'))],
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
    [isConnected, address, stacksNetwork, tokenContract]
  );

  // Unstake OXC tokens
  const unstakeTokens = useCallback(
    async (amountMicroOxc: bigint) => {
      if (!isConnected || !address) throw new Error('Wallet not connected');

      await openContractCall({
        network: stacksNetwork,
        contractAddress: tokenContract.address,
        contractName: tokenContract.name,
        functionName: 'unstake',
        functionArgs: [uintCV(safeBigIntToNumber(amountMicroOxc, 'amountMicroOxc'))],
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
    [isConnected, address, stacksNetwork, tokenContract]
  );

  // Transfer OXC tokens to another address
  // memo: optional message to include with transfer (wrapped in someCV/noneCV)
  // Memo is limited to 34 bytes per SIP-010 standard
  const transferTokens = useCallback(
    async (recipient: string, amountMicroOxc: bigint, memo?: string) => {
      if (!isConnected || !address) throw new Error('Wallet not connected');
      if (!recipient) throw new Error('Recipient address is required');
      if (amountMicroOxc <= 0n) throw new Error('Amount must be greater than zero');

      const postConditions = [
        Pc.principal(address).willSendEq(amountMicroOxc).ft(tokenContract.identifier as `${string}.${string}`, 'oxc-token'),
      ];

      // Construct function arguments with proper Clarity types
      const functionArgs = [
        uintCV(safeBigIntToNumber(amountMicroOxc, 'amountMicroOxc')),
        principalCV(address),
        principalCV(recipient),
        buildMemoCV(memo),
      ];

      await openContractCall({
        network: stacksNetwork,
        contractAddress: tokenContract.address,
        contractName: tokenContract.name,
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
    [isConnected, address, stacksNetwork, tokenContract]
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
    // Expose network info for debugging
    network,
    contractAddress,
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
