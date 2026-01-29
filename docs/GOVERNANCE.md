# Governance System Documentation

## Overview

The 0xCast governance system enables decentralized decision-making for the platform through a token-based voting mechanism. Token holders can create proposals, vote on changes, and execute approved governance actions.

## Components

### 1. Governance Token (`governance-token.clar`)

A SIP-010 compliant fungible token that represents voting power in the 0xCast ecosystem.

**Key Features:**
- **Token Symbol:** CAST
- **Decimals:** 6
- **Max Supply:** 1,000,000,000 (1 billion tokens)
- **Initial Supply:** 100,000,000 (100 million tokens)

**Functions:**
- Standard SIP-010 functions (transfer, get-balance, etc.)
- `mint`: Owner can mint new tokens (up to max supply)
- `burn`: Token holders can burn their tokens
- `delegate-voting-power`: Delegate voting power to another address
- `revoke-delegation`: Remove voting power delegation
- `get-voting-power`: Get effective voting power (including delegations)

### 2. Governance Core (`governance-core.clar`)

The main governance contract that handles proposal creation, voting, and execution.

**Governance Parameters:**
- **Proposal Threshold:** 1,000,000 CAST tokens required to create a proposal
- **Quorum:** 10% of total supply must vote for a proposal to pass
- **Voting Period:** ~10 days (1,440 blocks)
- **Timelock Period:** ~1 day (144 blocks) after proposal passes before execution
- **Execution Window:** ~10 days (1,440 blocks) to execute after timelock

**Proposal Lifecycle:**

```
Pending → Active → Succeeded/Defeated → Queued → Executed
                                     ↓
                                 Cancelled
```

1. **Pending:** Proposal created, waiting for voting to start
2. **Active:** Voting period is open
3. **Succeeded:** Proposal passed quorum and has majority support
4. **Defeated:** Proposal failed to meet quorum or majority
5. **Queued:** Successful proposal in timelock period
6. **Executed:** Proposal executed after timelock
7. **Cancelled:** Proposal cancelled by proposer or admin

**Vote Types:**
- `0`: Against
- `1`: For
- `2`: Abstain

## Usage Examples

### Creating a Proposal

```clarity
(contract-call? .governance-core create-proposal
  u"Increase Market Creation Fee"
  u"This proposal suggests increasing the market creation fee from 10 STX to 20 STX")
```

### Voting on a Proposal

```clarity
;; Vote FOR (1)
(contract-call? .governance-core cast-vote u1 u1)

;; Vote AGAINST (0)
(contract-call? .governance-core cast-vote u1 u0)

;; Vote ABSTAIN (2)
(contract-call? .governance-core cast-vote u1 u2)
```

### Queuing a Successful Proposal

```clarity
(contract-call? .governance-core queue-proposal u1)
```

### Executing a Proposal

```clarity
(contract-call? .governance-core execute-proposal u1)
```

### Delegating Voting Power

```clarity
;; Delegate to another address
(contract-call? .governance-token delegate-voting-power 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

;; Revoke delegation
(contract-call? .governance-token revoke-delegation)
```

## Security Considerations

1. **Timelock Protection:** All governance actions have a mandatory timelock period to allow the community to react to malicious proposals.

2. **Proposal Threshold:** Prevents spam proposals by requiring significant token holdings.

3. **Quorum Requirements:** Ensures proposals have sufficient community participation.

4. **Delegation System:** Allows token holders to delegate voting power while maintaining token ownership.

5. **Cancellation Rights:** Proposers and admins can cancel proposals before execution.

## Integration with 0xCast

The governance system can control various aspects of the 0xCast platform:

- Market creation fees
- Platform fee percentages
- Oracle parameters
- Contract upgrades
- Treasury management
- Emergency actions

## Future Enhancements

- [ ] Proposal execution with contract calls
- [ ] Multi-signature requirements for critical actions
- [ ] Voting power snapshots at specific blocks
- [ ] Proposal categories with different parameters
- [ ] Reputation-weighted voting
- [ ] Quadratic voting mechanisms
- [ ] Governance rewards for participation

## Testing

Run the governance test suite:

```bash
npm test tests/governance.test.ts
```

The test suite covers:
- SIP-010 compliance
- Token transfers and minting
- Voting power delegation
- Proposal lifecycle
- Voting mechanics
- Timelock enforcement
- Parameter updates

## Governance Best Practices

1. **Research Before Voting:** Understand the implications of each proposal
2. **Participate Actively:** Vote on proposals to ensure your voice is heard
3. **Delegate Wisely:** If delegating, choose representatives who align with your values
4. **Monitor Proposals:** Stay informed about upcoming and active proposals
5. **Respect the Timelock:** Use the timelock period to verify proposal details

## Contact & Support

For questions about governance:
- Review proposal discussions in the community forum
- Check the governance dashboard for active proposals
- Consult the technical documentation for integration details
