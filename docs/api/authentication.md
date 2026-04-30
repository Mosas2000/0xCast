# Authentication Guide

## Overview

The 0xCast API uses Stacks blockchain authentication. Transactions require signing with a private key.

## Wallet Setup

### Generate New Wallet

```typescript
import { generateSecretKey, getStxAddress } from '@stacks/wallet-sdk';
import { TransactionVersion } from '@stacks/transactions';

const secretKey = generateSecretKey();
const address = getStxAddress({
  secretKey,
  transactionVersion: TransactionVersion.Testnet
});

console.log('Address:', address);
console.log('Secret Key:', secretKey);
```

### Import Existing Wallet

```typescript
const privateKey = 'your-private-key-here';
const address = getStxAddress({
  secretKey: privateKey,
  transactionVersion: TransactionVersion.Testnet
});
```

## Signing Transactions

### Basic Transaction Signing

```typescript
import { makeContractCall } from '@stacks/transactions';

const txOptions = {
  contractAddress,
  contractName,
  functionName: 'stake-yes',
  functionArgs: [uintCV(1), uintCV(1000000)],
  senderKey: privateKey,
  network,
};

const transaction = await makeContractCall(txOptions);
```

### Post Conditions

Add post conditions to protect against unexpected behavior:

```typescript
import { makeStandardSTXPostCondition, FungibleConditionCode } from '@stacks/transactions';

const postConditions = [
  makeStandardSTXPostCondition(
    senderAddress,
    FungibleConditionCode.LessEqual,
    1000000n
  )
];

const txOptions = {
  contractAddress,
  contractName,
  functionName: 'stake-yes',
  functionArgs: [uintCV(1), uintCV(1000000)],
  senderKey: privateKey,
  network,
  postConditions,
};
```

## Security Best Practices

### 1. Never Expose Private Keys

```typescript
const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
  throw new Error('Private key not found');
}
```

### 2. Use Environment Variables

```bash
export PRIVATE_KEY=your-private-key
export CONTRACT_ADDRESS=SP2J6ZY...
```

### 3. Validate Addresses

```typescript
function isValidStacksAddress(address) {
  return /^S[PT][0-9A-Z]{38,40}$/.test(address);
}

if (!isValidStacksAddress(userAddress)) {
  throw new Error('Invalid address');
}
```

### 4. Implement Rate Limiting

```typescript
class RateLimiter {
  private requests = new Map();
  
  canMakeRequest(address, limit = 10) {
    const now = Date.now();
    const userRequests = this.requests.get(address) || [];
    
    const recentRequests = userRequests.filter(
      time => now - time < 60000
    );
    
    if (recentRequests.length >= limit) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(address, recentRequests);
    return true;
  }
}
```

### 5. Verify Transaction Results

```typescript
async function verifyTransaction(txId) {
  const url = `${network.coreApiUrl}/extended/v1/tx/${txId}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.tx_status !== 'success') {
    throw new Error('Transaction failed');
  }
  
  return data;
}
```

## Multi-Signature Support

```typescript
import { createMultiSigSpendingCondition } from '@stacks/transactions';

const multiSigCondition = createMultiSigSpendingCondition(
  2, // Required signatures
  [publicKey1, publicKey2, publicKey3]
);
```

## Session Management

```typescript
class SessionManager {
  private sessions = new Map();
  
  createSession(address) {
    const sessionId = crypto.randomUUID();
    const expiresAt = Date.now() + 3600000; // 1 hour
    
    this.sessions.set(sessionId, {
      address,
      expiresAt
    });
    
    return sessionId;
  }
  
  validateSession(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }
    
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }
    
    return session.address;
  }
}
```

## API Key Management

For server-to-server communication:

```typescript
const API_KEY = process.env.API_KEY;

const headers = {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json'
};

const response = await fetch(url, { headers });
```
