import { SwapQuote, AMMPool } from '@/types/amm';

export class SlippageOptimizer {
  private maxSlippage: number;
  private slippageHistory: number[];
  private historySize: number;

  constructor(maxSlippagePercent: number = 1, historySize: number = 100) {
    this.maxSlippage = maxSlippagePercent;
    this.slippageHistory = [];
    this.historySize = historySize;
  }

  recordSlippage(slippage: number): void {
    this.slippageHistory.push(slippage);
    if (this.slippageHistory.length > this.historySize) {
      this.slippageHistory.shift();
    }
  }

  isSlippageAcceptable(quote: SwapQuote): boolean {
    return quote.slippage <= this.maxSlippage;
  }

  getAverageSlippage(): number {
    if (this.slippageHistory.length === 0) return 0;
    const sum = this.slippageHistory.reduce((a, b) => a + b, 0);
    return sum / this.slippageHistory.length;
  }

  getMaxSlippageObserved(): number {
    return this.slippageHistory.length > 0 ? Math.max(...this.slippageHistory) : 0;
  }

  getMinSlippageObserved(): number {
    return this.slippageHistory.length > 0 ? Math.min(...this.slippageHistory) : 0;
  }

  setMaxSlippage(maxSlippagePercent: number): void {
    if (maxSlippagePercent <= 0 || maxSlippagePercent > 100) {
      throw new Error('Max slippage must be between 0 and 100 percent');
    }
    this.maxSlippage = maxSlippagePercent;
  }

  getMaxSlippage(): number {
    return this.maxSlippage;
  }

  calculateMinimumOutput(amountOut: bigint, slippagePercent: number): bigint {
    const slippageMultiplier = (100 - slippagePercent) / 100;
    return BigInt(Math.floor(Number(amountOut) * slippageMultiplier));
  }

  calculateMinimumOutputBasis(amountOut: bigint, slippageBasisPoints: number): bigint {
    const slippageMultiplier = (10000 - slippageBasisPoints) / 10000;
    return BigInt(Math.floor(Number(amountOut) * slippageMultiplier));
  }

  optimizeSlippageForPool(
    pool: AMMPool,
    amountIn: bigint,
    targetSlippage: number
  ): { optimalAmount: bigint; expectedSlippage: number } | null {
    const k = 10;
    const adjustments: { amount: bigint; slippage: number }[] = [];

    for (let i = 0; i <= k; i++) {
      const fraction = i / k;
      const testAmount = BigInt(
        Math.floor(Number(amountIn) * (0.5 + fraction * 0.5))
      );

      const spotPrice = Number(pool.reserveB) / Number(pool.reserveA);
      const newReserveA = pool.reserveA + testAmount;
      const newReserveB = (pool.reserveA * pool.reserveB) / newReserveA;
      const amountOut = pool.reserveB > newReserveB ? pool.reserveB - newReserveB : 0n;

      const executionPrice = Number(testAmount) / Number(amountOut);
      const priceImpact = Math.abs((executionPrice - spotPrice) / spotPrice);
      const slippage = priceImpact * 100;

      adjustments.push({ amount: testAmount, slippage });
    }

    const closest = adjustments.reduce((prev, curr) =>
      Math.abs(curr.slippage - targetSlippage) < Math.abs(prev.slippage - targetSlippage)
        ? curr
        : prev
    );

    return {
      optimalAmount: closest.amount,
      expectedSlippage: closest.slippage,
    };
  }

  getSlippageStatistics(): {
    average: number;
    max: number;
    min: number;
    stdDev: number;
    count: number;
  } {
    const average = this.getAverageSlippage();
    const max = this.getMaxSlippageObserved();
    const min = this.getMinSlippageObserved();

    let stdDev = 0;
    if (this.slippageHistory.length > 1) {
      const variance = this.slippageHistory.reduce(
        (sum, val) => sum + Math.pow(val - average, 2),
        0
      ) / this.slippageHistory.length;
      stdDev = Math.sqrt(variance);
    }

    return {
      average,
      max,
      min,
      stdDev,
      count: this.slippageHistory.length,
    };
  }

  clearHistory(): void {
    this.slippageHistory = [];
  }
}

export class PriceImpactCalculator {
  calculatePriceImpact(
    spotPrice: number,
    executionPrice: number
  ): number {
    if (spotPrice === 0) return 0;
    return Math.abs((executionPrice - spotPrice) / spotPrice);
  }

  calculateExecutionPrice(amountIn: bigint, amountOut: bigint): number {
    if (Number(amountOut) === 0) return 0;
    return Number(amountIn) / Number(amountOut);
  }

  getExpectedAmountOut(
    amountIn: bigint,
    spotPrice: number,
    priceImpact: number
  ): bigint {
    const actualPrice = spotPrice * (1 + priceImpact);
    const amountOut = Number(amountIn) / actualPrice;
    return BigInt(Math.floor(amountOut));
  }

  estimateMultiHopSlippage(
    hops: number,
    singleHopSlippage: number
  ): number {
    let cumulativeSlippage = 0;
    for (let i = 0; i < hops; i++) {
      cumulativeSlippage += singleHopSlippage;
      cumulativeSlippage += cumulativeSlippage * singleHopSlippage;
    }
    return cumulativeSlippage;
  }
}

export class AMMSlippageRouter {
  private slippageOptimizer: SlippageOptimizer;
  private priceImpactCalc: PriceImpactCalculator;

  constructor(maxSlippagePercent: number = 1) {
    this.slippageOptimizer = new SlippageOptimizer(maxSlippagePercent);
    this.priceImpactCalc = new PriceImpactCalculator();
  }

  findBestPath(
    pools: AMMPool[],
    amountIn: bigint,
    targetSlippage: number
  ): {
    poolIndex: number;
    expectedOutput: bigint;
    slippage: number;
  } | null {
    let bestPath = null;
    let closestSlippage = Infinity;

    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      const spotPrice = Number(pool.reserveB) / Number(pool.reserveA);
      const newReserveA = pool.reserveA + amountIn;
      const newReserveB = (pool.reserveA * pool.reserveB) / newReserveA;
      const amountOut = pool.reserveB > newReserveB ? pool.reserveB - newReserveB : 0n;

      const executionPrice = Number(amountIn) / Number(amountOut);
      const priceImpact = this.priceImpactCalc.calculatePriceImpact(
        spotPrice,
        executionPrice
      );
      const slippage = priceImpact * 100;

      if (Math.abs(slippage - targetSlippage) < closestSlippage) {
        closestSlippage = Math.abs(slippage - targetSlippage);
        bestPath = {
          poolIndex: i,
          expectedOutput: amountOut,
          slippage,
        };
      }
    }

    return bestPath;
  }

  validateSwapQuote(quote: SwapQuote, maxAllowedSlippage: number): boolean {
    return quote.slippage <= maxAllowedSlippage;
  }
}
