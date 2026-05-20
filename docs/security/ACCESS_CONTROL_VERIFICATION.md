# Access Control and Privilege Verification Checklist

Security audits on access control ensure that only authenticated, properly authorized accounts can perform highly privileged operations. Bypassing access controls can result in protocol-wide drainage of funds, unauthorized market resolutions, or disruption of oracle feeds.

Use this verification checklist to validate the logical and functional access boundaries in 0xCast's Clarity contracts.

---

## 1. Owner-Only and Privileged Actions

### Contract Deployer Boundaries
* [ ] **Limit deployer powers**: Ensure the default deployer principal is not hardcoded permanently as the only administrative authority, unless paired with a transition-to-governance or transition-to-multisig plan.
* [ ] **Review governance hooks**: Verify that any `is-eq contract-caller deployer` check can be migrated to a governance-controlled contract or multi-signature DAO account.

### System-Wide Parameters
* [ ] **Gating administrative setters**: Confirm that changes to transaction fees, rewards percentages, and rate limiter settings are fully protected.
  * *Critical functions to audit*: `set-dispute-period`, `configure-oracle-source`, `register-oracle`, `set-fee-receiver`.

---

## 2. Role-Based Access Control (RBAC)

### Role Separation and Assignment
* [ ] **Privilege separation**: Ensure there is a clear division of roles within the governance core.
  * **Admin**: Responsible for setting contract upgrades, configuring constants, and managing users' roles.
  * **Oracle**: Responsible for publishing price/event feeds and resolving market states.
  * **Dispute Resolver**: Responsible for handling disputes and marking events as disputed or overridden.
* [ ] **Role inheritance/shadowing**: Verify that assigning one role does not implicitly or accidentally grant rights to other distinct roles.
* [ ] **Zero-address roles**: Check that roles cannot be assigned to an empty or default zero principal.

---

## 3. Migration and Upgradability Controls

### Migration Manager Audits
* [ ] **Upgrade authorization**: Ensure that only the governance contract or a multi-signature account can initiate a contract upgrade via the `migration-manager` contract.
* [ ] **State locks**: Verify that during a migration/upgrade phase, the old contract states are frozen to prevent double-spending or race conditions.
* [ ] **State verification after upgrade**: Audit the snapshot utility (`state-snapshot.clar`) to verify that imported states match historical values exactly before enabling active trading on the new version.

---

## 4. Emergency Controls (Circuit Breakers)

### Suspension Gating
* [ ] **Immediate suspension capability**: Confirm that emergency managers can halt trading or stakes placement immediately in case of active protocol compromise.
* [ ] **Gated public actions**: Ensure that when the protocol is in a "suspended" state, all state-changing public operations (e.g. `place-yes-stake`, `place-no-stake`, `create-market`) are completely blocked.
* [ ] **Recovery pathways**: Verify that the process for resuming normal operations requires multiple approvals or a distinct high-privilege governance vote.

---

## 5. Implementation Verification Sheet

Verify the access control configurations across the contract suite:

| Contract | Function | Intended Role | Verification Test ID |
|:---|:---|:---|:---|
| `access-control.clar` | `grant-role` | Admin Role | `AC-TEST-01` |
| `market-core.clar` | `oracle-resolve` | Registered Oracle | `AC-TEST-02` |
| `oracle-integration.clar` | `register-oracle` | Deployer / Governance | `AC-TEST-03` |
| `migration-manager.clar` | `set-upgrade-contract` | Deployer / Governance | `AC-TEST-04` |
| `rate-limiter.clar` | `set-rate-limit` | Admin Role | `AC-TEST-05` |
| `referral-core.clar` | `set-referral-fee` | Admin Role | `AC-TEST-06` |
