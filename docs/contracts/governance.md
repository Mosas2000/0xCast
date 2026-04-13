# governance-core Contract API

`governance-core.clar` manages proposal lifecycle, voting, queueing, and execution.

## Read-only functions

| Function | Parameters | Returns |
|---|---|---|
| `get-proposal` | `proposal-id: uint` | `(optional proposal)` |
| `get-vote` | `proposal-id: uint, voter: principal` | `(optional vote)` |
| `has-voted` | `proposal-id: uint, voter: principal` | `bool` |
| `get-proposal-count` | none | `uint` |
| `get-governance-parameters` | none | params tuple |
| `get-proposal-state` | `proposal-id: uint` | `(ok status)` or error |

## Public functions

| Function | Parameters | Returns | Authorization |
|---|---|---|---|
| `create-proposal` | `title: string-utf8(256), description: string-utf8(1024)` | `(ok proposal-id)` | Any principal |
| `cast-vote` | `proposal-id: uint, vote-type: uint` | `(ok true)` | Eligible voter |
| `queue-proposal` | `proposal-id: uint` | `(ok true)` | Any principal |
| `execute-proposal` | `proposal-id: uint` | `(ok true)` | Any principal |
| `cancel-proposal` | `proposal-id: uint` | `(ok true)` | Proposer or contract owner |
| `update-governance-parameters` | `new-threshold, new-quorum, new-voting-period, new-timelock` | `(ok true)` | Contract owner |

## Vote types and statuses

- Vote type: `u0 = against`, `u1 = for`, `u2 = abstain`
- Status constants include: pending, active, succeeded, defeated, queued, executed, cancelled

## Frontend integration

- Read layer: `useGovernance`
- Write layer: `useGovernanceActions`
- Core transactions use `openContractCall` from `@stacks/connect`
