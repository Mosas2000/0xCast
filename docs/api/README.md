# 0xCast API Documentation

## Overview

Welcome to the 0xCast API documentation. This documentation provides comprehensive information about interacting with the 0xCast prediction market platform.

## Quick Links

- [OpenAPI Specification](./openapi.yaml)
- [Swagger UI](./swagger-ui.html)
- [Contract Functions](./contract-functions.md)
- [Integration Guide](./integration-guide.md)
- [Webhook Events](./webhooks.md)

## Code Examples

- [JavaScript/TypeScript](./examples/javascript.md)
- [Python](./examples/python.md)

## Getting Started

### 1. Choose Your Network

```typescript
import { StacksTestnet, StacksMainnet } from '@stacks/network';

const network = new StacksTestnet();
```

### 2. Configure Contract Details

```typescript
const contractAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
const contractName = 'oxcast';
```

### 3. Read Market Data

```typescript
import { fetchCallReadOnlyFunction, uintCV } from '@stacks/transactions';

const result = await fetchCallReadOnlyFunction({
  network,
  contractAddress,
  contractName,
  functionName: 'get-market',
  functionArgs: [uintCV(1)],
  senderAddress: contractAddress,
});
```

### 4. Write Transactions

```typescript
import { makeContractCall, broadcastTransaction } from '@stacks/transactions';

const transaction = await makeContractCall({
  contractAddress,
  contractName,
  functionName: 'stake-yes',
  functionArgs: [uintCV(1), uintCV(1000000)],
  senderKey: privateKey,
  network,
});

const response = await broadcastTransaction(transaction, network);
```

## API Endpoints

### Read-Only Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| get-market | Get market data | market-id |
| get-user-stake | Get user's stake | market-id, user |
| get-market-count | Get total markets | - |
| get-contract-owner | Get contract owner | - |

### Public Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| create-market | Create new market | question, end-date, category |
| stake-yes | Stake on YES | market-id, amount |
| stake-no | Stake on NO | market-id, amount |
| claim-winnings | Claim winnings | market-id |
| resolve-market | Resolve market | market-id, outcome |

## Authentication

Most read operations don't require authentication. Write operations require:

1. A Stacks wallet with STX balance
2. Private key for signing transactions
3. Sufficient STX for transaction fees

## Rate Limits

- Read operations: 100 requests per minute
- Write operations: 10 transactions per minute
- Webhook deliveries: 1000 per hour

## Error Handling

All errors follow this format:

```json
{
  "error": "ERR-MARKET-NOT-FOUND",
  "message": "Market with ID 1 does not exist"
}
```

Common error codes:

- `ERR-NOT-AUTHORIZED` (100)
- `ERR-MARKET-NOT-FOUND` (101)
- `ERR-MARKET-ENDED` (102)
- `ERR-MARKET-RESOLVED` (103)
- `ERR-INVALID-AMOUNT` (104)
- `ERR-INSUFFICIENT-BALANCE` (105)

## Best Practices

1. **Use Testnet First**: Always test on testnet before mainnet
2. **Handle Errors**: Implement proper error handling
3. **Monitor Transactions**: Wait for confirmation
4. **Validate Inputs**: Check parameters before submission
5. **Secure Keys**: Never expose private keys
6. **Use Post Conditions**: Protect against unexpected behavior
7. **Cache Data**: Cache read-only data to reduce API calls

## Support

- GitHub Issues: [github.com/0xcast/issues](https://github.com/0xcast/issues)
- Discord: [discord.gg/0xcast](https://discord.gg/0xcast)
- Email: support@0xcast.com

## Contributing

We welcome contributions to improve this documentation. Please submit pull requests to our GitHub repository.

## License

This documentation is licensed under MIT License.
