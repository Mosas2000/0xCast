export interface UpgradeConfig {
  defaultTimelock: number;
  maxTimelockBlocks: number;
  minTimelockBlocks: number;
  snapshotRetentionDays: number;
  migrationTimeout: number;
  rollbackEnabled: boolean;
  monitoringEnabled: boolean;
}

export const defaultUpgradeConfig: UpgradeConfig = {
  defaultTimelock: 144,
  maxTimelockBlocks: 1440,
  minTimelockBlocks: 10,
  snapshotRetentionDays: 90,
  migrationTimeout: 300000,
  rollbackEnabled: true,
  monitoringEnabled: true,
};

export const testnetUpgradeConfig: UpgradeConfig = {
  defaultTimelock: 10,
  maxTimelockBlocks: 100,
  minTimelockBlocks: 5,
  snapshotRetentionDays: 30,
  migrationTimeout: 60000,
  rollbackEnabled: true,
  monitoringEnabled: true,
};

export const mainnetUpgradeConfig: UpgradeConfig = {
  defaultTimelock: 288,
  maxTimelockBlocks: 2880,
  minTimelockBlocks: 144,
  snapshotRetentionDays: 180,
  migrationTimeout: 600000,
  rollbackEnabled: true,
  monitoringEnabled: true,
};

export function getUpgradeConfig(network: 'mainnet' | 'testnet' | 'devnet'): UpgradeConfig {
  switch (network) {
    case 'mainnet':
      return mainnetUpgradeConfig;
    case 'testnet':
      return testnetUpgradeConfig;
    default:
      return defaultUpgradeConfig;
  }
}

export function validateUpgradeConfig(config: UpgradeConfig): string[] {
  const errors: string[] = [];

  if (config.defaultTimelock < config.minTimelockBlocks) {
    errors.push('Default timelock must be >= minimum timelock');
  }

  if (config.defaultTimelock > config.maxTimelockBlocks) {
    errors.push('Default timelock must be <= maximum timelock');
  }

  if (config.snapshotRetentionDays < 1) {
    errors.push('Snapshot retention must be at least 1 day');
  }

  if (config.migrationTimeout < 1000) {
    errors.push('Migration timeout must be at least 1 second');
  }

  return errors;
}
