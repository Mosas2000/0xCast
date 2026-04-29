# Integration Guide

## Getting Started

### Installation

```bash
npm install @stacks/transactions @stacks/network
```

### Basic Setup

```typescript
import { 
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  stringUtf8CV
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

const network = new StacksTestnet();
const contractAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
const contractName = 'oxcast';
```

## Reading Market Data

### Get Single Market

```typescript
import { fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions';

async function getMarket(marketId: number) {
  const result = await fetchCallReadOnlyFunction({
    network,
    contractAddress,
    contractName,
    functionName: 'get-market',
    functionArgs: [uintCV(marketId)],
    senderAddress: contractAddress,
  });

  return cvToJSON(result);
}

const market = await getMarket(1);
console.log(market);
```

### Get User Stake

```typescript
async function getUserStake(marketId: number, userAddress: string) {
  const result = await fetchCallReadOnlyFunction({
    network,
    contractAddress,
    contractName,
    functionName: 'get-user-stake',
    functionArgs: [
      uintCV(marketId),
      principalCV(userAddress)
    ],
    senderAddress: contractAddress,
  });

  return cvToJSON(result);
}

const stake = await getUserStake(1, 'SP2J6ZY...');
console.log(stake);
```

## Creating Markets

```typescript
async function createMarket(
  question: string,
  endDate: number,
  category: number,
  senderKey: string
) {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'create-market',
    functionArgs: [
      stringUtf8CV(question),
      uintCV(endDate),
      uintCV(category)
    ],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  return broadcastResponse.txid;
}

const txId = await createMarket(
  'Will Bitcoin reach $100k?',
  2000,
  1,
  privateKey
);
```

## Staking

### Stake on YES

```typescript
async function stakeYes(
  marketId: number,
  amount: number,
  senderKey: string
) {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'stake-yes',
    functionArgs: [
      uintCV(marketId),
      uintCV(amount)
    ],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  return broadcastResponse.txid;
}

const txId = await stakeYes(1, 1000000, privateKey);
```

### Stake on NO

```typescript
async function stakeNo(
  marketId: number,
  amount: number,
  senderKey: string
) {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'stake-no',
    functionArgs: [
      uintCV(marketId),
      uintCV(amount)
    ],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  return broadcastResponse.txid;
}

const txId = await stakeNo(1, 500000, privateKey);
```

## Claiming Winnings

```typescript
async function claimWinnings(
  marketId: number,
  senderKey: string
) {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'claim-winnings',
    functionArgs: [uintCV(marketId)],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  return broadcastResponse.txid;
}

const txId = await claimWinnings(1, privateKey);
```

## Error Handling

```typescript
try {
  const txId = await stakeYes(1, 1000000, privateKey);
  console.log('Transaction submitted:', txId);
} catch (error) {
  if (error.message.includes('ERR-MARKET-ENDED')) {
    console.error('Market has ended');
  } else if (error.message.includes('ERR-INSUFFICIENT-BALANCE')) {
    console.error('Insufficient balance');
  } else {
    console.error('Transaction failed:', error);
  }
}
```

## Monitoring Transactions

```typescript
async function waitForTransaction(txId: string) {
  const url = `${network.coreApiUrl}/extended/v1/tx/${txId}`;
  
  while (true) {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.tx_status === 'success') {
      return data;
    } else if (data.tx_status === 'abort_by_response') {
      throw new Error('Transaction failed');
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

const txId = await stakeYes(1, 1000000, privateKey);
const result = await waitForTransaction(txId);
console.log('Transaction confirmed:', result);
```

## Best Practices

1. Always validate inputs before calling contract functions
2. Use post conditions to protect against unexpected behavior
3. Handle errors gracefully
4. Monitor transaction status
5. Use appropriate network (mainnet/testnet)
6. Keep private keys secure
7. Test on testnet first
