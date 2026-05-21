import { useState, useEffect, useCallback } from 'react';
import { SecureStorageV2Service } from '@/services/SecureStorageV2Service';
import { StorageMigrationService } from '@/services/StorageMigrationService';
import { EncryptionService } from '@/services/EncryptionService';

export interface SecureStorageStatus {
  initialized: boolean;
  migrationCompleted: boolean;
  migrationVersion: string | null;
  totalItems: number;
  encryptedItems: number;
  piiItems: number;
}

export function useSecureStorage() {
  const [status, setStatus] = useState<SecureStorageStatus>({
    initialized: false,
    migrationCompleted: false,
    migrationVersion: null,
    totalItems: 0,
    encryptedItems: 0,
    piiItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshStatus = useCallback(async () => {
    try {
      setIsLoading(true);

      const report = await SecureStorageV2Service.getStorageReport();
      const migration = StorageMigrationService.getMigrationStatus();

      setStatus({
        initialized: SecureStorageV2Service.isInitialized(),
        migrationCompleted: migration.completed,
        migrationVersion: migration.version,
        totalItems: report.totalItems,
        encryptedItems: report.encryptedItems,
        piiItems: report.piiItems,
      });
    } catch (error) {
      console.error('Failed to refresh secure storage status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const runMigration = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await StorageMigrationService.migrateAll();
      await refreshStatus();
      return result;
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshStatus]);

  const clearEncryptionKey = useCallback(() => {
    EncryptionService.clearEncryptionKey();
  }, []);

  const setItem = useCallback(
    async (key: string, value: any, options?: Parameters<typeof SecureStorageV2Service.setItem>[2]) => {
      return SecureStorageV2Service.setItem(key, value, options);
    },
    []
  );

  const getItem = useCallback(async <T = any>(key: string): Promise<T | null> => {
    return SecureStorageV2Service.getItem<T>(key);
  }, []);

  const removeItem = useCallback(async (key: string) => {
    return SecureStorageV2Service.removeItem(key);
  }, []);

  return {
    status,
    isLoading,
    refreshStatus,
    runMigration,
    clearEncryptionKey,
    setItem,
    getItem,
    removeItem,
  };
}
