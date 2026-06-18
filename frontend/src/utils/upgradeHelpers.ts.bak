export function calculateTimelockExpiry(proposedAt: number, timelockBlocks: number): number {
  return proposedAt + timelockBlocks;
}

export function isTimelockExpired(currentBlock: number, expiryBlock: number): boolean {
  return currentBlock >= expiryBlock;
}

export function blocksUntilExpiry(currentBlock: number, expiryBlock: number): number {
  return Math.max(0, expiryBlock - currentBlock);
}

export function estimateTimeUntilExpiry(blocksRemaining: number): string {
  const minutesPerBlock = 10;
  const totalMinutes = blocksRemaining * minutesPerBlock;
  
  if (totalMinutes < 60) {
    return `${totalMinutes} minutes`;
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours < 24) {
    return `${hours}h ${minutes}m`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return `${days}d ${remainingHours}h`;
}

export function validateImplementationAddress(address: string): boolean {
  const addressPattern = /^[A-Z0-9]{28,41}\.[a-z0-9-]+$/;
  return addressPattern.test(address);
}

export function formatUpgradeHistory(history: {
  fromImplementation: string;
  toImplementation: string;
  upgradedAt: number;
  upgradedBy: string;
}): string {
  return `Upgraded from ${history.fromImplementation} to ${history.toImplementation} at block ${history.upgradedAt} by ${history.upgradedBy}`;
}

export function generateMigrationId(version: number, timestamp: number): string {
  return `migration-v${version}-${timestamp}`;
}

export function parseMigrationDescription(description: string): {
  title: string;
  details: string[];
} {
  const lines = description.split('\n');
  return {
    title: lines[0] || '',
    details: lines.slice(1).filter(line => line.trim()),
  };
}

export function validateMigrationVersion(currentVersion: number, newVersion: number): boolean {
  return newVersion > currentVersion;
}

export function calculateMigrationRisk(
  dataSize: number,
  rollbackAvailable: boolean,
  versionJump: number
): 'low' | 'medium' | 'high' {
  if (versionJump > 5 || dataSize > 1000000 || !rollbackAvailable) {
    return 'high';
  }
  
  if (versionJump > 2 || dataSize > 100000) {
    return 'medium';
  }
  
  return 'low';
}

export function formatMigrationStatus(executed: boolean, executedAt?: number): string {
  if (!executed) {
    return 'Pending';
  }
  
  return `Executed at block ${executedAt}`;
}

export function generateSnapshotDescription(version: number, phase: 'pre' | 'post'): string {
  return `${phase === 'pre' ? 'Pre' : 'Post'}-upgrade snapshot for version ${version}`;
}

export function compareStateHashes(hash1: Uint8Array, hash2: Uint8Array): boolean {
  if (hash1.length !== hash2.length) {
    return false;
  }
  
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) {
      return false;
    }
  }
  
  return true;
}

export function formatStateHash(hash: Uint8Array): string {
  return Array.from(hash)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function parseStateHash(hashString: string): Uint8Array {
  const bytes = new Uint8Array(hashString.length / 2);
  
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hashString.substr(i * 2, 2), 16);
  }
  
  return bytes;
}

export function validateSnapshotIntegrity(
  snapshot: { stateHash: Uint8Array; dataSize: number },
  actualData: unknown
): boolean {
  const actualSize = JSON.stringify(actualData).length;
  return actualSize === snapshot.dataSize;
}

export function estimateUpgradeDuration(
  migrationCount: number,
  averageMigrationTime: number
): number {
  return migrationCount * averageMigrationTime;
}

export function shouldRecommendRollback(
  errorRate: number,
  performanceDegradation: number
): boolean {
  return errorRate > 0.05 || performanceDegradation > 0.3;
}
