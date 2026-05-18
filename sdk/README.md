# @oxcast/sdk

JavaScript/TypeScript SDK for interacting with [0xCast](https://github.com/your-username/0xCast) — decentralized prediction markets on Bitcoin via Stacks.

[![npm version](https://img.shields.io/npm/v/oxcast-sdk)](https://www.npmjs.com/package/oxcast-sdk)
[![npm downloads](https://img.shields.io/npm/dm/oxcast-sdk)](https://www.npmjs.com/package/oxcast-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install oxcast-sdk @stacks/network @stacks/transactions
```

```bash
yarn add oxcast-sdk @stacks/network @stacks/transactions
```

```bash
pnpm add oxcast-sdk @stacks/network @stacks/transactions
```

## Quick Start

```ts
import {
  getContractIdentifier,
  getStacksNetwork,
  calculateOdds,
  formatSTX,
  getTransactionUrl,
} from 'oxcast-sdk';

// Get the market-core contract identifier on mainnet
const marketContract = getContractIdentifier('market-core', 'mainnet');
// => 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.market-core'

// Get the Stacks network instance for use with @stacks/transactions
const network = getStacksNetwork('mainnet');

// Calculate odds from pool sizes (in micro-STX)
const odds = calculateOdds(700_000n, 300_000n);
// => { yes: 1.43, no: 3.33, yesImpliedProbability: 0.7, noImpliedProbability: 0.3 }

// Format micro-STX as a readable string
formatSTX(1_500_000n); // => '1.500000 STX'

// Get a Hiro explorer link for a transaction
getTransactionUrl('0xabc123...', 'mainnet');
// => 'https://explorer.hiro.so/txid/0xabc123...?chain=mainnet'
```

## API Reference

### Network

| Function | Description |
|---|---|
| `getStacksNetwork(network)` | Returns a `@stacks/network` instance |
| `getNetworkConfig(network)` | Returns API URLs and chain config |
| `getApiUrl(network)` | Returns the Hiro API base URL |
| `getNodeUrl(network)` | Returns the Stacks node API URL |
| `isValidNetwork(value)` | Type guard for `NetworkType` |
| `getTransactionUrl(txId, network)` | Hiro explorer URL for a transaction |
| `getAddressUrl(address, network)` | Hiro explorer URL for an address |
| `getContractUrl(identifier, network)` | Hiro explorer URL for a contract |

### Contracts

| Function | Description |
|---|---|
| `getContractAddress(name, network)` | Deployer address for a contract |
| `getContractIdentifier(name, network)` | Fully-qualified `address.name` string |
| `getContractPrincipal(name, network)` | `{ address, name, identifier }` object |
| `getAllContracts(network)` | Map of all contract identifiers |
| `CONTRACT_NAMES` | Enum of all contract name constants |
| `CONTRACT_ADDRESSES` | Raw address map per network |

### Markets

| Function | Description |
|---|---|
| `calculateOdds(yesPool, noPool)` | Odds and implied probabilities from pool sizes |
| `calculatePayout(stake, outcome, yesPool, noPool)` | Estimated payout for a stake |
| `formatSTX(microStx)` | Format micro-STX as `'1.000000 STX'` |
| `toMicroSTX(stx)` | Convert STX number to micro-STX bigint |
| `fromMicroSTX(microStx)` | Convert micro-STX bigint to STX number |
| `isMarketOpen(market)` | Whether a market is accepting predictions |
| `isMarketResolved(market)` | Whether a market has been resolved |
| `getWinningOutcome(market)` | `'Yes'`, `'No'`, or `null` |

### Transactions

| Function | Description |
|---|---|
| `formatTransactionType(type)` | Human-readable transaction type label |
| `formatTransactionStatus(status)` | Human-readable status label |
| `getStatusColor(status)` | Hex color for a status badge |
| `getExplorerUrl(txId, network)` | Hiro explorer URL for a transaction |
| `isTerminalStatus(status)` | Whether the status is final |
| `isSuccessful(tx)` | Whether the transaction succeeded |
| `isPending(tx)` | Whether the transaction is still pending |

## Contract Names

```ts
import { CONTRACT_NAMES } from '@oxcast/sdk';

CONTRACT_NAMES.MARKET_CORE      // 'market-core'
CONTRACT_NAMES.OXCAST           // 'oxcast'
CONTRACT_NAMES.GOVERNANCE_CORE  // 'governance-core'
CONTRACT_NAMES.GOVERNANCE_TOKEN // 'governance-token'
CONTRACT_NAMES.LIQUIDITY_POOL   // 'liquidity-pool'
CONTRACT_NAMES.LIQUIDITY_REWARDS // 'liquidity-rewards'
CONTRACT_NAMES.ORACLE_INTEGRATION // 'oracle-integration'
CONTRACT_NAMES.ORACLE_REPUTATION  // 'oracle-reputation'
CONTRACT_NAMES.ACCESS_CONTROL   // 'access-control'
CONTRACT_NAMES.MARKET_FEES      // 'market-fees'
CONTRACT_NAMES.MARKET_MULTI     // 'market-multi'
```

## TypeScript

The SDK is written in TypeScript and ships with full type definitions. No `@types/` package needed.

```ts
import type { Market, MarketOdds, NetworkType, ContractName } from 'oxcast-sdk';
```

## License

MIT
