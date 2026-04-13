# API Reference

## Network endpoints used by frontend

Configured in `frontend/src/config/network.ts`:

### Mainnet

- Node API: `https://stacks-node-api.mainnet.stacks.co`
- Hiro API: `https://api.mainnet.hiro.so`
- Explorer: `https://explorer.hiro.so`

### Testnet

- Node API: `https://stacks-node-api.testnet.stacks.co`
- Hiro API: `https://api.testnet.hiro.so`
- Explorer: `https://explorer.hiro.so?chain=testnet`

## Read-only contract call pattern

Used in hooks such as `useMarkets`, `useMultiMarkets`, `useContractPause`:

- Library call: `fetchCallReadOnlyFunction(...)`
- Underlying endpoint pattern:
  - `POST /v2/contracts/call-read/{contractAddress}/{contractName}/{functionName}`

Typical request body (Node API style):

```json
{
  "sender": "ST...",
  "arguments": ["0x..."]
}
```

Typical response shape:

```json
{
  "okay": true,
  "result": "0x..."
}
```

The frontend decodes Clarity values with `cvToJSON` or `cvToValue`.

## Transaction submission pattern

Used in write hooks (`useStake`, `useMarketCreation`, `useGovernanceActions`, `useLiquidityActions`):

- `openContractCall({ contractAddress, contractName, functionName, functionArgs, postConditionMode, postConditions, ... })`

The wallet handles signing and broadcast.

## Additional Hiro API usage

- Latest block polling (`useGovernance`):
  - `GET https://api.hiro.so/extended/v1/block?limit=1`
- Realtime websocket URL (`utils/realtime.ts`):
  - `{baseUrl}/extended/v1/ws`

## Rate limit and reliability guidance

- Public Hiro endpoints can be rate-limited under load.
- Recommended:
  - Cache repeated reads client-side.
  - Avoid aggressive polling intervals.
  - Retry transient failures with backoff where appropriate.
