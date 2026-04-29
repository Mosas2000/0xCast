# Troubleshooting Guide

## Common Issues

### Transaction Not Confirming

**Symptoms**: Transaction stuck in pending state

**Solutions**:
1. Check network status
2. Verify sufficient fee
3. Wait for block confirmation
4. Check transaction status endpoint

```typescript
const status = await fetch(
  `${network.coreApiUrl}/extended/v1/tx/${txId}`
);
```

### Insufficient Balance Error

**Symptoms**: ERR-INSUFFICIENT-BALANCE (105)

**Solutions**:
1. Check wallet balance
2. Add funds to wallet
3. Reduce stake amount
4. Account for transaction fees

### Market Not Found

**Symptoms**: ERR-MARKET-NOT-FOUND (101)

**Solutions**:
1. Verify market ID
2. Check market exists
3. Ensure correct network

### Rate Limit Exceeded

**Symptoms**: 429 Too Many Requests

**Solutions**:
1. Implement backoff
2. Cache responses
3. Reduce request frequency
4. Check rate limit headers

## Debugging

### Enable Verbose Logging

```typescript
const DEBUG = true;

async function debugFetch(url, options) {
  if (DEBUG) {
    console.log('Request:', url, options);
  }
  
  const response = await fetch(url, options);
  
  if (DEBUG) {
    console.log('Response:', response.status);
  }
  
  return response;
}
```

### Inspect Transaction Details

```typescript
async function inspectTransaction(txId) {
  const url = `${network.coreApiUrl}/extended/v1/tx/${txId}`;
  const response = await fetch(url);
  const data = await response.json();
  
  console.log('Status:', data.tx_status);
  console.log('Result:', data.tx_result);
  console.log('Fee:', data.fee_rate);
  console.log('Nonce:', data.nonce);
  
  return data;
}
```

## Getting Help

1. Check documentation
2. Search GitHub issues
3. Ask on Discord
4. Contact support
