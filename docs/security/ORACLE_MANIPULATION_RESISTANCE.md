# Oracle Manipulation Resistance Checklist

Prediction markets rely heavily on high-fidelity, tamper-resistant data feeds to resolve market conditions. Manipulating an oracle feed is one of the most common vectors for stealing assets in decentralized finance. 

Use this checklist to analyze and audit the oracle interfaces, registration schemes, consensus mechanisms, and dispute workflows in `0xCast`.

---

## 1. Cryptographic and Registration Controls

### Signature Authenticity
* [ ] **Public Key Verification**: Verify that every external oracle payload is verified against a registered oracle public key before processing resolution commands.
* [ ] **Oracle Identity Controls**: Ensure only the protocol owner or governance mechanism can register or deregister oracle identities.
* [ ] **Revocation safety**: Confirm that removing an oracle from the registry immediately nullifies any pending data feeds signed by that oracle.

### Secure Transport and Data Feeds
* [ ] **Cryptographic payload binding**: If off-chain data is signed, ensure it includes unique market IDs, sequence counts (or timestamps), and chain IDs to prevent signature replay attacks across markets or test environments.

---

## 2. Price Feed and Outcome Manipulation Defense

### Outlier and Deviation Gating
* [ ] **Divergence thresholds**: When resolving financial asset-based markets (e.g. STX/USD price), ensure the contract or oracle processor checks the incoming price against a moving average or historical benchmark.
* [ ] **Extreme values handling**: Ensure the system rejects price submissions that diverge by more than a predefined threshold (e.g. >20% deviation) in a single block, flag them as anomalies, and trigger manual review.

### Multiple Data Feeds and Consensus
* [ ] **Multi-oracle aggregation**: Ensure prediction resolutions do not rely on a single registered oracle where possible.
* [ ] **Consensus mechanics**: Validate that resolving critical markets requires consensus from multiple registered oracles (e.g. median of 3 independent sources).

---

## 3. Staleness and Inactivity Protection

### Timestamp Checks
* [ ] **Maximum feed age**: Ensure all signed payloads contain a timestamp or block height. Reject payloads older than a safe threshold (e.g. 10 minutes or 1 bitcoin block height) to prevent historical state replay.
* [ ] **Grace periods**: Verify that when oracle feeds fail to update (e.g. due to Stacks network congestion or oracle offline status), a grace period is initiated, followed by fallback options (such as manual governance resolution).

---

## 4. Resolution Gating and Dispute Workflows

### Dispute Period Margin
* [ ] **Adequate dispute periods**: Confirm that once an oracle resolves a market, funds are locked in the contract for a mandatory dispute period (e.g. 144 blocks or ~24 hours).
* [ ] **Mark-Disputed accessibility**: Ensure that any user (or gated role) can dispute an incorrect resolution if they supply a dispute fee or security bond, preventing instantaneous payout routing of manipulated feeds.

### Finalization Security
* [ ] **Enforce finalization gate**: Verify that `claim-winnings` cannot be called until the dispute period has elapsed AND the market has been explicitly finalized without active disputes.
* [ ] **Dispute resolution paths**: Confirm that when a market is marked disputed, only a high-privilege dispute resolver role or DAO vote can provide the final resolution and unlock payout claims.

---

## 5. Threat Vectors and Testing Matrix

Use this matrix to execute mock attack scenarios:

| Threat Vector | Mechanism of Attack | Countermeasure | Test Case File |
|:---|:---|:---|:---|
| **Stale Replay Attack** | Replaying an old signature containing low price after price increases. | Payload contains unique block-height/timestamp check. | `tests/oracle-manipulation-resistance.test.ts` |
| **Oracle Phishing** | Registering a rogue oracle through access bypass. | Restrict oracle registration strictly to multi-sig governance. | `tests/oracle.test.ts` |
| **Divergent Feeding** | Feeding a heavily manipulated extreme price to skew outcomes. | Implement value checking and sanity limits in client/contracts. | `tests/oracle-manipulation-resistance.test.ts` |
| **Instant Claim Bypass** | Claiming payout immediately before dispute can be filed. | Enforce minimum 144 blocks dispute locking period. | `tests/security-edge-cases.test.ts` |
