# market-core Contract API

`market-core.clar` is the primary binary prediction market contract used by the frontend for market lifecycle and staking.

## Constants

- Outcomes: `OUTCOME-NONE (u0)`, `OUTCOME-YES (u1)`, `OUTCOME-NO (u2)`
- Statuses: `ACTIVE (u0)`, `RESOLVED (u1)`, `DISPUTED (u2)`, `REFUNDED (u3)`
- Categories: `CRYPTO (u1)`, `SPORTS (u2)`, `POLITICS (u3)`, `ECONOMICS (u4)`, `OTHER (u5)`

## Read-only functions

| Function | Parameters | Returns | Notes |
|---|---|---|---|
| `get-market-counter` | none | `uint` | Total markets created |
| `get-market` | `market-id: uint` | `(optional market)` | Returns market record |
| `get-user-position` | `market-id: uint, user: principal` | `(optional position)` | User YES/NO stake and claimed flag |
| `market-exists` | `market-id: uint` | `bool` | Existence check |
| `get-market-pool-size` | `market-id: uint` | `(response uint err)` | Total yes+no pool |
| `get-market-category-count` | `category: uint` | `uint` | Markets in category |
| `get-market-by-category` | `category: uint, index: uint` | `(optional {market-id: uint})` | Category index lookup |
| `get-dispute-period` | none | `uint` | Current dispute window |
| `get-resolution-deadline` | `market-id: uint` | `(response uint err)` | Deadline after which refunds apply |
| `is-contract-paused` | none | `bool` | Emergency pause status |
| `get-emergency-approval-threshold` | none | `uint` | Required signer approvals for pause or resume |
| `get-circuit-breaker-status` | none | tuple | Pause/resume state and approval counters |
| `get-circuit-breaker-log` | `log-id: uint` | `(optional log)` | Circuit breaker audit entry |
| `get-circuit-breaker-log-count` | none | `uint` | Number of stored audit entries |
| `get-abandonment-period` | none | `uint` | Resolution grace period |
| `is-market-abandoned` | `market-id: uint` | `bool` | Active + deadline exceeded |

## Public functions

### Market creation and staking

| Function | Parameters | Returns | Authorization |
|---|---|---|---|
| `create-market` | `question: string-ascii(256), end-date: uint, resolution-date: uint, category: uint` | `(ok market-id)` | Any principal |
| `place-yes-stake` | `market-id: uint, amount: uint` | `(ok true)` | Any principal |
| `place-no-stake` | `market-id: uint, amount: uint` | `(ok true)` | Any principal |

> `create-market`, `place-yes-stake`, and `place-no-stake` are blocked when contract pause is enabled.

### Resolution and payout

| Function | Parameters | Returns | Authorization |
|---|---|---|---|
| `resolve-market` | `market-id: uint, outcome: uint` | `(ok true)` | Market creator |
| `claim-winnings` | `market-id: uint` | `(ok payout)` | Position holder |
| `oracle-resolve` | `market-id: uint, outcome: uint` | `(ok true)` | `oracle-integration` contract |
| `mark-disputed` | `market-id: uint` | `(ok true)` | `oracle-integration` contract |
| `resolve-after-dispute` | `market-id: uint, outcome: uint` | `(ok true)` | `oracle-integration` contract |
| `finalize-market` | `market-id: uint` | `(ok true)` | Any principal |
| `community-resolve` | `market-id: uint, outcome: uint` | `(ok true)` | `oracle-integration` contract |

### Refund and safety controls

| Function | Parameters | Returns | Authorization |
|---|---|---|---|
| `trigger-auto-refund` | `market-id: uint` | `(ok true)` | Any principal |
| `emergency-refund` | `market-id: uint` | `(ok refunded-amount)` | Position holder |
| `admin-force-refund` | `market-id: uint` | `(ok true)` | Market creator |
| `claim-refund` | `market-id: uint` | `(ok refunded-amount)` | Position holder |
| `set-emergency-approver` | `approver: principal, enabled: bool` | `(ok true)` | Contract owner |
| `set-emergency-approval-threshold` | `threshold: uint` | `(ok uint)` | Contract owner |
| `approve-emergency-pause` | `reason: string-ascii(128)` | `(ok true)` | Emergency signer |
| `approve-emergency-resume` | `reason: string-ascii(128)` | `(ok true)` | Emergency signer |
| `set-contract-paused` | `paused: bool` | `(ok true)` | Contract owner |
| `set-dispute-period` | `new-period: uint` | `(ok bool)` | `oracle-integration` contract |

> `set-contract-paused` now starts the multi-sig approval flow instead of toggling the pause state immediately. Trading and market creation are blocked only after the configured approval threshold is met. Claims and refunds remain available during pause.

## Core frontend mappings

 `get-market-counter`, `get-market`
 `place-yes-stake`, `place-no-stake`
 `is-contract-paused`
 `claim-winnings`
 `claim-refund`
