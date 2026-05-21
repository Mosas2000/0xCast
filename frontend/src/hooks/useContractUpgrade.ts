import { useState, useCallback } from 'react';
import { ContractUpgradeService, UpgradeProposal, UpgradeHistory } from '@/services/ContractUpgradeService';
import { useWallet } from '@/components/WalletProvider';

interface UseContractUpgradeReturn {
  proposeUpgrade: (newImplementation: string) => Promise<void>;
  executeUpgrade: () => Promise<void>;
  cancelUpgrade: () => Promise<void>;
  setTimelock: (blocks: number) => Promise<void>;
  getImplementation: () => Promise<string | null>;
  getPendingUpgrade: () => Promise<UpgradeProposal | null>;
  getUpgradeHistory: (upgradeId: number) => Promise<UpgradeHistory | null>;
  isLoading: boolean;
  error: string | null;
}

export function useContractUpgrade(
  proxyContract: { address: string; name: string }
): UseContractUpgradeReturn {
  const { address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [service] = useState(() => new ContractUpgradeService(proxyContract));

  const proposeUpgrade = useCallback(
    async (newImplementation: string) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await service.proposeUpgrade(newImplementation, address);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to propose upgrade';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address, service]
  );

  const executeUpgrade = useCallback(async () => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await service.executeUpgrade(address);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute upgrade';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, service]);

  const cancelUpgrade = useCallback(async () => {
    if (!address) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await service.cancelUpgrade(address);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel upgrade';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, service]);

  const setTimelock = useCallback(
    async (blocks: number) => {
      if (!address) {
        setError('Wallet not connected');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        await service.setUpgradeTimelock(blocks, address);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to set timelock';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [address, service]
  );

  const getImplementation = useCallback(async () => {
    return await service.getImplementation();
  }, [service]);

  const getPendingUpgrade = useCallback(async () => {
    return await service.getPendingUpgrade();
  }, [service]);

  const getUpgradeHistory = useCallback(
    async (upgradeId: number) => {
      return await service.getUpgradeHistory(upgradeId);
    },
    [service]
  );

  return {
    proposeUpgrade,
    executeUpgrade,
    cancelUpgrade,
    setTimelock,
    getImplementation,
    getPendingUpgrade,
    getUpgradeHistory,
    isLoading,
    error,
  };
}
