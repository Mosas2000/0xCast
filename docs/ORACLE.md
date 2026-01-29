# Oracle System Documentation

## Overview

The 0xCast oracle system bridges the gap between the Stacks blockchain and real-world events. It provides a reliable mechanism for resolving prediction markets and ensuring data integrity through a dispute and reputation system.

## Components

### 1. Oracle Integration (`oracle-integration.clar`)

The core contract for submitting market results and managing disputes.

**Key Features:**
- **Oracle Registration:** Only authorized oracles can submit results.
- **Resolution Period:** Results are submitted with a mandatory dispute window.
- **Dispute Mechanism:** Any user can dispute a result within the window.
- **Admin Oversight:** Contract owner acts as the final arbiter in disputes.

**Parameters:**
- **Dispute Period:** 144 blocks (~24 hours).
- **Oracle Fee:** 5 STX (reward for resolution).

### 2. Oracle Reputation (`oracle-reputation.clar`)

Tracks the historical performance and reliability of registered oracles.

**Scoring Mechanics:**
- **Base Reputation:** 100 points.
- **Success Bonus:** +10 points for successful resolution.
- **Dispute Penalty:** -50 points for overturned resolutions.
- **Reliability:** Tracking success rate over time.

## Oracle Workflow

### 1. Registration
The project owner registers a trusted oracle address.
```clarity
(contract-call? .oracle-integration register-oracle 'ST1ORACLE...)
```

### 2. Market Resolution
When an event concludes, the oracle submits the result.
```clarity
(contract-call? .oracle-integration submit-resolution u1 u1) ;; u1: YES
```

### 3. Dispute Window
The market enters a "Pending Resolution" state for 144 blocks. Users can verify the result off-chain.

### 4. Optional Dispute
If the result is incorrect, anyone can trigger a dispute.
```clarity
(contract-call? .oracle-integration dispute-resolution u1)
```

### 5. Final Settlement
- If no dispute: Result becomes final after 144 blocks.
- If disputed: Admin settles the dispute with a final result.

## Integration Guide

To integrate with the oracle system in your market contracts:
1. Check `get-market-resolution` for the final result.
2. Ensure the `dispute-end` block has passed or the dispute is resolved.

## Future Roadmap
- [ ] Multi-oracle consensus (3 out of 5 agreement).
- [ ] Stake-based oracles (bonding STX to resolve).
- [ ] Fully decentralized dispute court (governance-led).
- [ ] Integration with decentralized price feeds (e.g., Pyth, RedStone).

## Testing
Run the oracle test suite:
```bash
npm test tests/oracle.test.ts
```
