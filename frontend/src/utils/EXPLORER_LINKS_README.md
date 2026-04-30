# Explorer Links Utility

Network-aware utility functions for generating Hiro explorer URLs.

## Overview

This module provides functions to generate explorer URLs that automatically respect the selected network (mainnet or testnet). All functions accept an optional `network` parameter and default to the active network from the network context.

## Functions

### `getTransactionExplorerUrl(txId, network?)`

Generates a URL to view a transaction on the Hiro explorer.

**Parameters:**
- `txId` (string): Transaction ID to view
- `network` (NetworkType, optional): Network type (mainnet or testnet)

**Returns:** Full URL string

**Example:**
```typescript
const url = getTransactionExplorerUrl('0x123...', 'mainnet');
// https://explorer.hiro.so/txid/0x123...?chain=mainnet
```

### `getAddressExplorerUrl(address, network?)`

Generates a URL to view an address on the Hiro explorer.

**Parameters:**
- `address` (string): Stacks address to view
- `network` (NetworkType, optional): Network type (mainnet or testnet)

**Returns:** Full URL string

**Example:**
```typescript
const url = getAddressExplorerUrl('SP2J6ZY...', 'mainnet');
// https://explorer.hiro.so/address/SP2J6ZY...?chain=mainnet
```

### `getContractExplorerUrl(identifier, network?)`

Generates a URL to view a contract on the Hiro explorer.

**Parameters:**
- `identifier` (string): Contract identifier (address.contract-name)
- `network` (NetworkType, optional): Network type (mainnet or testnet)

**Returns:** Full URL string

**Example:**
```typescript
const url = getContractExplorerUrl('SP2J6ZY....my-contract', 'mainnet');
// https://explorer.hiro.so/txid/SP2J6ZY....my-contract?chain=mainnet
```

## Usage in Components

```typescript
import { getTransactionExplorerUrl } from '../utils/explorerLinks';
import { useNetwork } from '../contexts/NetworkContext';

function MyComponent() {
  const { network } = useNetwork();
  const txId = '0x123...';
  
  return (
    <a 
      href={getTransactionExplorerUrl(txId, network)}
      target="_blank"
      rel="noopener noreferrer"
    >
      View Transaction
    </a>
  );
}
```

## Usage in Utilities

```typescript
import { getAddressExplorerUrl, type NetworkType } from '../utils/explorerLinks';

function buildExplorerLink(address: string, network?: NetworkType): string {
  // If network is not provided, it will use the active network
  return getAddressExplorerUrl(address, network);
}
```

## Network Parameter

The `network` parameter is optional for all functions:
- If provided, the function uses the specified network
- If not provided, the function uses the active network from the network context
- Valid values: `'mainnet'` or `'testnet'`

## Type Safety

All functions are fully typed with TypeScript:
```typescript
import type { NetworkType } from '../utils/explorerLinks';

const network: NetworkType = 'mainnet';
const url: string = getTransactionExplorerUrl('0x123', network);
```

## Testing

The module includes comprehensive tests covering:
- Network-specific URL generation
- Fallback to active network
- Edge cases with special characters
- Different address prefixes (SP/ST)
- Contract identifiers with hyphens

Run tests:
```bash
npm test explorerLinks.test.ts
```

## Related

- `frontend/src/config/network.ts` - Network configuration
- `frontend/src/utils/transactions.ts` - Transaction utilities
- `frontend/src/contexts/NetworkContext.tsx` - Network context provider
