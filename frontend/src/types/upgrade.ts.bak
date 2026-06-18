export interface UpgradeProposal {
  id: number;
  newImplementation: string;
  proposedAt: number;
  proposedBy: string;
  timelockExpires: number;
  status: 'pending' | 'executed' | 'cancelled';
}

export interface UpgradeExecution {
  upgradeId: number;
  fromImplementation: string;
  toImplementation: string;
  executedAt: number;
  executedBy: string;
  success: boolean;
  errorMessage?: string;
}

export interface MigrationRecord {
  migrationId: number;
  version: number;
  description: string;
  dataHash: Uint8Array;
  dataSize: number;
  executed: boolean;
  executedAt?: number;
  executedBy?: string;
  rollbackAvailable: boolean;
  rollbackExecuted: boolean;
}

export interface SnapshotRecord {
  snapshotId: number;
  createdAt: number;
  createdBy: string;
  stateHash: Uint8Array;
  dataSize: number;
  description: string;
  verified: boolean;
  verifiedAt?: number;
}

export interface UpgradeStatus {
  currentVersion: number;
  currentImplementation: string;
  pendingUpgrade: UpgradeProposal | null;
  lastUpgrade: UpgradeExecution | null;
  totalUpgrades: number;
}

export interface MigrationStatus {
  currentVersion: number;
  pendingMigrations: MigrationRecord[];
  executedMigrations: MigrationRecord[];
  totalMigrations: number;
}

export interface SnapshotStatus {
  totalSnapshots: number;
  latestSnapshot: SnapshotRecord | null;
  verifiedSnapshots: number;
  unverifiedSnapshots: number;
}

export type UpgradePhase =
  | 'idle'
  | 'preparing'
  | 'proposed'
  | 'waiting'
  | 'executing'
  | 'migrating'
  | 'verifying'
  | 'completed'
  | 'failed'
  | 'rollingback';

export interface UpgradeProgress {
  phase: UpgradePhase;
  percentage: number;
  message: string;
  startedAt: number;
  estimatedCompletion?: number;
}
