import { AMMPool } from '@/types/amm';

export interface SwapStrategy {
  execute(pool: AMMPool, amountIn: bigint): bigint;
  getName(): string;
  getDescription(): string;
}

export class DCAStrategy implements SwapStrategy {
  private intervals: number;
  private currentInterval: number;

  constructor(intervals: number = 10) {
    this.intervals = intervals;
    this.currentInterval = 0;
  }

  execute(pool: AMMPool, amountIn: bigint): bigint {
    const amountPerInterval = amountIn / BigInt(this.intervals);
    let totalOutput = 0n;

    for (let i = 0; i < this.intervals; i++) {
      const spotPrice = Number(pool.reserveB) / Number(pool.reserveA);
      const newReserveA = pool.reserveA + amountPerInterval;
      const newReserveB = (pool.reserveA * pool.reserveB) / newReserveA;
      const output = pool.reserveB > newReserveB ? pool.reserveB - newReserveB : 0n;

      totalOutput += output;

      pool.reserveA = newReserveA;
      pool.reserveB = newReserveB;
    }

    return totalOutput;
  }

  getName(): string {
    return 'Dollar Cost Averaging';
  }

  getDescription(): string {
    return `Split swap into ${this.intervals} intervals to reduce price impact`;
  }
}

export class LimitOrderStrategy implements SwapStrategy {
  private targetPrice: number;
  private executed: boolean;

  constructor(targetPrice: number) {
    this.targetPrice = targetPrice;
    this.executed = false;
  }

  execute(pool: AMMPool, amountIn: bigint): bigint {
    const currentPrice = Number(pool.reserveB) / Number(pool.reserveA);

    if (currentPrice <= this.targetPrice) {
      this.executed = true;

      const newReserveA = pool.reserveA + amountIn;
      const newReserveB = (pool.reserveA * pool.reserveB) / newReserveA;
      const output = pool.reserveB > newReserveB ? pool.reserveB - newReserveB : 0n;

      pool.reserveA = newReserveA;
      pool.reserveB = newReserveB;

      return output;
    }

    return 0n;
  }

  getName(): string {
    return 'Limit Order';
  }

  getDescription(): string {
    return `Execute only when price reaches ${this.targetPrice}`;
  }

  isExecuted(): boolean {
    return this.executed;
  }
}

export class SlippageMinimizationStrategy implements SwapStrategy {
  private maxSlippagePercent: number;

  constructor(maxSlippagePercent: number = 0.5) {
    this.maxSlippagePercent = maxSlippagePercent;
  }

  execute(pool: AMMPool, amountIn: bigint): bigint {
    const spotPrice = Number(pool.reserveA) / Number(pool.reserveB);

    const testReserveA = pool.reserveA + amountIn;
    const testReserveB = (pool.reserveA * pool.reserveB) / testReserveA;
    const testOutput = pool.reserveB > testReserveB ? pool.reserveB - testReserveB : 0n;

    const executionPrice = Number(amountIn) / Number(testOutput);
    const priceImpact = Math.abs((executionPrice - spotPrice) / spotPrice);
    const slippagePercent = priceImpact * 100;

    if (slippagePercent <= this.maxSlippagePercent) {
      pool.reserveA = testReserveA;
      pool.reserveB = testReserveB;
      return testOutput;
    }

    return 0n;
  }

  getName(): string {
    return 'Slippage Minimization';
  }

  getDescription(): string {
    return `Only execute if slippage stays below ${this.maxSlippagePercent}%`;
  }
}

export class TWAPStrategy implements SwapStrategy {
  private timeWindow: number;
  private checkpoints: number;
  private prices: number[];

  constructor(timeWindowMs: number = 300000, checkpoints: number = 6) {
    this.timeWindow = timeWindowMs;
    this.checkpoints = checkpoints;
    this.prices = [];
  }

