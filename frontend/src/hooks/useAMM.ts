import { useState, useCallback, useEffect } from 'react';
import { AMMPool, SwapQuote } from '@/types/amm';
import { ConstantProductAMM } from '@/services/ConstantProductAMM';
import { StableSwapAMM } from '@/services/StableSwapAMM';
import { ConcentratedLiquidityAMM } from '@/services/ConcentratedLiquidityAMM';
import { AMMRouter } from '@/services/AMMRouter';

interface LiquidityPosition {
  id: string;
  userId: string;
  lowerTick: number;
  upperTick: number;
  amount: bigint;
  feesEarned: bigint;
}

export function useAMMPool(poolId: string) {
  const [pool, setPool] = useState<AMMPool | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPool = useCallback(async () => {
    setLoading(true);
    try {
      // In real implementation, fetch from API
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pool');
    } finally {
      setLoading(false);
    }
  }, [poolId]);

  useEffect(() => {
    loadPool();
  }, [loadPool]);

  return { pool, loading, error, refresh: loadPool };
}

export function useSwapQuote(pool: AMMPool | null, amountIn: bigint, tokenAtoB: boolean) {
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateQuote = useCallback(() => {
    if (!pool || amountIn === 0n) {
      setQuote(null);
      return;
    }

    setLoading(true);
    try {
      let amm: ConstantProductAMM | StableSwapAMM | ConcentratedLiquidityAMM | null = null;

      if (pool.model === 'CONSTANT_PRODUCT') {
        amm = new ConstantProductAMM(pool);
      } else if (pool.model === 'STABLE_SWAP') {
        amm = new StableSwapAMM(pool);
      } else if (pool.model === 'CONCENTRATED_LIQUIDITY') {
        amm = new ConcentratedLiquidityAMM(pool);
      }

      if (amm) {
        const newQuote = tokenAtoB ? amm.quoteSwapAtoB(amountIn) : amm.quoteSwapBtoA(amountIn);
        setQuote(newQuote);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate quote');
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [pool, amountIn, tokenAtoB]);

  useEffect(() => {
    calculateQuote();
  }, [calculateQuote]);

  return { quote, loading, error };
}

export function useAddLiquidity(pool: AMMPool | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const addLiquidity = useCallback(
    async (amountA: bigint, amountB: bigint) => {
      if (!pool) {
        setError('Pool not found');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let amm: ConstantProductAMM | StableSwapAMM | null = null;

        if (pool.model === 'CONSTANT_PRODUCT') {
          amm = new ConstantProductAMM(pool);
        } else if (pool.model === 'STABLE_SWAP') {
          amm = new StableSwapAMM(pool);
        }

        if (amm) {
          amm.addLiquidity(amountA, amountB);
          setSuccess(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add liquidity');
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    },
    [pool]
  );

  return { addLiquidity, loading, error, success };
}

export function useRemoveLiquidity(pool: AMMPool | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const removeLiquidity = useCallback(
    async (liquidity: bigint) => {
      if (!pool) {
        setError('Pool not found');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let amm: ConstantProductAMM | StableSwapAMM | null = null;

        if (pool.model === 'CONSTANT_PRODUCT') {
          amm = new ConstantProductAMM(pool);
        } else if (pool.model === 'STABLE_SWAP') {
          amm = new StableSwapAMM(pool);
        }

        if (amm) {
          amm.removeLiquidity(liquidity);
          setSuccess(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove liquidity');
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    },
    [pool]
  );

  return { removeLiquidity, loading, error, success };
}

export function useAMMRouter() {
  const [router] = useState(() => new AMMRouter());
  const [pools, setPools] = useState<AMMPool[]>([]);

  const addPool = useCallback(
    (pool: AMMPool, modelType: 'constant-product' | 'stable-swap' | 'concentrated-liquidity') => {
      router.addPool(pool, modelType);
      setPools(router.getAllPools());
    },
    [router]
  );

  const getAvailablePools = useCallback(() => {
    return router.getAvailablePools();
  }, [router]);

  const findBestSwap = useCallback(
    (amountIn: bigint, tokenAtoB: boolean) => {
      return router.findBestPoolForSwap(amountIn, tokenAtoB);
    },
    [router]
  );

  const executeSwap = useCallback(
    (poolId: string, amountIn: bigint, minAmountOut: bigint, tokenAtoB: boolean) => {
      return router.executeSwapExactInput(poolId, amountIn, minAmountOut, tokenAtoB);
    },
    [router]
  );

  const multiHopSwap = useCallback(
    (poolIds: string[], amountIn: bigint, minAmountOut: bigint) => {
      return router.multiHopSwap(poolIds, amountIn, minAmountOut);
    },
    [router]
  );

  return {
    addPool,
    getAvailablePools,
    findBestSwap,
    executeSwap,
    multiHopSwap,
    pools,
  };
}

export function useFlashSwap(pool: AMMPool | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateFlashSwap = useCallback(
    async (tokenOut: string, amountOut: bigint, deadline: number) => {
      if (!pool) {
        setError('Pool not found');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Implementation would go here
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Flash swap failed');
      } finally {
        setLoading(false);
      }
    },
    [pool]
  );

  return { initiateFlashSwap, loading, error };
}

export function useConcentratedLiquidity(pool: AMMPool | null) {
  const [positions, setPositions] = useState<LiquidityPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPosition = useCallback(
    async (lowerTick: number, upperTick: number, amount: bigint) => {
      if (!pool) {
        setError('Pool not found');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const amm = new ConcentratedLiquidityAMM(pool);
        const position = amm.createPosition(
          `pos-${Date.now()}`,
          'current-user',
          lowerTick,
          upperTick,
          amount
        );

        setPositions([...positions, position]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create position');
      } finally {
        setLoading(false);
      }
    },
    [pool, positions]
  );

  const claimFees = useCallback(
    async (positionId: string) => {
      if (!pool) {
        setError('Pool not found');
        return 0n;
      }

      setLoading(true);
      try {
        const amm = new ConcentratedLiquidityAMM(pool);
        return amm.claimFees(positionId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to claim fees');
        return 0n;
      } finally {
        setLoading(false);
      }
    },
    [pool]
  );

  return { positions, createPosition, claimFees, loading, error };
}
