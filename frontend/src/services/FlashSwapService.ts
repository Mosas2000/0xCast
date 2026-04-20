import { AMMPool, FlashSwapRequest, FlashSwapCallback } from '@/types/amm';

export class FlashSwapService {
  private pool: AMMPool;
  private flashLoanFee: number;
  private activeFlashSwaps: Map<string, FlashSwapRequest>;

  constructor(pool: AMMPool, flashLoanFeePercentage: number = 0.05) {
    this.pool = pool;
    this.flashLoanFee = flashLoanFeePercentage;
    this.activeFlashSwaps = new Map();
  }

  initiateFlashSwap(
    id: string,
    tokenOut: string,
    amountOut: bigint,
    callback: FlashSwapCallback
  ): void {
    if (tokenOut === 'A') {
      if (amountOut > this.pool.reserveA) {
        throw new Error('Insufficient liquidity for flash swap');
      }
    } else if (tokenOut === 'B') {
      if (amountOut > this.pool.reserveB) {
        throw new Error('Insufficient liquidity for flash swap');
      }
    } else {
      throw new Error('Invalid token');
    }

    const request: FlashSwapRequest = {
      id,
      borrower: callback.borrower,
      tokenOut,
      amountOut,
      fee: this.calculateFlashSwapFee(amountOut),
      deadline: callback.deadline,
      executed: false,
    };

    this.activeFlashSwaps.set(id, request);
  }

  executeFlashSwap(
    id: string,
    callback: FlashSwapCallback
  ): { amountIn: bigint; fee: bigint } {
    const request = this.activeFlashSwaps.get(id);
    if (!request) {
      throw new Error('Flash swap not found');
    }

    if (request.executed) {
      throw new Error('Flash swap already executed');
    }

    if (Date.now() > request.deadline) {
      throw new Error('Flash swap deadline exceeded');
    }

    const token = request.tokenOut;
    const amount = request.amountOut;
    const fee = request.fee;

    if (token === 'A') {
      this.pool.reserveA -= amount;
    } else {
      this.pool.reserveB -= amount;
    }

    let requiredReturn = amount + fee;

    try {
      const result = callback.onFlashSwap(id, token, amount, fee);
      requiredReturn = result.amountToReturn;
    } catch (error) {
      if (token === 'A') {
        this.pool.reserveA += amount;
      } else {
        this.pool.reserveB += amount;
      }
      throw new Error(`Flash swap callback failed: ${error}`);
    }

    if (requiredReturn < amount + fee) {
      if (token === 'A') {
        this.pool.reserveA += amount;
      } else {
        this.pool.reserveB += amount;
      }
      throw new Error('Insufficient amount returned to complete flash swap');
    }

    if (token === 'A') {
      this.pool.reserveA += requiredReturn;
    } else {
      this.pool.reserveB += requiredReturn;
    }

    request.executed = true;

    return {
      amountIn: requiredReturn,
      fee,
    };
  }

  calculateFlashSwapFee(amount: bigint): bigint {
    const feePercentage = BigInt(Math.floor(this.flashLoanFee * 10000));
    return (amount * feePercentage) / 1000000n;
  }

  validateFlashSwapSafety(
    id: string,
    expectedAmountIn: bigint
  ): boolean {
    const request = this.activeFlashSwaps.get(id);
    if (!request) return false;

    const minimumRequired = request.amountOut + request.fee;
    return expectedAmountIn >= minimumRequired;
  }

  getFlashSwapStatus(id: string): { status: string; executed: boolean } | null {
    const request = this.activeFlashSwaps.get(id);
    if (!request) return null;

    const status = request.executed ? 'completed' : 'pending';
    return {
      status,
      executed: request.executed,
    };
  }

  cleanupExpiredFlashSwaps(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [id, request] of this.activeFlashSwaps.entries()) {
      if (now > request.deadline && !request.executed) {
        this.activeFlashSwaps.delete(id);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  getFlashSwapStats(): {
    totalActive: number;
    totalExecuted: number;
    totalFeeCollected: bigint;
  } {
    let totalFeeCollected = 0n;
    let totalExecuted = 0;

    for (const request of this.activeFlashSwaps.values()) {
      totalFeeCollected += request.fee;
      if (request.executed) {
        totalExecuted++;
      }
    }

    return {
      totalActive: this.activeFlashSwaps.size,
      totalExecuted,
      totalFeeCollected,
    };
  }

  setFlashLoanFee(feePercentage: number): void {
    if (feePercentage < 0 || feePercentage > 1) {
      throw new Error('Flash loan fee must be between 0 and 1 percent');
    }
    this.flashLoanFee = feePercentage;
  }

  getFlashLoanFee(): number {
    return this.flashLoanFee;
  }
}
