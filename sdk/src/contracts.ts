/**
 * Contract configuration and helpers for 0xCast SDK
 */

import type { NetworkType, ContractName, ContractPrincipal } from './types.js';

export type { ContractName, ContractPrincipal };

// ─── Contract Names ───────────────────────────────────────────────────────────

export const CONTRACT_NAMES = {
  MARKET_CORE: 'market-core',
  OXCAST: 'oxcast',
  GOVERNANCE_CORE: 'governance-core',
  GOVERNANCE_TOKEN: 'governance-token',
  LIQUIDITY_POOL: 'liquidity-pool',
  LIQUIDITY_REWARDS: 'liquidity-rewards',
  ORACLE_INTEGRATION: 'oracle-integration',
  ORACLE_REPUTATION: 'oracle-reputation',
  ACCESS_CONTROL: 'access-control',
  MARKET_FEES: 'market-fees',
  MARKET_MULTI: 'market-multi',
} as const satisfies Record<string, ContractName>;

// ─── Contract Addresses ───────────────────────────────────────────────────────

export const CONTRACT_ADDRESSES = {
  mainnet: {
    /** Primary deployer — market-core and most contracts */
    primary: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T',
    /** OXC token contract deployer */
    token: 'SP1W6XQZ6XVYGTVW32SJW2ZG48ZJBW9BATRD19N60',
  },
  testnet: {
    primary: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    token: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the deployer address for a given contract on the specified network.
 */
export function getContractAddress(
  contractName: ContractName,
  network: NetworkType = 'mainnet'
): string {
  const addresses = CONTRACT_ADDRESSES[network];
  return contractName === 'oxcast' ? addresses.token : addresses.primary;
}

/**
 * Returns the fully-qualified contract identifier (`address.name`).
 *
 * @example
 * getContractIdentifier('market-core', 'mainnet')
 * // => 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.market-core'
 */
export function getContractIdentifier(
  contractName: ContractName,
  network: NetworkType = 'mainnet'
): string {
  return `${getContractAddress(contractName, network)}.${contractName}`;
}

/**
 * Returns a `ContractPrincipal` object with address, name, and identifier.
 */
export function getContractPrincipal(
  contractName: ContractName,
  network: NetworkType = 'mainnet'
): ContractPrincipal {
  const address = getContractAddress(contractName, network);
  return {
    address,
    name: contractName,
    identifier: `${address}.${contractName}`,
  };
}

/**
 * Returns all contract identifiers for a given network as a map.
 *
 * @example
 * const contracts = getAllContracts('mainnet');
 * contracts['market-core'] // => 'SP31PKQ....market-core'
 */
export function getAllContracts(network: NetworkType = 'mainnet'): Record<ContractName, string> {
  return Object.fromEntries(
    Object.values(CONTRACT_NAMES).map((name) => [
      name,
      getContractIdentifier(name, network),
    ])
  ) as Record<ContractName, string>;
}
