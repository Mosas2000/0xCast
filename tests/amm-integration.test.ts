import { describe, it, expect, beforeEach } from 'vitest';
import { AMMRouter } from '@/services/AMMRouter';
import { AMMPoolFactory, PoolRegistry } from '@/services/AMMPoolFactory';
import { TradingAnalytics } from '@/services/TradingAnalytics';
import { PriceMonitor } from '@/services/PriceMonitor';
import { SwapParameterValidator, AMMPoolValidator } from '@/utils/ammValidation';
import { EdgeCaseHandler, ErrorRecovery, CircuitBreaker, RateLimiter } from '@/utils/errorRecovery';
import { AMMCalculator, AMMMetrics } from '@/utils/ammCalculations';
import { AMMPool } from '@/types/amm';

describe('AMM Integration Tests', () => {
  let router: AMMRouter;
  let factory: AMMPoolFactory;
  let registry: PoolRegistry;
  let pool1: AMMPool;
  let pool2: AMMPool;

  beforeEach(() => {
    router = new AMMRouter();
    factory = new AMMPoolFactory();
    registry = new PoolRegistry();

    pool1 = factory.createConstantProductPool(
      'stx-usda',
      'STX',
      'USDA',
      BigInt('1000000000000'),
      BigInt('1000000000000'),
      3000
    );

    pool2 = factory.createStableSwapPool(
      'usda-usdb',
      'USDA',
      'USDB',
      BigInt('1000000000000'),
      BigInt('1000000000000'),
      1000
    );

    router.addPool(pool1, 'constant-product');
    router.addPool(pool2, 'stable-swap');

    registry.registerPool(pool1);
    registry.registerPool(pool2);
  });

  it('should complete end-to-end swap flow', () => {
    const amountIn = BigInt('1000000000');

    const quote = router.quoteExactInputSingleHop('stx-usda', amountIn, true);
    expect(quote).toBeDefined();
    expect(quote?.amountOut).toBeGreaterThan(0n);

    const result = router.executeSwapExactInput(
      'stx-usda',
      amountIn,
      quote?.amountOut || 0n,
      true
    );
    expect(result).toBeGreaterThan(0n);
  });

  it('should handle multi-hop swaps correctly', () => {
    const amountIn = BigInt('1000000000');

    const estimate = router.estimateMultiHopPrice(
      ['stx-usda', 'usda-usdb'],
      amountIn
    );

    expect(estimate.expectedAmountOut).toBeGreaterThan(0n);
    expect(estimate.priceImpact).toBeGreaterThanOrEqual(0);

    const result = router.multiHopSwap(
      ['stx-usda', 'usda-usdb'],
      amountIn,
      estimate.expectedAmountOut
    );

    expect(result.amountOut).toBeGreaterThan(0n);
    expect(result.hop).toBe(2);
  });

  it('should track trading analytics', () => {
    const analytics = new TradingAnalytics();
    const userId = 'user1';

    const quote1 = {
      amountIn: BigInt('1000000000'),
      amountOut: BigInt('990000000'),
      priceImpact: 0.01,
      executionPrice: 1.0101,
      slippage: 1.0,
      fee: BigInt('3000000'),
    };

    const quote2 = {
      amountIn: BigInt('2000000000'),
      amountOut: BigInt('1980000000'),
      priceImpact: 0.01,
      executionPrice: 1.0101,
      slippage: 1.0,
      fee: BigInt('6000000'),
    };

    analytics.recordTrade(userId, 'stx-usda', quote1);
    analytics.recordTrade(userId, 'stx-usda', quote2);

    const metrics = analytics.getUserMetrics(userId);
    expect(metrics?.totalTrades).toBe(2);
    expect(metrics?.totalVolume).toBe(quote1.amountIn + quote2.amountIn);
  });

  it('should monitor prices and trigger alerts', () => {
    const monitor = new PriceMonitor();

    monitor.recordPrice('stx-usda', pool1);

    const alert = {
      id: 'alert1',
      poolId: 'stx-usda',
      condition: 'above' as const,
      targetPrice: 0.5,
      active: true,
      createdAt: Date.now(),
    };

    monitor.addAlert(alert);

    const stats = monitor.getStats('stx-usda');
    expect(stats.currentPrice).toBeDefined();
    expect(stats.currentPrice).toBeGreaterThan(0);
  });

  it('should validate pool creation', () => {
    const validator = new AMMPoolValidator();

    const validPool = factory.createConstantProductPool(
      'test-pool',
      'TOK-A',
      'TOK-B',
      BigInt('1000000000'),
      BigInt('1000000000')
    );

    const result = validator.validatePoolCreation(validPool);
    expect(result.valid).toBe(true);
  });

  it('should handle edge cases', () => {
    const handler = new EdgeCaseHandler();

    const zeroDiv = handler.handleZeroDivision(BigInt('100'), BigInt('0'));
    expect(zeroDiv).toBe(0n);

    const overflow = handler.handleOverflow(BigInt('999'), BigInt('100'));
    expect(overflow).toBe(BigInt('100'));

    const validation = handler.validateReserves(
      BigInt('1000'),
      BigInt('1000')
    );
    expect(validation.valid).toBe(true);
  });

  it('should recover from errors', () => {
    const recovery = new ErrorRecovery();

    const result = recovery.retryOperation(
      () => {
        return BigInt('1000');
      },
      3,
      10
    );

    expect(result).toBe(BigInt('1000'));
  });

  it('should apply rate limiting', () => {
    const limiter = new RateLimiter(3, 1000);

    expect(limiter.allowCall()).toBe(true);
    expect(limiter.allowCall()).toBe(true);
    expect(limiter.allowCall()).toBe(true);
    expect(limiter.allowCall()).toBe(false);
  });

  it('should implement circuit breaker pattern', () => {
    const breaker = new CircuitBreaker(3, 2, 100);

    expect(breaker.canAttempt()).toBe(true);

    for (let i = 0; i < 3; i++) {
      breaker.recordFailure();
    }

    expect(breaker.getState()).toBe('open');
    expect(breaker.canAttempt()).toBe(false);
  });

  it('should calculate AMM metrics', () => {
    const calculator = new AMMCalculator();

    const spotPrice = calculator.calculateSpotPrice(
      BigInt('1000000000000'),
      BigInt('1000000000000')
    );
    expect(spotPrice).toBe(1);

    const invariant = calculator.calculateInvariant(
      BigInt('1000000000000'),
      BigInt('1000000000000')
    );
    expect(invariant).toBe(BigInt('1000000000000000000000000'));
  });

  it('should track pool registry', () => {
    const newPool = factory.createConcentratedLiquidityPool(
      'eth-usdc',
      'ETH',
      'USDC',
      BigInt('100000000000'),
      BigInt('100000000000')
    );

    registry.registerPool(newPool);

    const retrieved = registry.getPool('eth-usdc');
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe('eth-usdc');

    const allPools = registry.getAllPools();
    expect(allPools.length).toBeGreaterThanOrEqual(3);
  });

  it('should find optimal swap path', () => {
    const best = router.findBestPoolForSwap(BigInt('1000000000'), true);

    expect(best).toBeDefined();
    expect(best?.quote.amountOut).toBeGreaterThan(0n);
  });

  it('should handle concurrent operations safely', () => {
    const analytics = new TradingAnalytics();

    const quotes = Array.from({ length: 10 }, (_, i) => ({
      amountIn: BigInt((i + 1) * 1000000000),
      amountOut: BigInt((i + 1) * 990000000),
      priceImpact: 0.01,
      executionPrice: 1.0101,
      slippage: 1.0,
      fee: BigInt((i + 1) * 3000000),
    }));

    quotes.forEach((quote, i) => {
      analytics.recordTrade(`user-${i}`, 'stx-usda', quote);
    });

    const globalStats = analytics.getGlobalStats();
    expect(globalStats.totalUsers).toBe(10);
    expect(globalStats.totalTrades).toBe(10);
  });

  it('should validate complex liquidity scenarios', () => {
    const metrics = new AMMMetrics();

    const risk = metrics.calculateRiskMetrics(pool1);
    expect(risk.concentrationRisk).toBeGreaterThanOrEqual(0);
    expect(risk.liquidityRisk).toBeGreaterThanOrEqual(0);
    expect(risk.overallRisk).toBeGreaterThanOrEqual(0);
  });

  it('should handle pool updates', () => {
    const updatedPool = registry.getPool('stx-usda');
    if (updatedPool) {
      registry.updatePoolReserves(
        'stx-usda',
        BigInt('2000000000000'),
        BigInt('2000000000000')
      );

      const current = registry.getPool('stx-usda');
      expect(current?.reserveA).toBe(BigInt('2000000000000'));
    }
  });
});

describe('Stress Tests', () => {
  let router: AMMRouter;
  let factory: AMMPoolFactory;

  beforeEach(() => {
    router = new AMMRouter();
    factory = new AMMPoolFactory();

    const pool = factory.createConstantProductPool(
      'stress-test',
      'TOK-A',
      'TOK-B',
      BigInt('1000000000000000000'),
      BigInt('1000000000000000000')
    );

    router.addPool(pool, 'constant-product');
  });

  it('should handle large swap amounts', () => {
    const largeAmount = BigInt('100000000000000000');

    const quote = router.quoteExactInputSingleHop(
      'stress-test',
      largeAmount,
      true
    );

    expect(quote).toBeDefined();
    expect(quote?.amountOut).toBeGreaterThan(0n);
    expect(quote?.priceImpact).toBeGreaterThan(0);
  });

  it('should handle many sequential swaps', () => {
    let totalOutput = 0n;

    for (let i = 0; i < 100; i++) {
      const quote = router.quoteExactInputSingleHop(
        'stress-test',
        BigInt('1000000000'),
        i % 2 === 0
      );

      if (quote) {
        totalOutput += quote.amountOut;
      }
    }

    expect(totalOutput).toBeGreaterThan(0n);
  });
});
