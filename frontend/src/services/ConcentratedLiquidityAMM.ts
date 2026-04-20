import { AMMPool, ConcentratedLiquidityPosition, SwapQuote, PricePoint } from '@/types/amm';

export class ConcentratedLiquidityAMM {
  private pool: AMMPool;
  private positions: Map<string, ConcentratedLiquidityPosition>;
  private tickLiquidity: Map<number, bigint>;
  private tickSpacing: number;
  private feeGrowthGlobal: bigint;

  constructor(pool: AMMPool, tickSpacing: number = 1) {
    this.pool = pool;
    this.positions = new Map();
    this.tickLiquidity = new Map();
    this.tickSpacing = tickSpacing;
    this.feeGrowthGlobal = 0n;
  }

  private getCurrentTick(): number {
    if (this.pool.reserveB === 0n) return 0;
    const price = Number(this.pool.reserveA) / Number(this.pool.reserveB);
    return Math.floor(Math.log2(price) * 10000);
  }

  private isInRange(tick: number, lowerTick: number, upperTick: number): boolean {
    return tick >= lowerTick && tick <= upperTick;
  }

  private getTickLiquidity(tick: number): bigint {
    return this.tickLiquidity.get(tick) || 0n;
  }

  createPosition(
    id: string,
    owner: string,
    lowerTick: number,
    upperTick: number,
    amount: bigint
  ): ConcentratedLiquidityPosition {
    const position: ConcentratedLiquidityPosition = {
      id,
      poolId: this.pool.id,
      owner,
      lowerTick,
      upperTick,
      liquidity: amount,
      feeGrowthInside: 0n,
    };

    this.positions.set(id, position);

    for (let tick = lowerTick; tick <= upperTick; tick += this.tickSpacing) {
      const current = this.getTickLiquidity(tick);
      this.tickLiquidity.set(tick, current + amount);
    }

    return position;
  }

  getPosition(id: string): ConcentratedLiquidityPosition | undefined {
    return this.positions.get(id);
  }

  removePosition(id: string): void {
    const position = this.positions.get(id);
    if (!position) return;

    for (let tick = position.lowerTick; tick <= position.upperTick; tick += this.tickSpacing) {
      const current = this.getTickLiquidity(tick);
      const updated = current > position.liquidity ? current - position.liquidity : 0n;
      if (updated === 0n) {
        this.tickLiquidity.delete(tick);
      } else {
        this.tickLiquidity.set(tick, updated);
      }
    }

    this.positions.delete(id);
  }

  getActiveLiquidity(): bigint {
    const currentTick = this.getCurrentTick();
    return this.getTickLiquidity(currentTick);
  }

  getConcentratedLiquidityRatio(): number {
    const activeLiquidity = this.getActiveLiquidity();
    const totalLiquidity = this.pool.totalLiquidity;

    if (totalLiquidity === 0n) return 0;
    return Number(activeLiquidity) / Number(totalLiquidity);
  }

  quoteSwapWithConcentration(amountIn: bigint, tokenAtoB: boolean): SwapQuote {
    const feeAmount = (amountIn * BigInt(this.pool.fee)) / 100000n;
    const amountInAfterFee = amountIn - feeAmount;

    const currentTick = this.getCurrentTick();
    const activeLiquidity = this.getActiveLiquidity();

    if (activeLiquidity === 0n) {
      throw new Error('No concentrated liquidity available at current tick');
    }

    const invariant = this.pool.reserveA * this.pool.reserveB;
    const reserveMultiplier = 1n + (10000n / (10000n + BigInt(this.getConcentratedLiquidityRatio() * 10000)));

    let newReserveA = this.pool.reserveA;
    let newReserveB = this.pool.reserveB;

    if (tokenAtoB) {
      newReserveA = this.pool.reserveA + amountInAfterFee;
      newReserveB = invariant / (newReserveA / reserveMultiplier);
    } else {
      newReserveB = this.pool.reserveB + amountInAfterFee;
      newReserveA = invariant / (newReserveB / reserveMultiplier);
    }

    const amountOut = tokenAtoB ? 
      (this.pool.reserveB > newReserveB ? this.pool.reserveB - newReserveB : 0n) :
      (this.pool.reserveA > newReserveA ? this.pool.reserveA - newReserveA : 0n);

    const spotPrice = Number(this.pool.reserveB) / Number(this.pool.reserveA);
    const executionPrice = Number(amountIn) / Number(amountOut);
    const priceImpact = Math.abs((executionPrice - spotPrice) / spotPrice);
    const slippage = priceImpact * 100;

    return {
      amountIn,
      amountOut,
      priceImpact,
      executionPrice,
      slippage,
      fee: feeAmount,
    };
  }

  executeConcentratedSwap(amountIn: bigint, tokenAtoB: boolean): bigint {
    const quote = this.quoteSwapWithConcentration(amountIn, tokenAtoB);

    if (tokenAtoB) {
      this.pool.reserveA += quote.amountIn - quote.fee;
      this.pool.reserveB -= quote.amountOut;
    } else {
      this.pool.reserveB += quote.amountIn - quote.fee;
      this.pool.reserveA -= quote.amountOut;
    }

    this.collectFees(quote.fee);

    return quote.amountOut;
  }

  private collectFees(feeAmount: bigint): void {
    const activeLiquidity = this.getActiveLiquidity();
    if (activeLiquidity > 0n) {
      const feePerUnit = feeAmount / activeLiquidity;
      this.feeGrowthGlobal += feePerUnit;
    }
  }

  claimFees(positionId: string): bigint {
    const position = this.positions.get(positionId);
    if (!position) return 0n;

    const feeGrowthDelta = this.feeGrowthGlobal - position.feeGrowthInside;
    const feesEarned = (position.liquidity * feeGrowthDelta) / 1n;

    position.feeGrowthInside = this.feeGrowthGlobal;

    return feesEarned;
  }

  getPricePoints(lowerTick: number, upperTick: number): PricePoint[] {
    const points: PricePoint[] = [];

    for (let tick = lowerTick; tick <= upperTick; tick += this.tickSpacing) {
      const liquidity = this.getTickLiquidity(tick);
      const price = Math.pow(2, tick / 10000);

      points.push({
        tick,
        price,
        liquidity,
      });
    }

    return points;
  }

  getLiquidityDistribution(): { tick: number; liquidity: bigint }[] {
    return Array.from(this.tickLiquidity.entries()).map(([tick, liquidity]) => ({
      tick,
      liquidity,
    }));
  }

  getCapitalEfficiency(): number {
    const activeLiquidity = this.getActiveLiquidity();
    const totalLiquidity = this.pool.totalLiquidity;

    if (totalLiquidity === 0n) return 0;

    const efficiency = Number(activeLiquidity) / Number(totalLiquidity);
    return efficiency * 100;
  }
}
