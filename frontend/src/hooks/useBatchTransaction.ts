import { useState, useEffect, useCallback } from 'react';
import { BatchTransactionService } from '@/services/BatchTransactionService';
import { BatchTransactionBuilder } from '@/utils/batchTransactionUtils';
import { FeeSavingsCalculator } from '@/utils/feeSavingsCalculator';
import { 
  BatchRequest, 
  BatchStatus, 
  BatchStats,
  BatchExecutionResult 
} from '@/types/batch';

export const useBatchTransaction = () => {
  const [batches, setBatches] = useState<BatchRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);

  const service = BatchTransactionService.getInstance();

  const createBuilder = useCallback(() => {
    return service.createBatch(1);
  }, [service]);

  const submitBatch = useCallback(
    async (batch: BatchRequest) => {
      try {
        setIsLoading(true);
        setError(null);
        const batchId = await service.submitBatch(batch);
        setCurrentBatchId(batchId);
        setBatches(service.getAllBatches());
        return batchId;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit batch';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [service]
  );

  const getBatchStatus = useCallback(
    async (batchId: string): Promise<BatchStatus | null> => {
      return await service.getBatchStatus(batchId);
    },
    [service]
  );

  const getBatchResult = useCallback(
    async (batchId: string): Promise<BatchExecutionResult | null> => {
      return await service.getBatchResult(batchId);
    },
    [service]
  );

  const cancelBatch = useCallback(
    async (batchId: string): Promise<boolean> => {
      try {
        const success = await service.cancelBatch(batchId);
        if (success) {
          setBatches(service.getAllBatches());
        }
        return success;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to cancel batch';
        setError(errorMessage);
        return false;
      }
    },
    [service]
  );

  const refreshBatches = useCallback(() => {
    setBatches(service.getAllBatches());
  }, [service]);

  useEffect(() => {
    const interval = setInterval(refreshBatches, 2000);
    return () => clearInterval(interval);
  }, [refreshBatches]);

  return {
    batches,
    isLoading,
    error,
    currentBatchId,
    createBuilder,
    submitBatch,
    getBatchStatus,
    getBatchResult,
    cancelBatch,
    refreshBatches,
  };
};

export const useBatchFeeCalculator = () => {
  const [stats, setStats] = useState<BatchStats | null>(null);
  const [optimal, setOptimal] = useState<any>(null);

  const calculateStats = useCallback((transactionCount: number) => {
    const newStats = FeeSavingsCalculator.calculateBatchStats(transactionCount);
    setStats(newStats);
    return newStats;
  }, []);

  const getOptimalSize = useCallback(() => {
    const optimalSize = FeeSavingsCalculator.calculateOptimalBatchSize(30);
    setOptimal(optimalSize);
    return optimalSize;
  }, []);

  const isBatchingWorthwhile = useCallback((transactionCount: number) => {
    return FeeSavingsCalculator.isBatchingWorthwhile(transactionCount, 30);
  }, []);

  const getRecommendedSize = useCallback((currentCount: number) => {
    return FeeSavingsCalculator.getRecommendedBatchSize(currentCount, 40);
  }, []);

  return {
    stats,
    optimal,
    calculateStats,
    getOptimalSize,
    isBatchingWorthwhile,
    getRecommendedSize,
  };
};

export const useBatchStatus = (batchId: string) => {
  const [status, setStatus] = useState<BatchStatus | null>(null);
  const [result, setResult] = useState<BatchExecutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = BatchTransactionService.getInstance();

  const fetchStatus = useCallback(async () => {
    if (!batchId) return;

    try {
      setIsLoading(true);
      const batchStatus = await service.getBatchStatus(batchId);
      setStatus(batchStatus);

      if (batchStatus === 'confirmed' || batchStatus === 'failed') {
        const batchResult = await service.getBatchResult(batchId);
        setResult(batchResult);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [batchId, service]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    status,
    result,
    isLoading,
    error,
    refetch: fetchStatus,
  };
};

export const useBatchQueue = () => {
  const [stats, setStats] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const service = BatchTransactionService.getInstance();

  const updateStats = useCallback(() => {
    const queueStats = service.getQueueStats();
    setStats(queueStats);
    setIsProcessing(service.isProcessingActive());
  }, [service]);

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [updateStats]);

  return {
    stats,
    isProcessing,
    refreshStats: updateStats,
  };
};
