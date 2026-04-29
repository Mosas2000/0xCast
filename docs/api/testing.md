# Testing Guide

## Unit Testing

### Testing Read Functions

```typescript
import { fetchCallReadOnlyFunction, cvToJSON, uintCV } from '@stacks/transactions';

describe('Market Functions', () => {
  it('should fetch market data', async () => {
    const result = await fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: 'get-market',
      functionArgs: [uintCV(1)],
      senderAddress: contractAddress,
    });

    const market = cvToJSON(result);
    expect(market.type).toBe('some');
    expect(market.value).toHaveProperty('question');
  });
});
```

### Mocking Contract Calls

```typescript
jest.mock('@stacks/transactions', () => ({
  fetchCallReadOnlyFunction: jest.fn(),
}));

it('should handle market not found', async () => {
  fetchCallReadOnlyFunction.mockResolvedValue({
    type: 'none'
  });

  const market = await getMarket(999);
  expect(market).toBeNull();
});
```

## Integration Testing

```typescript
describe('Staking Flow', () => {
  it('should complete full staking flow', async () => {
    const marketId = 1;
    const amount = 1000000;
    
    const txId = await stakeYes(marketId, amount, testPrivateKey);
    expect(txId).toBeDefined();
    
    const result = await waitForTransaction(txId);
    expect(result.tx_status).toBe('success');
    
    const stake = await getUserStake(marketId, testAddress);
    expect(stake['yes-stake']).toBeGreaterThanOrEqual(amount);
  });
});
```

## Test Data

```typescript
const testMarket = {
  id: 1,
  question: 'Test Market',
  creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  status: 0,
  outcome: 0,
  totalYesStake: 1000,
  totalNoStake: 500,
  createdAt: 1000,
  endDate: 2000
};
```

## Best Practices

1. Test on testnet first
2. Use test accounts
3. Mock external calls
4. Test error cases
5. Verify transaction results
