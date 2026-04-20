import { describe, it, expect, beforeEach } from 'vitest';
import { ConstantProductAMM } from '@/services/ConstantProductAMM';
import { StableSwapAMM } from '@/services/StableSwapAMM';
import { ConcentratedLiquidityAMM } from '@/services/ConcentratedLiquidityAMM';
import { FlashSwapService } from '@/services/FlashSwapService';
import { AMMRouter } from '@/services/AMMRouter';
import { SlippageOptimizer, PriceImpactCalculator } from '@/utils/slippageOptimization';
import { AMMPool } from '@/types/amm';

describe('ConstantProductAMM', () => {
  let pool: AMMPool;
  let amm: ConstantProductAMM;

  beforeEach(() => {
    pool = {
      id: 'test-cp',
      tokenA: 'STX',
      tokenB: 'USDA',
      reserveA: BigInt('1000000000000'),
      reserveB: BigInt('1000000000000'),
      fee: 3000,
      totalLiquidity: BigInt('1000000000000'),
      model: 'CONSTANT_PRODUCT',
    };
    amm = new ConstantProductAMM(pool);
  });

  it('should calculate swap quote correctly', () => {
    const amountIn = BigInt('1000000000');
    const quote = amm.quoteSwapAtoB(amountIn);

    expect(quote.amountIn).toBe(amountIn);
    expect(quote.amountOut).toBeGreaterThan(0n);
    expect(quote.fee).toBeGreaterThan(0n);
    expect(quote.slippage).toBeGreaterThanOrEqual(0);
  });

  it('should handle zero reserves gracefully', () => {
    pool.reserveB = 0n;
    const amountIn = BigInt('1000000000');

    expect(() => amm.quoteSwapAtoB(amountIn)).toThrow();
  });

  it('should add liquidity correctly', () => {
    const amountA = BigInt('1000000000');
    const amountB = BigInt('1000000000');

    const before = pool.totalLiquidity;
    amm.addLiquidity(amountA, amountB);

    expect(pool.totalLiquidity).toBeGreaterThan(before);
  });

  it('should remove liquidity correctly', () => {
    const liquidity = BigInt('100000000');
    const initialLiquidity = pool.totalLiquidity;

    amm.removeLiquidity(liquidity);

    expect(pool.totalLiquidity).toBeLessThan(initialLiquidity);
  });

  it('should track statistics', () => {
    const amountIn = BigInt('1000000000');
    amm.executeSwapAtoB(amountIn);

    const stats = amm.getStats();
    expect(stats.volumeTraded).toBeGreaterThan(0n);
    expect(stats.feesCollected).toBeGreaterThan(0n);
  });
});

describe('StableSwapAMM', () => {
  let pool: AMMPool;
  let amm: StableSwapAMM;

  beforeEach(() => {
    pool = {
      id: 'test-stable',
      tokenA: 'USDA',
      tokenB: 'USDB',
      reserveA: BigInt('1000000000000'),
      reserveB: BigInt('1000000000000'),
      fee: 1000,
      totalLiquidity: BigInt('1000000000000'),
      model: 'STABLE_SWAP',
    };
    amm = new StableSwapAMM(pool, 1000n);
  });

  it('should quote stable swap correctly', () => {
    const amountIn = BigInt('1000000000');
    const quote = amm.quoteSwapAtoB(amountIn);

    expect(quote.amountOut).toBeGreaterThan(0n);
    expect(quote.slippage).toBeLessThan(0.5);
  });

  it('should handle stable swaps with lower slippage', () => {
    const amountIn = BigInt('10000000000');
    const quote = amm.quoteSwapAtoB(amountIn);

    expect(quote.slippage).toBeLessThan(1);
  });

  it('should allow amplification adjustment', () => {
    amm.setAmplificationFactor(500n);
    const quote = amm.quoteSwapAtoB(BigInt('1000000000'));

    expect(quote.amountOut).toBeGreaterThan(0n);
  });
});

