# React Examples

## Setup

```bash
npm install @stacks/connect @stacks/transactions
```

## Connect Wallet

```typescript
import { showConnect } from '@stacks/connect';

function ConnectButton() {
  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: '0xCast',
        icon: '/logo.png',
      },
      onFinish: () => {
        console.log('Connected');
      },
    });
  };

  return <button onClick={connectWallet}>Connect Wallet</button>;
}
```

## Place Stake

```typescript
import { useConnect } from '@stacks/connect-react';
import { uintCV } from '@stacks/transactions';

function StakeButton({ marketId, amount }) {
  const { doContractCall } = useConnect();

  const handleStake = async () => {
    await doContractCall({
      contractAddress,
      contractName: 'oxcast',
      functionName: 'stake-yes',
      functionArgs: [uintCV(marketId), uintCV(amount)],
      onFinish: (data) => {
        console.log('Transaction:', data.txId);
      },
    });
  };

  return <button onClick={handleStake}>Stake</button>;
}
```
