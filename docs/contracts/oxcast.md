# oxcast Contract API

`oxcast.clar` is the MVP combined contract with SIP-010 token behavior, staking, and binary market operations.

## Token (SIP-010)

### Read-only

| Function | Parameters | Returns |
|---|---|---|
| `get-name` | none | `(ok "0xCast Token")` |
| `get-symbol` | none | `(ok "OXC")` |
| `get-decimals` | none | `(ok u6)` |
| `get-balance` | `account: principal` | `(ok uint)` |
| `get-total-supply` | none | `(ok uint)` |
| `get-token-uri` | none | `(ok (optional string-utf8))` |

### Public

| Function | Parameters | Returns | Authorization |
|---|---|---|---|
| `transfer` | `amount, sender, recipient, memo` | `(ok true)` | `tx-sender == sender` |
| `mint` | `amount, recipient` | `response` | Contract owner |
| `burn` | `amount` | `response` | Token holder |

## Staking

| Function | Parameters | Returns |
|---|---|---|
| `get-stake` | `staker: principal` | stake record |
| `get-total-staked` | none | `(ok uint)` |
| `stake` | `amount: uint` | `(ok true)` |
| `unstake` | `amount: uint` | `(ok true)` |

## Market functions

| Function | Parameters | Returns |
|---|---|---|
| `get-market` | `market-id: uint` | `(optional market)` |
| `get-market-count` | none | `uint` |
| `get-position` | `market-id: uint, user: principal` | position record |
| `get-fee-pool` | none | `uint` |
| `create-market` | `question: string-ascii(256), duration-blocks: uint` | `(ok market-id)` |
| `predict` | `market-id: uint, outcome: uint, amount: uint` | `(ok true)` |
| `resolve-market` | `market-id: uint, outcome: uint` | `(ok true)` |
| `claim-winnings` | `market-id: uint` | `(ok payout)` |
| `cancel-market` | `market-id: uint` | `(ok true)` |
| `claim-refund` | `market-id: uint` | `(ok refund)` |
| `withdraw-fees` | none | `(ok fees)` |

## Notes

- Uses STX transfer for prediction positions.
- Maintains separate `fee-pool` for platform fee accounting.
- This contract remains available for MVP compatibility, while production binary market UX uses `market-core`.
