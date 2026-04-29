# Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies

```bash
npm install @stacks/transactions @stacks/network
```

### Step 2: Create Client

```typescript
import { StacksTestnet } from '@stacks/network';

const network = new StacksTestnet();
const contractAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
const contractName = 'oxcast';
```

### Step 3: Read Market Data

```typescript
import { fetchCallReadOnlyFunction, cvToJSON, uintCV } from '@stacks/transactions';

async function getMarket(marketId) {
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

### Step 4: Place a Stake

```typescript
import { makeContractCall, broadcastTransaction, AnchorMode } from '@stacks/transactions';

async function stakeYes(marketId, amount, privateKey) {
  const txOptions = {
    contractAddress,
    contractName,
    functionName: 'stake-yes',
    functionArgs: [uintCV(marketId), uintCV(amount)],
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractCall(txOptions);
  const response = await broadcastTransaction(transaction, network);
  
  return response.txid;
}

const txId = await stakeYes(1, 1000000, 'your-private-key');
console.log('Transaction ID:', txId);
```

## Common Tasks

### Check Market Status

```typescript
const market = await getMarket(1);
console.log('Status:', market.value.status);
console.log('Total Yes Stake:', market.value['total-yes-stake']);
console.log('Total No Stake:', market.value['total-no-stake']);
```

### Calculate Odds

```typescript
function calculateOdds(yesStake, noStake) {
  const total = yesStake + noStake;
  return {
    yes: (yesStake / total) * 100,
    no: (noStake / total) * 100
  };
}

const odds = calculateOdds(
  market.value['total-yes-stake'],
  market.value['total-no-stake']
);
console.log('Odds:', odds);
```

### Monitor Transaction

```typescript
async function waitForTx(txId) {
  const url = `${network.coreApiUrl}/extended/v1/tx/${txId}`;
  
  while (true) {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.tx_status === 'success') {
      return data;
    }
    
    await new Promise(r => setTimeout(r, 5000));
  }
}

const result = await waitForTx(txId);
console.log('Confirmed:', result);
```

## Next Steps

- Read the [Integration Guide](./integration-guide.md)
- Explore [Contract Functions](./contract-functions.md)
- Check [Code Examples](./examples/javascript.md)
- Set up [Webhooks](./webhooks.md)
