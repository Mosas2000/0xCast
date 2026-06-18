export interface MigrationValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateMigrationData(
  version: number,
  description: string,
  dataSize: number
): MigrationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (version < 1) {
    errors.push('Version must be positive');
  }

  if (!description || description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (description.length > 256) {
    errors.push('Description must be 256 characters or less');
  }

  if (dataSize < 0) {
    errors.push('Data size must be non-negative');
  }

  if (dataSize > 10000000) {
    warnings.push('Large data size may cause performance issues');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateVersionSequence(currentVersion: number, newVersion: number): boolean {
  return newVersion === currentVersion + 1;
}

export function validateRollbackTarget(
  currentVersion: number,
  targetVersion: number
): MigrationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (targetVersion >= currentVersion) {
    errors.push('Target version must be less than current version');
  }

  if (targetVersion < 1) {
    errors.push('Target version must be positive');
  }

  const versionDiff = currentVersion - targetVersion;
  if (versionDiff > 5) {
    warnings.push('Rolling back multiple versions may be risky');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