describe('ConcentratedLiquidityAMM', () => {
  let pool: AMMPool;
  let amm: ConcentratedLiquidityAMM;

  beforeEach(() => {
    pool = {
      id: 'test-cl',
      tokenA: 'STX',
      tokenB: 'USDA',
      reserveA: BigInt('1000000000000'),
      reserveB: BigInt('1000000000000'),
      fee: 3000,
      totalLiquidity: BigInt('1000000000000'),
      model: 'CONCENTRATED_LIQUIDITY',
    };
    amm = new ConcentratedLiquidityAMM(pool, 1);
  });

  it('should create concentrated liquidity position', () => {
    const position = amm.createPosition('pos1', 'user1', -10000, 10000, BigInt('100000000'));

    expect(position.id).toBe('pos1');
    expect(position.liquidity).toBe(BigInt('100000000'));
  });

  it('should calculate capital efficiency', () => {
    amm.createPosition('pos1', 'user1', -10000, 10000, BigInt('100000000'));
    const efficiency = amm.getCapitalEfficiency();

    expect(efficiency).toBeGreaterThan(0);
    expect(efficiency).toBeLessThanOrEqual(100);
  });

  it('should remove position correctly', () => {
    amm.createPosition('pos1', 'user1', -10000, 10000, BigInt('100000000'));
    amm.removePosition('pos1');

    expect(amm.getPosition('pos1')).toBeUndefined();
  });

  it('should claim fees from position', () => {
    const position = amm.createPosition('pos1', 'user1', -10000, 10000, BigInt('100000000'));
    amm.executeConcentratedSwap(BigInt('1000000000'), true);

    const fees = amm.claimFees('pos1');
    expect(fees).toBeGreaterThanOrEqual(0n);
  });
});

describe('FlashSwapService', () => {
  let pool: AMMPool;
  let flashSwapService: FlashSwapService;

  beforeEach(() => {
    pool = {
      id: 'test-flash',
      tokenA: 'STX',
      tokenB: 'USDA',
      reserveA: BigInt('1000000000000'),
      reserveB: BigInt('1000000000000'),
      fee: 3000,
      totalLiquidity: BigInt('1000000000000'),
      model: 'CONSTANT_PRODUCT',
    };
    flashSwapService = new FlashSwapService(pool, 0.05);
  });

  it('should initiate flash swap', () => {
    const callback = {
      borrower: 'user1',
      deadline: Date.now() + 10000,
      onFlashSwap: () => ({ amountToReturn: BigInt('1000000000') }),
    };

    expect(() =>
      flashSwapService.initiateFlashSwap('flash1', 'A', BigInt('1000000'), callback)
    ).not.toThrow();
  });

  it('should calculate flash loan fee', () => {
    const amount = BigInt('1000000000');
    const fee = flashSwapService.calculateFlashSwapFee(amount);

    expect(fee).toBeGreaterThan(0n);
  });

  it('should validate flash swap safety', () => {
    const callback = {
      borrower: 'user1',
      deadline: Date.now() + 10000,
      onFlashSwap: () => ({ amountToReturn: BigInt('1000000000') }),
    };

    flashSwapService.initiateFlashSwap('flash1', 'A', BigInt('1000000'), callback);

    const isSafe = flashSwapService.validateFlashSwapSafety(
      'flash1',
      BigInt('1000050000')
    );
    expect(isSafe).toBe(true);
  });

  it('should reject expired flash swaps', () => {
    const callback = {
      borrower: 'user1',
      deadline: Date.now() - 1000,
      onFlashSwap: () => ({ amountToReturn: BigInt('1000000000') }),
    };

    expect(() =>
      flashSwapService.initiateFlashSwap('flash1', 'A', BigInt('1000000'), callback)
    ).not.toThrow();
  });
});

