# Network Switching Feature

0xCast supports seamless switching between Stacks Mainnet and Testnet networks.

## Overview

The network switching feature allows users to:
- Switch between mainnet and testnet without reloading
- Test transactions on testnet before using real tokens
- Persist network preference across sessions
- See clear visual indicators of which network is active

## Components

### NetworkProvider
The core context provider that manages network state.

```tsx
import { NetworkProvider } from './contexts/NetworkContext';

// Wrap your app
<NetworkProvider>
  <App />
</NetworkProvider>
```

### useNetwork Hook
Access network state from any component.

```tsx
import { useNetwork } from './contexts/NetworkContext';

function MyComponent() {
  const { 
    network,           // 'mainnet' | 'testnet'
    networkConfig,     // Full config object
    stacksNetwork,     // StacksNetwork instance
    contractAddress,   // Dynamic contract address
    isTestnet,         // Boolean shorthand
    setNetwork,        // Switch network
    toggleNetwork,     // Toggle between networks
  } = useNetwork();
}
```

### NetworkSelector
Dropdown/toggle for users to change network.

```tsx
import { NetworkSelector } from './components/NetworkSelector';

// Dropdown variant (default)
<NetworkSelector />

// Toggle button variant
<NetworkSelector variant="toggle" />

// Compact icon-only variant
<NetworkSelector variant="compact" />
```

### NetworkBadge
Visual indicator of current network.

```tsx
import { NetworkBadge, NetworkDot, NetworkIndicator } from './components/NetworkBadge';

// Full badge with label
<NetworkBadge size="md" showPulse={true} />

// Simple dot indicator
<NetworkDot size="sm" />

// Inline text with icon
<NetworkIndicator />
```

### TestnetWarningBanner
Persistent warning when on testnet.

```tsx
import { TestnetWarningBanner, TestnetLabel } from './components/TestnetWarningBanner';

// Full banner (auto-hides on mainnet)
<TestnetWarningBanner dismissible={true} showSwitchButton={true} />

// Compact label
<TestnetLabel />
```

## Configuration

### Network Settings

Networks are configured in `src/types/network.ts`:

```typescript
export const NETWORK_CONFIGS = {
  mainnet: {
    name: 'mainnet',
    label: 'Mainnet',
    apiUrl: 'https://api.mainnet.hiro.so',
    contractAddress: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T',
    color: '#10B981',
    icon: '🟢',
  },
  testnet: {
    name: 'testnet',
    label: 'Testnet',
    apiUrl: 'https://api.testnet.hiro.so',
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    color: '#F59E0B',
    icon: '🟡',
  },
};
```

### Storage Key

Network preference is stored in localStorage:
- Key: `0xcast_network`
- Values: `mainnet` | `testnet`

## Usage in Hooks

Hooks automatically respond to network changes:

```typescript
// useMarkets - re-fetches when network changes
const { markets, isLoading, currentNetwork } = useMarkets();

// useContract - uses correct network for transactions
const { createMarket, network, contractAddress } = useContract();

// useApi - returns network-aware API URLs
const { baseUrl, explorerTx } = useApi();
```

## URL-based Network Selection

You can link directly to a specific network:

```
https://0xcast.app/markets?network=testnet
https://0xcast.app/markets?network=mainnet
```

## Best Practices

1. **Always check network before transactions**
   ```tsx
   const { isTestnet } = useNetwork();
   if (!isTestnet) {
     // Show confirmation for mainnet transactions
   }
   ```

2. **Show clear network indicators**
   - Use NetworkBadge in key areas
   - Show TestnetWarningBanner when on testnet

3. **Handle network switches gracefully**
   - Reset relevant state when network changes
   - Re-fetch data for the new network
   - Clear cached data from previous network

4. **Test on testnet first**
   - Encourage users to test features on testnet
   - Make switching easy and obvious

## API Reference

### Types

```typescript
type NetworkType = 'mainnet' | 'testnet';

interface NetworkConfig {
  name: string;
  label: string;
  apiUrl: string;
  contractAddress: string;
  contractName: string;
  color: string;
  icon: string;
}

interface NetworkContextType {
  network: NetworkType;
  networkConfig: NetworkConfig;
  stacksNetwork: StacksNetwork;
  contractAddress: string;
  isTestnet: boolean;
  setNetwork: (network: NetworkType) => void;
  toggleNetwork: () => void;
}
```

### Utility Functions

```typescript
// Get StacksNetwork instance
getStacksNetwork(network?: NetworkType): StacksNetwork

// Persistence
saveNetworkPreference(network: NetworkType): void
loadNetworkPreference(): NetworkType
clearNetworkPreference(): void

// Helpers
getContractAddress(network?: NetworkType): string
isValidNetwork(network: string): boolean
getNetworkFromURL(): NetworkType | null
```
