# JavaScript/TypeScript Examples

## Installation

```bash
npm install @stacks/transactions @stacks/network
```

## Configuration

```typescript
import { StacksTestnet, StacksMainnet } from '@stacks/network';

const network = new StacksTestnet();
const contractAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
const contractName = 'oxcast';
```

## Read Market Data

```typescript
import { fetchCallReadOnlyFunction, cvToJSON, uintCV } from '@stacks/transactions';

async function getMarket(marketId: number) {
  try {
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: 'get-market',
      functionArgs: [uintCV(marketId)],
      senderAddress: contractAddress,
    });

    const jsonResult = cvToJSON(result);
    
    if (jsonResult.type === 'some') {
      return jsonResult.value;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching market:', error);
    throw error;
  }
}

const market = await getMarket(1);
console.log('Market:', market);
```

## Create Market

```typescript
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  stringUtf8CV,
  uintCV
} from '@stacks/transactions';

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
    fee: 1000n,
  };

  try {
    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    
    console.log('Transaction ID:', broadcastResponse.txid);
    return broadcastResponse.txid;
  } catch (error) {
    console.error('Error creating market:', error);
    throw error;
  }
}

const txId = await createMarket(
  'Will Bitcoin reach $100k by end of 2024?',
  2000,
  1,
  privateKey
);
```

## Place Stake

```typescript
async function placeStake(
  marketId: number,
  outcome: 'yes' | 'no',
  amount: number,
  senderKey: string
) {
  const functionName = outcome === 'yes' ? 'stake-yes' : 'stake-no';
  
  const txOptions = {
    contractAddress,
    contractName,
    functionName,
    functionArgs: [
      uintCV(marketId),
      uintCV(amount)
    ],
    senderKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: 1000n,
  };

  try {
    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    
    console.log('Stake placed:', broadcastResponse.txid);
    return broadcastResponse.txid;
  } catch (error) {
    console.error('Error placing stake:', error);
    throw error;
  }
}

const txId = await placeStake(1, 'yes', 1000000, privateKey);
```

## Claim Winnings

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
    fee: 1000n,
  };

  try {
    const transaction = await makeContractCall(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, network);
    
    console.log('Winnings claimed:', broadcastResponse.txid);
    return broadcastResponse.txid;
  } catch (error) {
    console.error('Error claiming winnings:', error);
    throw error;
  }
}

const txId = await claimWinnings(1, privateKey);
```

## Monitor Transaction

```typescript
async function waitForTransaction(txId: string, maxAttempts = 60) {
  const url = `${network.coreApiUrl}/extended/v1/tx/${txId}`;
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.tx_status === 'success') {
        console.log('Transaction confirmed');
        return data;
      } else if (data.tx_status === 'abort_by_response') {
        throw new Error('Transaction failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error('Error checking transaction:', error);
    }
  }
  
  throw new Error('Transaction timeout');
}

const txId = await placeStake(1, 'yes', 1000000, privateKey);
const result = await waitForTransaction(txId);
console.log('Transaction result:', result);
```

## Complete Example

```typescript
import {
  makeContractCall,
  broadcastTransaction,
  fetchCallReadOnlyFunction,
  cvToJSON,
  uintCV,
  stringUtf8CV,
  AnchorMode,
  PostConditionMode
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';

class OxCastClient {
  private network: StacksTestnet;
  private contractAddress: string;
  private contractName: string;

  constructor() {
    this.network = new StacksTestnet();
    this.contractAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
    this.contractName = 'oxcast';
  }

  async getMarket(marketId: number) {
    const result = await fetchCallReadOnlyFunction({
      network: this.network,
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'get-market',
      functionArgs: [uintCV(marketId)],
      senderAddress: this.contractAddress,
    });

    return cvToJSON(result);
  }

  async createMarket(
    question: string,
    endDate: number,
    category: number,
    senderKey: string
  ) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'create-market',
      functionArgs: [
        stringUtf8CV(question),
        uintCV(endDate),
        uintCV(category)
      ],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const response = await broadcastTransaction(transaction, this.network);
    return response.txid;
  }

  async stakeYes(marketId: number, amount: number, senderKey: string) {
    return this.stake(marketId, 'yes', amount, senderKey);
  }

  async stakeNo(marketId: number, amount: number, senderKey: string) {
    return this.stake(marketId, 'no', amount, senderKey);
  }

  private async stake(
    marketId: number,
    outcome: 'yes' | 'no',
    amount: number,
    senderKey: string
  ) {
    const functionName = outcome === 'yes' ? 'stake-yes' : 'stake-no';
    
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName,
      functionArgs: [uintCV(marketId), uintCV(amount)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const response = await broadcastTransaction(transaction, this.network);
    return response.txid;
  }

  async claimWinnings(marketId: number, senderKey: string) {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'claim-winnings',
      functionArgs: [uintCV(marketId)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
    };

    const transaction = await makeContractCall(txOptions);
    const response = await broadcastTransaction(transaction, this.network);
    return response.txid;
  }
}

const client = new OxCastClient();

const market = await client.getMarket(1);
console.log('Market:', market);

const txId = await client.stakeYes(1, 1000000, privateKey);
console.log('Stake placed:', txId);
```
