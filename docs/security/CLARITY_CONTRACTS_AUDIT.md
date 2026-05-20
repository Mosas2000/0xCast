# Clarity Smart Contract Security Audit Checklist

Clarity is a decidable, non-Turing complete smart contract language designed specifically for the Stacks blockchain. While its design prevents several classes of vulnerabilities (such as reentrancy via dynamic call stacks), specific programming patterns can still introduce logical exploits, lock-up states, or authentication bypasses.

Use this checklist during manual peer reviews and formal security audits of all Clarity contracts in the `0xCast` codebase.

---

## 1. Authentication and Authorization Controls

### `tx-sender` vs `contract-caller` Analysis
* [ ] **Verify usage intent**: Assess all instances where authorization checks are made.
  * Use `contract-caller` for authenticating the immediate caller of the function. This prevents "phishing" attacks where a malicious contract calls your contract on behalf of a user who interacted with it.
  * Use `tx-sender` only when you explicitly need to refer to the original transaction signer, such as transferring tokens from the original initiator.
* [ ] **Avoid authorization with `tx-sender`**: Ensure `tx-sender` is never used directly for access control checks (e.g., `asserts! (is-eq tx-sender admin) ...` is highly discouraged unless paired with trait verification or strictly intended for multi-sig interactions).

### Administrative and Governance Modifiers
* [ ] **Authorized state transitions**: Ensure functions that update protocol parameters (e.g., dispute periods, transaction fee splits) are strictly gated using role check assertions.
* [ ] **Revocable administrative rights**: Verify that roles are transferable and can be revoked.
* [ ] **Emergency suspension mechanics**: Ensure the contract contains emergency stop protocols (`pause` / `resume`) and that these gated states are tested under suspended conditions.

---

## 2. Token Transfers and Asset Security

### Checked Returns
* [ ] **Transfer outputs**: Verify that all Stacks token transfers (`stx-transfer?`), FT transfers (`ft-transfer?`), and NFT transfers (`nft-transfer?`) have their return values evaluated.
  * Use `try!` or `unwrap!` to enforce that execution halts if a transfer fails.
  * *Incorrect*: `(stx-transfer? amount tx-sender receiver)`
  * *Correct*: `(try! (stx-transfer? amount tx-sender receiver))`

### Mathematical Precision and Limits
* [ ] **Division before multiplication**: Ensure all arithmetic calculations perform multiplications before division to prevent integer truncation precision loss.
* [ ] **Overflow / Underflow boundaries**: Though Clarity automatically aborts the transaction on overflows, ensure boundary parameters are checked to avoid early execution failures on large inputs.
* [ ] **Unbounded loops/maps**: Check that iteration boundaries (if simulated) or multi-contract calls do not hit execution cost limits (exceeded runtime budget).

---

## 3. Data Storage and Map Verification

### Map Mutations
* [ ] **Unchecked inserts**: Verify that `map-insert` and `map-set` return values are appropriately handled when critical. Note that `map-insert` returns `false` if the key already exists; ensure you do not overwrite existing data accidentally.
* [ ] **Deletion bounds**: Ensure `map-delete` actions correctly clean up associated state fields to avoid memory leaks or orphaned references.
* [ ] **Existence checks**: Ensure `map-get?` lookups are properly unwrapped with clear default fallback cases or descriptive assertions.

### Read-Only Misconfigurations
* [ ] **No state mutations**: Verify that read-only functions are pure and do not depend on transient states that can be manipulated in the same block.
* [ ] **Return values**: Ensure read-only functions return clear, unambiguous response types (like `bool` or options) rather than bloated data types that can confuse downstream integrators.

---

## 4. Oracles and Time Boundaries

### Block Height Assumptions
* [ ] **`block-height` vs `burn-block-height`**: Stacks block heights can sometimes experience minor re-orgs or fast-blocks. Make sure time-critical protocol gates use `burn-block-height` (Bitcoin block height) for reliable consensus time tracking, or explicitly justify why Stacks `block-height` is preferred.
* [ ] **Time lock windows**: Check that lockups, dispute windows, and resolution dates have sufficient safety margins (e.g., 24-48 hours minimum) to tolerate Stacks anchor block delays.

### Oracle Data Freshness
* [ ] **Oracle signatures verification**: Ensure that feeds originating outside Stacks are properly authenticated with cryptographic signature checks.
* [ ] **Staleness threshold**: Prevent stale price feeds from resolving markets by validating the block timestamp or height associated with the payload.

---

## 5. Anti-Patterns Quick Reference

Avoid these common Clarity anti-patterns:

| Anti-Pattern | Severity | Exploit / Impact | Recommended Alternative |
|:---|:---|:---|:---|
| Unprotected `tx-sender` in `asserts!` | **High** | Privilege bypass through malicious intermediary contracts. | Use `contract-caller` for access checks. |
| Ignored `try!` on `stx-transfer?` | **Medium** | Logical success state recorded without funds actually moving. | Wrap all token transfers in `try!` or `unwrap!`. |
| Unverified Trait parameters | **High** | Attacker passes in spoofed contract traits mimicking standard behaviour. | Bind trait implementations using `asserts! (is-eq contract-caller standard-trait-address)`. |
| Excessive state maps in single loop | **Low** | Transaction aborts due to runtime cost threshold exceeded. | Paginate data requests or batch operations. |