  execute(pool: AMMPool, amountIn: bigint): bigint {
    const currentPrice = Number(pool.reserveB) / Number(pool.reserveA);
    this.prices.push(currentPrice);

    const avgPrice = this.prices.reduce((a, b) => a + b, 0) / this.prices.length;

    const spotPrice = currentPrice;
    const deviation = Math.abs((currentPrice - avgPrice) / avgPrice);

    if (deviation < 0.02) {
      const newReserveA = pool.reserveA + amountIn;
      const newReserveB = (pool.reserveA * pool.reserveB) / newReserveA;
      const output = pool.reserveB > newReserveB ? pool.reserveB - newReserveB : 0n;

      pool.reserveA = newReserveA;
      pool.reserveB = newReserveB;

      return output;
    }

    return 0n;
  }

  getName(): string {
    return 'Time-Weighted Average Price';
  }

  getDescription(): string {
    return `Execute when price is within 2% of ${this.checkpoints}-point TWAP`;
  }

  getAveragePrice(): number {
    if (this.prices.length === 0) return 0;
    return this.prices.reduce((a, b) => a + b, 0) / this.prices.length;
  }
}

export class VolatilityAdjustedStrategy implements SwapStrategy {
  private lookbackPeriod: number;
  private volatilityMultiplier: number;
  private priceHistory: number[];

  constructor(lookbackPeriod: number = 10, volatilityMultiplier: number = 2) {
    this.lookbackPeriod = lookbackPeriod;
    this.volatilityMultiplier = volatilityMultiplier;
    this.priceHistory = [];
  }

  execute(pool: AMMPool, amountIn: bigint): bigint {
    const currentPrice = Number(pool.reserveB) / Number(pool.reserveA);
    this.priceHistory.push(currentPrice);

    if (this.priceHistory.length > this.lookbackPeriod) {
      this.priceHistory.shift();
    }

    const volatility = this.calculateVolatility();
    const adjustedAmount = this.adjustAmountForVolatility(amountIn, volatility);

    const newReserveA = pool.reserveA + adjustedAmount;
    const newReserveB = (pool.reserveA * pool.reserveB) / newReserveA;
    const output = pool.reserveB > newReserveB ? pool.reserveB - newReserveB : 0n;

    pool.reserveA = newReserveA;
    pool.reserveB = newReserveB;

    return output;
  }

  private calculateVolatility(): number {
    if (this.priceHistory.length < 2) return 0;

    const mean = this.priceHistory.reduce((a, b) => a + b, 0) / this.priceHistory.length;
    const variance =
      this.priceHistory.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
      this.priceHistory.length;

    return Math.sqrt(variance);
  }

  private adjustAmountForVolatility(amount: bigint, volatility: number): bigint {
    const adjustment = 1 / (1 + volatility * this.volatilityMultiplier);
    return BigInt(Math.floor(Number(amount) * adjustment));
  }

  getName(): string {
    return 'Volatility Adjusted';
  }

  getDescription(): string {
    return `Adjust swap size based on ${this.lookbackPeriod}-period price volatility`;
  }
}

export class SwapStrategySelector {
  selectOptimalStrategy(
    pool: AMMPool,
    amountIn: bigint,
    marketCondition: 'stable' | 'volatile' | 'trending'
  ): SwapStrategy {
    const currentPrice = Number(pool.reserveB) / Number(pool.reserveA);

    if (marketCondition === 'stable') {
      return new SlippageMinimizationStrategy(0.3);
    } else if (marketCondition === 'volatile') {
      return new VolatilityAdjustedStrategy(10, 2);
    } else {
      return new DCAStrategy(5);
    }
  }

  analyzeMarketCondition(priceHistory: number[]): 'stable' | 'volatile' | 'trending' {
    if (priceHistory.length < 2) return 'stable';

    const mean = priceHistory.reduce((a, b) => a + b, 0) / priceHistory.length;
    const variance =
      priceHistory.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
      priceHistory.length;
    const volatility = Math.sqrt(variance);
    const volatilityPercent = (volatility / mean) * 100;

    const trend = this.calculateTrend(priceHistory);

    if (volatilityPercent > 5) {
      return 'volatile';
    } else if (Math.abs(trend) > 2) {
      return 'trending';
    }

    return 'stable';
  }

  private calculateTrend(prices: number[]): number {
    if (prices.length < 2) return 0;

    const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
    const secondHalf = prices.slice(Math.floor(prices.length / 2));

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    return ((avgSecond - avgFirst) / avgFirst) * 100;
  }
}
