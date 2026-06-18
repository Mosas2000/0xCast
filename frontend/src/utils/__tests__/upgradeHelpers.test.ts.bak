import { describe, it, expect } from 'vitest';
import {
  calculateTimelockExpiry,
  isTimelockExpired,
  blocksUntilExpiry,
  estimateTimeUntilExpiry,
  validateImplementationAddress,
  validateMigrationVersion,
  calculateMigrationRisk,
  compareStateHashes,
  formatStateHash,
  parseStateHash,
} from '../upgradeHelpers';

describe('upgradeHelpers', () => {
  describe('calculateTimelockExpiry', () => {
    it('should calculate correct expiry block', () => {
      expect(calculateTimelockExpiry(1000, 144)).toBe(1144);
    });
  });

  describe('isTimelockExpired', () => {
    it('should return true when timelock expired', () => {
      expect(isTimelockExpired(1200, 1144)).toBe(true);
    });

    it('should return false when timelock not expired', () => {
      expect(isTimelockExpired(1100, 1144)).toBe(false);
    });
  });

  describe('blocksUntilExpiry', () => {
    it('should calculate remaining blocks', () => {
      expect(blocksUntilExpiry(1100, 1144)).toBe(44);
    });

    it('should return 0 when already expired', () => {
      expect(blocksUntilExpiry(1200, 1144)).toBe(0);
    });
  });

  describe('estimateTimeUntilExpiry', () => {
    it('should format minutes correctly', () => {
      expect(estimateTimeUntilExpiry(5)).toBe('50 minutes');
    });

    it('should format hours correctly', () => {
      expect(estimateTimeUntilExpiry(12)).toBe('2h 0m');
    });

    it('should format days correctly', () => {
      expect(estimateTimeUntilExpiry(288)).toBe('2d 0h');
    });
  });

  describe('validateImplementationAddress', () => {
    it('should validate correct address format', () => {
      expect(validateImplementationAddress('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.contract-name')).toBe(true);
    });

    it('should reject invalid address format', () => {
      expect(validateImplementationAddress('invalid-address')).toBe(false);
    });
  });

  describe('validateMigrationVersion', () => {
    it('should accept higher version', () => {
      expect(validateMigrationVersion(1, 2)).toBe(true);
    });

    it('should reject same version', () => {
      expect(validateMigrationVersion(1, 1)).toBe(false);
    });

    it('should reject lower version', () => {
      expect(validateMigrationVersion(2, 1)).toBe(false);
    });
  });

  describe('calculateMigrationRisk', () => {
    it('should return low risk for small migration', () => {
      expect(calculateMigrationRisk(1000, true, 1)).toBe('low');
    });

    it('should return medium risk for moderate migration', () => {
      expect(calculateMigrationRisk(150000, true, 3)).toBe('medium');
    });

    it('should return high risk for large migration', () => {
      expect(calculateMigrationRisk(2000000, false, 10)).toBe('high');
    });
  });

  describe('compareStateHashes', () => {
    it('should return true for identical hashes', () => {
      const hash1 = new Uint8Array([1, 2, 3, 4]);
      const hash2 = new Uint8Array([1, 2, 3, 4]);
      expect(compareStateHashes(hash1, hash2)).toBe(true);
    });

    it('should return false for different hashes', () => {
      const hash1 = new Uint8Array([1, 2, 3, 4]);
      const hash2 = new Uint8Array([1, 2, 3, 5]);
      expect(compareStateHashes(hash1, hash2)).toBe(false);
    });

    it('should return false for different lengths', () => {
      const hash1 = new Uint8Array([1, 2, 3]);
      const hash2 = new Uint8Array([1, 2, 3, 4]);
      expect(compareStateHashes(hash1, hash2)).toBe(false);
    });
  });

  describe('formatStateHash', () => {
    it('should format hash as hex string', () => {
      const hash = new Uint8Array([15, 255, 0, 128]);
      expect(formatStateHash(hash)).toBe('0fff0080');
    });
  });

  describe('parseStateHash', () => {
    it('should parse hex string to Uint8Array', () => {
      const result = parseStateHash('0fff0080');
      expect(result).toEqual(new Uint8Array([15, 255, 0, 128]));
    });
  });
});
