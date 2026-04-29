# Error Handling Guide

## Error Response Format

All API errors follow a consistent format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional context"
  }
}
```

## Contract Error Codes

### Market Errors (100-199)

| Code | Name | Description | Solution |
|------|------|-------------|----------|
| 100 | ERR-NOT-AUTHORIZED | Caller not authorized | Check permissions |
| 101 | ERR-MARKET-NOT-FOUND | Market does not exist | Verify market ID |
| 102 | ERR-MARKET-ENDED | Market has ended | Cannot stake on ended market |
| 103 | ERR-MARKET-RESOLVED | Market already resolved | Cannot modify resolved market |
| 104 | ERR-INVALID-AMOUNT | Invalid stake amount | Check min/max limits |
| 105 | ERR-INSUFFICIENT-BALANCE | Insufficient balance | Add funds to wallet |
| 106 | ERR-NO-WINNINGS | No winnings to claim | Check market outcome |
| 107 | ERR-ALREADY-CLAIMED | Winnings already claimed | Cannot claim twice |

### Governance Errors (200-299)

| Code | Name | Description | Solution |
|------|------|-------------|----------|
| 200 | ERR-PROPOSAL-NOT-FOUND | Proposal does not exist | Verify proposal ID |
| 201 | ERR-ALREADY-VOTED | Already voted on proposal | Cannot vote twice |
| 202 | ERR-VOTING-ENDED | Voting period ended | Cannot vote after deadline |
| 203 | ERR-PROPOSAL-NOT-PASSED | Proposal did not pass | Cannot execute failed proposal |

## Handling Errors in Code

### JavaScript/TypeScript

```typescript
async function safeStakeYes(marketId, amount, privateKey) {
  try {
    const txId = await stakeYes(marketId, amount, privateKey);
    return { success: true, txId };
  } catch (error) {
    if (error.message.includes('ERR-MARKET-ENDED')) {
      return { success: false, error: 'Market has ended' };
    } else if (error.message.includes('ERR-INSUFFICIENT-BALANCE')) {
      return { success: false, error: 'Insufficient balance' };
    } else if (error.message.includes('ERR-INVALID-AMOUNT')) {
      return { success: false, error: 'Invalid amount' };
    } else {
      return { success: false, error: 'Unknown error' };
    }
  }
}

const result = await safeStakeYes(1, 1000000, privateKey);
if (result.success) {
  console.log('Success:', result.txId);
} else {
  console.error('Error:', result.error);
}
```

### Python

```python
def safe_stake_yes(market_id, amount, private_key):
    try:
        tx_id = stake_yes(market_id, amount, private_key)
        return {'success': True, 'tx_id': tx_id}
    except Exception as e:
        error_msg = str(e)
        
        if 'ERR-MARKET-ENDED' in error_msg:
            return {'success': False, 'error': 'Market has ended'}
        elif 'ERR-INSUFFICIENT-BALANCE' in error_msg:
            return {'success': False, 'error': 'Insufficient balance'}
        elif 'ERR-INVALID-AMOUNT' in error_msg:
            return {'success': False, 'error': 'Invalid amount'}
        else:
            return {'success': False, 'error': 'Unknown error'}

result = safe_stake_yes(1, 1000000, private_key)
if result['success']:
    print(f"Success: {result['tx_id']}")
else:
    print(f"Error: {result['error']}")
```

## Retry Strategies

### Exponential Backoff

```typescript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

const result = await retryWithBackoff(() => getMarket(1));
```

### Conditional Retry

```typescript
async function retryOnNetworkError(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isNetworkError = error.message.includes('network') || 
                            error.message.includes('timeout');
      
      if (!isNetworkError || i === maxRetries - 1) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}
```

## Validation Before Submission

```typescript
function validateStakeAmount(amount) {
  const MIN_STAKE = 1000;
  const MAX_STAKE = 1000000000;
  
  if (amount < MIN_STAKE) {
    throw new Error(`Minimum stake is ${MIN_STAKE}`);
  }
  
  if (amount > MAX_STAKE) {
    throw new Error(`Maximum stake is ${MAX_STAKE}`);
  }
  
  return true;
}

function validateMarketId(marketId) {
  if (!Number.isInteger(marketId) || marketId < 1) {
    throw new Error('Invalid market ID');
  }
  
  return true;
}

try {
  validateMarketId(1);
  validateStakeAmount(1000000);
  const txId = await stakeYes(1, 1000000, privateKey);
} catch (error) {
  console.error('Validation error:', error.message);
}
```

## Transaction Failure Handling

```typescript
async function handleTransactionFailure(txId) {
  const url = `${network.coreApiUrl}/extended/v1/tx/${txId}`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.tx_status === 'abort_by_response') {
    const errorCode = data.tx_result.repr;
    
    switch (errorCode) {
      case '(err u102)':
        console.error('Market has ended');
        break;
      case '(err u105)':
        console.error('Insufficient balance');
        break;
      default:
        console.error('Transaction failed:', errorCode);
    }
  }
}
```

## Best Practices

1. **Always Validate Input**: Check parameters before submission
2. **Handle All Error Cases**: Don't assume success
3. **Provide User Feedback**: Show clear error messages
4. **Log Errors**: Keep track of failures
5. **Implement Retries**: For transient failures
6. **Use Timeouts**: Don't wait indefinitely
7. **Graceful Degradation**: Provide fallback behavior
