# SDK Reference

## JavaScript/TypeScript SDK

### Installation
```bash
npm install @stacks/transactions @stacks/network
```

### Core Classes

#### StacksNetwork
```typescript
import { StacksTestnet, StacksMainnet } from '@stacks/network';

const testnet = new StacksTestnet();
const mainnet = new StacksMainnet();
```

#### Transaction Builder
```typescript
import { makeContractCall } from '@stacks/transactions';

const tx = await makeContractCall(options);
```

### Utility Functions

#### cvToJSON
Converts Clarity values to JSON.

#### uintCV
Creates unsigned integer Clarity value.

#### stringUtf8CV
Creates string Clarity value.

#### principalCV
Creates principal Clarity value.

## Python SDK

### Installation
```bash
pip install requests
```

### Usage
See [Python Examples](./examples/python.md)
