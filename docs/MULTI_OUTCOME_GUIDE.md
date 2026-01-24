# Multi-Outcome Markets Guide

## Overview
This guide explains the new multi-outcome market feature in 0xCast.

## Key Differences from Binary Markets
1. **Multiple outcomes** instead of just YES/NO
2. **Index-based staking** - stake on outcome by index (0-9)
3. **Proportional odds** - odds calculated across all outcomes
4. **Winner-take-all** - only winning outcome gets payouts

## Contract Functions

### create-multi-market
Creates a new multi-outcome market.

**Parameters:**
- `question` - Market question (max 256 chars)
- `outcomes` - List of 3-10 outcome names (max 100 chars each)
- `end-date` - Block height when trading ends
- `resolution-date` - Block height when can resolve

**Returns:**
- Success: Market ID (uint)
- Errors:
  - `u104` - Insufficient outcomes (less than 3)
  - `u105` - Too many outcomes (more than 10)
  - `u106` - Invalid dates (end-date after resolution-date)
  - `u107` - End date in the past

**Example:**
```clarity
(contract-call? .market-multi create-multi-market
  u"Who will win 2026 NBA Championship?"
  (list u"Lakers" u"Celtics" u"Nuggets" u"Warriors" u"Other")
  u6050000  ;; end-date (block height)
  u6055000  ;; resolution-date
)
```

### stake-on-outcome
Stake STX on specific outcome.

**Parameters:**
- `market-id` - Market identifier
- `outcome-index` - Index of outcome (0-9)
- `amount` - Amount in microSTX

**Returns:**
- Success: `true`
- Errors:
  - `u101` - Market not found
  - `u102` - Invalid outcome index
  - `u103` - Market ended
  - `u108` - Market not active
  - `u109` - Invalid amount (zero or negative)

**Example:**
```clarity
(contract-call? .market-multi stake-on-outcome
  u1           ;; market-id
  u0           ;; outcome-index (first outcome)
  u1000000     ;; 1 STX in microSTX
)
```

### resolve-multi-market
Resolve market with winning outcome (creator only).

**Parameters:**
- `market-id` - Market identifier
- `winning-outcome-index` - Index of winning outcome

**Returns:**
- Success: `true`
- Errors:
  - `u100` - Not authorized (caller not creator)
  - `u101` - Market not found
  - `u102` - Invalid outcome index
  - `u110` - Resolution date not reached
  - `u111` - Market already resolved

**Example:**
```clarity
(contract-call? .market-multi resolve-multi-market
  u1  ;; market-id
  u2  ;; winning-outcome-index
)
```

### claim-multi-winnings
Claim winnings if you staked on winning outcome.

**Parameters:**
- `market-id` - Market identifier
- `outcome-index` - Index you staked on

**Returns:**
- Success: Payout amount (uint)
- Errors:
  - `u101` - Market not found
  - `u112` - No position found
  - `u113` - Market not resolved
  - `u114` - Market not resolved
  - `u115` - Not the winning outcome
  - `u116` - Already claimed
  - `u117` - No stake to claim

**Example:**
```clarity
(contract-call? .market-multi claim-multi-winnings
  u1  ;; market-id
  u2  ;; outcome-index
)
```

## Read-Only Functions

### get-multi-market
Get market details.

**Parameters:**
- `market-id` - Market identifier

**Returns:**
- Optional market tuple with all details

**Example:**
```clarity
(contract-call? .market-multi get-multi-market u1)
```

### get-user-multi-position
Get user's position in a market.

**Parameters:**
- `market-id` - Market identifier
- `user` - Principal address
- `outcome-index` - Outcome index

**Returns:**
- Optional position tuple with stake and claimed status

**Example:**
```clarity
(contract-call? .market-multi get-user-multi-position
  u1
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
  u0
)
```

### get-outcome-odds
Calculate odds for a specific outcome.

**Parameters:**
- `market-id` - Market identifier
- `outcome-index` - Outcome index

**Returns:**
- Odds in basis points (0-10000, where 10000 = 100%)

**Example:**
```clarity
(contract-call? .market-multi get-outcome-odds u1 u0)
;; Returns u6000 for 60%
```

## Frontend Integration

### Components

#### MultiOutcomeCard
Display a multi-outcome market with all outcomes and odds.

**Props:**
- `market` - MultiMarket object
- `onRefresh` - Optional callback after staking

#### MultiOutcomeStakeModal
Modal for staking on a specific outcome.

**Props:**
- `market` - MultiMarket object
- `outcomeIndex` - Index to stake on
- `isOpen` - Modal visibility
- `onClose` - Close callback
- `onSuccess` - Success callback

### Hooks

#### useMultiMarket
Fetch and track a multi-outcome market.

**Parameters:**
- `marketId` - Market ID to fetch

**Returns:**
```typescript
{
  market: MultiMarket | null,
  isLoading: boolean,
  error: string | null,
  refetch: () => void
}
```

## Payout Calculation

The payout is calculated proportionally based on:

1. **User's stake** on winning outcome
2. **Total stake** on winning outcome
3. **Total pool** across all outcomes

**Formula:**
```
payout = (user_stake / winning_outcome_total) * total_pool
```

**Example:**
- Total pool: 10 STX
- Outcome A: 6 STX (winner)
- Outcome B: 4 STX
- User staked 3 STX on A

User's payout: `(3 / 6) * 10 = 5 STX`

## Testing

Run tests:
```bash
npm test tests/market-multi.test.ts
```

Check contract syntax:
```bash
clarinet check
```

## Deployment

Deploy contract:
```bash
clarinet deploy --network testnet
```

For mainnet:
```bash
clarinet deploy --network mainnet
```

## Best Practices

1. **Always validate outcome index** - Must be less than outcome-count
2. **Check market status** before staking - Only stake on active markets
3. **Verify resolution date** before resolving - Can only resolve after resolution-date
4. **Claim promptly** - Winners should claim as soon as market resolves
5. **Test on testnet first** - Always test new markets on testnet

## Error Codes Reference

| Code | Constant | Description |
|------|----------|-------------|
| u100 | ERR-NOT-AUTHORIZED | Caller not authorized |
| u101 | ERR-MARKET-NOT-FOUND | Market doesn't exist |
| u102 | ERR-INVALID-OUTCOME | Invalid outcome index |
| u103 | ERR-MARKET-ENDED | Trading has ended |
| u104 | ERR-INSUFFICIENT-OUTCOMES | Less than 3 outcomes |
| u105 | ERR-TOO-MANY-OUTCOMES | More than 10 outcomes |
| u106 | - | Invalid date ordering |
| u107 | - | End date in past |
| u108 | - | Market not active |
| u109 | - | Invalid amount |
| u110 | - | Resolution date not reached |
| u111 | - | Already resolved |
| u112 | - | No position found |
| u113 | - | Market not resolved |
| u114 | - | Market not resolved |
| u115 | - | Wrong outcome |
| u116 | - | Already claimed |
| u117 | - | No stake to claim |

## Support

For issues or questions, please open an issue on GitHub.