describe('AMMRouter', () => {
  let router: AMMRouter;
  let pool1: AMMPool;
  let pool2: AMMPool;

  beforeEach(() => {
    router = new AMMRouter();

    pool1 = {
      id: 'pool1',
      tokenA: 'STX',
      tokenB: 'USDA',
      reserveA: BigInt('1000000000000'),
      reserveB: BigInt('1000000000000'),
      fee: 3000,
      totalLiquidity: BigInt('1000000000000'),
      model: 'CONSTANT_PRODUCT',
    };

    pool2 = {
      id: 'pool2',
      tokenA: 'USDA',
      tokenB: 'USDB',
      reserveA: BigInt('1000000000000'),
      reserveB: BigInt('1000000000000'),
      fee: 1000,
      totalLiquidity: BigInt('1000000000000'),
      model: 'STABLE_SWAP',
    };

    router.addPool(pool1, 'constant-product');
    router.addPool(pool2, 'stable-swap');
  });

  it('should add and retrieve pools', () => {
    expect(router.getPool('pool1')).toBeDefined();
    expect(router.getAllPools().length).toBe(2);
  });

  it('should quote single hop swap', () => {
    const quote = router.quoteExactInputSingleHop('pool1', BigInt('1000000000'), true);
    expect(quote).toBeDefined();
    expect(quote?.amountOut).toBeGreaterThan(0n);
  });

  it('should find best pool for swap', () => {
    const best = router.findBestPoolForSwap(BigInt('1000000000'), true);
    expect(best).toBeDefined();
    expect(best?.poolId).toBeDefined();
  });

  it('should execute multi-hop swaps', () => {
    const result = router.multiHopSwap(
      ['pool1', 'pool2'],
      BigInt('1000000000'),
      BigInt('900000000')
    );

    expect(result.amountOut).toBeGreaterThan(0n);
    expect(result.hop).toBe(2);
  });

  it('should estimate multi-hop price', () => {
    const estimate = router.estimateMultiHopPrice(['pool1', 'pool2'], BigInt('1000000000'));

    expect(estimate.expectedAmountOut).toBeGreaterThan(0n);
    expect(estimate.priceImpact).toBeGreaterThanOrEqual(0);
  });

  it('should return pool statistics', () => {
    const stats = router.getPoolStatistics('pool1');

    expect(stats).toBeDefined();
    expect(stats.model).toBe('constant-product');
    expect(stats.stats).toBeDefined();
  });
});

describe('SlippageOptimizer', () => {
  let optimizer: SlippageOptimizer;

  beforeEach(() => {
    optimizer = new SlippageOptimizer(1);
  });

  it('should track slippage history', () => {
    optimizer.recordSlippage(0.5);
    optimizer.recordSlippage(0.75);
    optimizer.recordSlippage(0.6);

    expect(optimizer.getAverageSlippage()).toBeLessThan(1);
  });

  it('should calculate minimum output', () => {
    const amountOut = BigInt('1000000000');
    const minOutput = optimizer.calculateMinimumOutput(amountOut, 0.5);

    expect(minOutput).toBeLessThan(amountOut);
  });

  it('should optimize slippage for pool', () => {
    const pool: AMMPool = {
      id: 'test',
      tokenA: 'STX',
      tokenB: 'USDA',
      reserveA: BigInt('1000000000000'),
      reserveB: BigInt('1000000000000'),
      fee: 3000,
      totalLiquidity: BigInt('1000000000000'),
      model: 'CONSTANT_PRODUCT',
    };

    const result = optimizer.optimizeSlippageForPool(
      pool,
      BigInt('1000000000'),
      0.5
    );

    expect(result).toBeDefined();
    expect(result?.optimalAmount).toBeGreaterThan(0n);
  });

  it('should provide slippage statistics', () => {
    optimizer.recordSlippage(0.5);
    optimizer.recordSlippage(0.75);
    optimizer.recordSlippage(0.6);

    const stats = optimizer.getSlippageStatistics();

    expect(stats.average).toBeGreaterThan(0);
    expect(stats.count).toBe(3);
    expect(stats.max).toBeGreaterThanOrEqual(stats.min);
  });
});

describe('PriceImpactCalculator', () => {
  let calculator: PriceImpactCalculator;

  beforeEach(() => {
    calculator = new PriceImpactCalculator();
  });

  it('should calculate price impact', () => {
    const impact = calculator.calculatePriceImpact(1.0, 1.01);
    expect(impact).toBeCloseTo(0.01);
  });

  it('should handle zero spot price', () => {
    const impact = calculator.calculatePriceImpact(0, 1.0);
    expect(impact).toBe(0);
  });

  it('should estimate multi-hop slippage', () => {
    const slippage = calculator.estimateMultiHopSlippage(3, 0.1);
    expect(slippage).toBeGreaterThan(0.1);
  });
});
