import { useState, useCallback } from 'react';
import { MigrationService, Migration, MigrationData } from '@/services/MigrationService';
import { useWallet } from '@/components/WalletProvider';

interface UseMigrationReturn {
  registerMigration: (
    version: number,
    description: string,
    dataHash: Uint8Array,
    dataSize: number,
    rollbackAvailable: boolean
  ) => Promise<void>;
  executeMigration: (migrationId: number) => Promise<void>;
  rollbackMigration: (migrationId: number, targetVersion: number) => Promise<void>;
  getCurrentVersion: () => Promise<number>;
  getMigration: (migrationId: number) => Promise<Migration | null>;
  getMigrationData: (migrationId: number) => Promise<MigrationData | null>;
  isMigrationExecuted: (migrationId: number) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useMigration(
  migrationContract: { address: string; name: string }
): UseMigrationReturn {
  const { address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [service] = useState(() => new MigrationService(migrationContract));

  const registerMigration = useCallback(
    async (
      version: number,
      description: string,
      dataHash: Uint8Array,
      dataSize: number,
      rollbackAvailable: boolean
    ) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await service.registerMigration(
          version,
          description,
          dataHash,
          dataSize,
          rollbackAvailable,
          address
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to register migration';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address, service]
  );

  const executeMigration = useCallback(
    async (migrationId: number) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await service.executeMigration(migrationId, address);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to execute migration';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address, service]
  );

  const rollbackMigration = useCallback(
    async (migrationId: number, targetVersion: number) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await service.rollbackMigration(migrationId, targetVersion, address);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to rollback migration';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address, service]
  );

  const getCurrentVersion = useCallback(async () => {
    return await service.getCurrentVersion();
  }, [service]);

  const getMigration = useCallback(
    async (migrationId: number) => {
      return await service.getMigration(migrationId);
    },
    [service]
  );

  const getMigrationData = useCallback(
    async (migrationId: number) => {
      return await service.getMigrationData(migrationId);
    },
    [service]
  );

  const isMigrationExecuted = useCallback(
    async (migrationId: number) => {
      return await service.isMigrationExecuted(migrationId);
    },
    [service]
  );

  return {
    registerMigration,
    executeMigration,
    rollbackMigration,
    getCurrentVersion,
    getMigration,
    getMigrationData,
    isMigrationExecuted,
    isLoading,
    error,
  };
}
