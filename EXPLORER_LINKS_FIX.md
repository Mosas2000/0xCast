# Explorer Links Network-Aware Fix

## Issue
Explorer links were hardcoded to mainnet throughout the frontend, causing transaction and contract links to point to the wrong explorer chain when users were on testnet.

## Root Cause
The frontend was building explorer URLs with hardcoded `?chain=mainnet` parameter, even when the application was configured to use testnet.

## Solution
Implemented a comprehensive network-aware explorer link system:

### 1. Created Explorer Links Utility (`frontend/src/utils/explorerLinks.ts`)
- `getTransactionExplorerUrl(txId, network?)` - Get transaction explorer URL
- `getAddressExplorerUrl(address, network?)` - Get address explorer URL
- `getContractExplorerUrl(identifier, network?)` - Get contract explorer URL

All functions accept an optional `network` parameter. If not provided, they use the active network from the network context.

### 2. Updated Network Configuration (`frontend/src/config/network.ts`)
- Added `getExplorerChain(network?)` helper function
- Maintained existing `EXPLORER_URLS` configuration with network-specific URLs
- Added `getExplorerUrls(network?)` function for retrieving network-specific explorer URLs

### 3. Updated Transaction Utilities (`frontend/src/utils/transactions.ts`)
- Updated `getExplorerUrl()` to use `getTransactionExplorerUrl()`
- Updated `getExplorerAddressUrl()` to use `getAddressExplorerUrl()`
- Both functions now accept optional `network` parameter

### 4. Updated Components
- **TransactionHistory**: Added network context, passes network to `getExplorerUrl()`
- **TransactionToast**: Added network context, passes network to `getExplorerUrl()`
- **TradePage**: Already using network-aware functions correctly
- **LandingPage**: Already using network-aware functions correctly
- **Footer**: Already using network-aware functions correctly

### 5. Added Tests
- Created comprehensive test suite for explorer links utility
- Tests verify correct URL generation for both mainnet and testnet
- Tests verify fallback to active network when no parameter provided

## Files Changed
- `frontend/src/utils/explorerLinks.ts` (new)
- `frontend/src/config/network.ts` (modified)
- `frontend/src/utils/transactions.ts` (modified)
- `frontend/src/components/TransactionHistory.tsx` (modified)
- `frontend/src/components/TransactionToast.tsx` (modified)
- `frontend/src/utils/__tests__/explorerLinks.test.ts` (new)

## Verification
All explorer links now respect the selected network:
- Transaction links point to correct chain
- Address links point to correct chain
- Contract links point to correct chain
- Chain parameter matches the selected network
- Links work correctly on both mainnet and testnet

## Usage Example
```typescript
import { getTransactionExplorerUrl, getAddressExplorerUrl } from '../utils/explorerLinks';
import { useNetwork } from '../contexts/NetworkContext';

function MyComponent() {
  const { network } = useNetwork();
  
  // Explicitly pass network
  const txUrl = getTransactionExplorerUrl('0x123', network);
  
  // Or let it use active network
  const addressUrl = getAddressExplorerUrl('SP123...');
  
  return (
    <a href={txUrl} target="_blank" rel="noopener noreferrer">
      View Transaction
    </a>
  );
}
```

## Impact
- Users on testnet can now properly view their transactions and contracts
- No more 404 errors when clicking explorer links on testnet
- Consistent behavior across all components
- Better developer experience with clear, reusable utilities
