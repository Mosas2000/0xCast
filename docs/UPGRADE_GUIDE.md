# Contract Upgrade Guide

## Prerequisites

- Contract owner access
- Wallet connected
- New implementation deployed
- Migration scripts prepared
- State snapshot created

## Step-by-Step Upgrade Process

### Step 1: Prepare New Implementation

1. Develop and test new contract version
2. Deploy to testnet
3. Verify functionality
4. Deploy to mainnet
5. Note the contract address

### Step 2: Create State Snapshot

```typescript
const { createSnapshot, generateStateHash } = useStateSnapshot(snapshotContract);

const currentState = {
  markets: await getMarkets(),
  users: await getUsers(),
  balances: await getBalances(),
};

const stateHash = generateStateHash(currentState);
const dataSize = JSON.stringify(currentState).length;

await createSnapshot(
  stateHash,
  dataSize,
  `Pre-upgrade snapshot for v${newVersion}`
);
```

### Step 3: Register Migration

```typescript
const { registerMigration } = useMigration(migrationContract);

const migrationHash = generateMigrationHash(migrationData);
const migrationSize = calculateMigrationSize(migrationData);

await registerMigration(
  newVersion,
  'Upgrade to add new features',
  migrationHash,
  migrationSize,
  true
);
```

### Step 4: Propose Upgrade

```typescript
const { proposeUpgrade } = useContractUpgrade(proxyContract);

await proposeUpgrade('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.new-implementation-v2');
```

### Step 5: Wait for Timelock

The upgrade cannot be executed until the timelock period expires. Default is 144 blocks (approximately 24 hours).

Monitor the pending upgrade:

```typescript
const { getPendingUpgrade } = useContractUpgrade(proxyContract);

const pending = await getPendingUpgrade();
console.log('Timelock expires at block:', pending.timelockExpires);
```

### Step 6: Execute Upgrade

After timelock expires:

```typescript
const { executeUpgrade } = useContractUpgrade(proxyContract);

await executeUpgrade();
```

### Step 7: Execute Migration

```typescript
const { executeMigration } = useMigration(migrationContract);

await executeMigration(migrationId);
```

### Step 8: Verify Upgrade

1. Check new implementation is active
2. Test core functionality
3. Verify state integrity
4. Compare with snapshot
5. Monitor for errors

```typescript
const { getImplementation } = useContractUpgrade(proxyContract);
const { getCurrentVersion } = useMigration(migrationContract);

const impl = await getImplementation();
const version = await getCurrentVersion();

console.log('Current implementation:', impl);
console.log('Current version:', version);
```

### Step 9: Create Post-Upgrade Snapshot

```typescript
const postUpgradeState = {
  markets: await getMarkets(),
  users: await getUsers(),
  balances: await getBalances(),
};

const postHash = generateStateHash(postUpgradeState);

await createSnapshot(
  postHash,
  JSON.stringify(postUpgradeState).length,
  `Post-upgrade snapshot for v${newVersion}`
);
```

### Step 10: Verify Snapshot Integrity

```typescript
const { compareSnapshots } = useStateSnapshot(snapshotContract);

const isValid = await compareSnapshots(preSnapshotId, postSnapshotId);

if (!isValid) {
  console.warn('State mismatch detected');
}
```

## Rollback Procedure

If issues are detected:

### Step 1: Assess the Situation

- Identify the problem
- Determine severity
- Check if rollback is available

### Step 2: Execute Rollback

```typescript
const { rollbackMigration } = useMigration(migrationContract);

await rollbackMigration(migrationId, previousVersion);
```

### Step 3: Verify Rollback

```typescript
const version = await getCurrentVersion();
console.log('Rolled back to version:', version);
```

### Step 4: Restore State

If needed, restore from snapshot:

```typescript
const { getSnapshot } = useStateSnapshot(snapshotContract);

const snapshot = await getSnapshot(preUpgradeSnapshotId);
```

### Step 5: Investigate and Fix

- Analyze what went wrong
- Fix the issues
- Test thoroughly
- Prepare new upgrade

## Canceling a Pending Upgrade

Before execution:

```typescript
const { cancelUpgrade } = useContractUpgrade(proxyContract);

await cancelUpgrade();
```

## Adjusting Timelock

For future upgrades:

```typescript
const { setTimelock } = useContractUpgrade(proxyContract);

await setTimelock(288);
```

## Testing on Testnet

Always test the complete upgrade process on testnet first:

1. Deploy contracts to testnet
2. Run through entire upgrade process
3. Test all functionality
4. Verify rollback works
5. Document any issues
6. Fix problems
7. Repeat until perfect

## Production Checklist

Before upgrading on mainnet:

- [ ] New implementation tested on testnet
- [ ] Migration scripts tested
- [ ] State snapshot created
- [ ] Timelock set appropriately
- [ ] Stakeholders notified
- [ ] Rollback plan prepared
- [ ] Monitoring in place
- [ ] Team available for support
- [ ] Documentation updated
- [ ] Backup plan ready

## Common Issues

### Timelock Not Expired

Wait for the required number of blocks to pass before executing.

### No Pending Upgrade

Ensure an upgrade has been proposed before attempting execution.

### Insufficient Permissions

Only the contract owner can perform upgrade operations.

### Migration Already Executed

Cannot execute the same migration twice.

### Rollback Not Available

Some migrations may not support rollback. Check before executing.

## Monitoring After Upgrade

Monitor these metrics:

- Transaction success rate
- Error logs
- User activity
- Contract calls
- State changes
- Performance metrics

## Support

If you encounter issues:

1. Check error messages
2. Review logs
3. Consult documentation
4. Test on testnet
5. Contact support team

## Additional Resources

- [Contract Upgrade System Documentation](./CONTRACT_UPGRADE_SYSTEM.md)
- [API Reference](./api/README.md)
- [Testing Guide](./testing-guide.md)
