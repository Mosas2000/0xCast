import { useState, useCallback } from 'react';
import { StateSnapshotService, Snapshot } from '@/services/StateSnapshotService';
import { useWallet } from '@/components/WalletProvider';

interface UseStateSnapshotReturn {
  createSnapshot: (stateHash: Uint8Array, dataSize: number, description: string) => Promise<void>;
  verifySnapshot: (snapshotId: number) => Promise<void>;
  getSnapshot: (snapshotId: number) => Promise<Snapshot | null>;
  getSnapshotCount: () => Promise<number>;
  generateStateHash: (data: unknown) => Uint8Array;
  compareSnapshots: (snapshot1Id: number, snapshot2Id: number) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useStateSnapshot(
  snapshotContract: { address: string; name: string }
): UseStateSnapshotReturn {
  const { address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [service] = useState(() => new StateSnapshotService(snapshotContract));

  const createSnapshot = useCallback(
    async (stateHash: Uint8Array, dataSize: number, description: string) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await service.createSnapshot(stateHash, dataSize, description, address);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create snapshot';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address, service]
  );

  const verifySnapshot = useCallback(
    async (snapshotId: number) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await service.verifySnapshot(snapshotId, address);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to verify snapshot';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address, service]
  );

  const getSnapshot = useCallback(
    async (snapshotId: number) => {
      return await service.getSnapshot(snapshotId);
    },
    [service]
  );

  const getSnapshotCount = useCallback(async () => {
    return await service.getSnapshotCount();
  }, [service]);

  const generateStateHash = useCallback(
    (data: unknown) => {
      return service.generateStateHash(data);
    },
    [service]
  );

  const compareSnapshots = useCallback(
    async (snapshot1Id: number, snapshot2Id: number) => {
      return await service.compareSnapshots(snapshot1Id, snapshot2Id);
    },
    [service]
  );

  return {
    createSnapshot,
    verifySnapshot,
    getSnapshot,
    getSnapshotCount,
    generateStateHash,
    compareSnapshots,
    isLoading,
    error,
  };
}
