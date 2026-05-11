import { AMMPool, SwapQuote } from '@/types/amm';

export class EdgeCaseHandler {
  handleZeroDivision(numerator: bigint, denominator: bigint): bigint {
    if (denominator === 0n) {
      return 0n;
    }
    return numerator / denominator;
  }

  handleOverflow(value: bigint, maxValue: bigint): bigint {
    return value > maxValue ? maxValue : value;
  }

  handleUnderflow(value: bigint, minValue: bigint): bigint {
    return value < minValue ? minValue : value;
  }

  validateAmountIn(amount: bigint, maxAllowed: bigint): { valid: boolean; corrected: bigint } {
    if (amount <= 0n) {
      return { valid: false, corrected: 0n };
    }

    if (amount > maxAllowed) {
      return { valid: false, corrected: maxAllowed };
    }

    return { valid: true, corrected: amount };
  }

  validateReserves(
    reserveA: bigint,
    reserveB: bigint
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (reserveA < 0n) {
      errors.push('Reserve A is negative');
    }

    if (reserveB < 0n) {
      errors.push('Reserve B is negative');
    }

    if (reserveA === 0n && reserveB !== 0n) {
      errors.push('Reserve A is zero while B is not');
    }

    if (reserveB === 0n && reserveA !== 0n) {
      errors.push('Reserve B is zero while A is not');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  detectArithmeticIssues(a: bigint, b: bigint, operation: 'add' | 'sub' | 'mul' | 'div'): {
    safe: boolean;
    issue?: string;
  } {
    const MAX_BIGINT = BigInt('99999999999999999999999999');

    if (operation === 'add') {
      if (a > 0n && b > 0n && a > MAX_BIGINT - b) {
        return { safe: false, issue: 'Addition overflow' };
      }
    }

    if (operation === 'mul') {
      if (a > 0n && b > 0n && a > MAX_BIGINT / b) {
        return { safe: false, issue: 'Multiplication overflow' };
      }
    }

    if (operation === 'div' && b === 0n) {
      return { safe: false, issue: 'Division by zero' };
    }

    return { safe: true };
  }
}

export class ErrorRecovery {
  attemptSwapWithFallback(
    pool: AMMPool,
    amountIn: bigint,
    tokenAtoB: boolean,
    fallbackAmount: bigint = BigInt('0')
  ): bigint {
    try {
      if (amountIn <= 0n) {
        throw new Error('Invalid amount');
      }

      if (tokenAtoB && pool.reserveB === 0n) {
        throw new Error('Insufficient reserve B');
      }

      if (!tokenAtoB && pool.reserveA === 0n) {
        throw new Error('Insufficient reserve A');
      }

      const newReserveA = pool.reserveA + (tokenAtoB ? amountIn : 0n);
      const newReserveB = pool.reserveB + (!tokenAtoB ? amountIn : 0n);

      if (newReserveA === 0n || newReserveB === 0n) {
        return fallbackAmount;
      }

      const invariant = pool.reserveA * pool.reserveB;
      let output = 0n;

      if (tokenAtoB) {
        const newReserveB = invariant / newReserveA;
        output = pool.reserveB > newReserveB ? pool.reserveB - newReserveB : 0n;
      } else {
        const newReserveA = invariant / newReserveB;
        output = pool.reserveA > newReserveA ? pool.reserveA - newReserveA : 0n;
      }

      return output;
    } catch (error) {
      console.error('Swap failed, using fallback:', error);
      return fallbackAmount;
    }
  }

  retryOperation<T>(
    operation: () => T,
    maxRetries: number = 3,
    delayMs: number = 100
  ): T | null {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (i < maxRetries - 1) {
          const delay = delayMs * Math.pow(2, i);
          console.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms:`, lastError.message);
        }
      }
    }

    console.error('Operation failed after retries:', lastError);
    return null;
  }

  gracefulDegradation(
    primaryValue: bigint,
    fallbackValue: bigint,
    validator: (value: bigint) => boolean
  ): bigint {
    if (validator(primaryValue)) {
      return primaryValue;
    }

    if (validator(fallbackValue)) {
      return fallbackValue;
    }

    return 0n;
  }

  sanitizeSwapQuote(quote: SwapQuote): SwapQuote {
    return {
      amountIn: quote.amountIn < 0n ? 0n : quote.amountIn,
      amountOut: quote.amountOut < 0n ? 0n : quote.amountOut,
      priceImpact: Math.max(0, Math.min(1, quote.priceImpact)),
      executionPrice: Math.max(0, quote.executionPrice),
      slippage: Math.max(0, quote.slippage),
      fee: quote.fee < 0n ? 0n : quote.fee,
    };
  }

  validatePoolInvariant(
    reserveA: bigint,
    reserveB: bigint,
    lastKnownInvariant: bigint
  ): {
    valid: boolean;
    deviation: number;
  } {
    const currentInvariant = reserveA * reserveB;
    const deviation =
      Number(lastKnownInvariant - currentInvariant) / Number(lastKnownInvariant);

    const valid = Math.abs(deviation) < 0.01;

    return { valid, deviation: Math.abs(deviation) };
  }
}

export class RateLimiter {
  private lastCallTime: number = 0;
  private callCount: number = 0;
  private timeWindow: number;
  private maxCallsPerWindow: number;

  constructor(maxCallsPerWindow: number = 100, timeWindowMs: number = 60000) {
    this.maxCallsPerWindow = maxCallsPerWindow;
    this.timeWindow = timeWindowMs;
  }

  allowCall(): boolean {
    const now = Date.now();

    if (now - this.lastCallTime > this.timeWindow) {
      this.callCount = 0;
      this.lastCallTime = now;
    }

    this.callCount++;

    return this.callCount <= this.maxCallsPerWindow;
  }

  getCallsRemaining(): number {
    return Math.max(0, this.maxCallsPerWindow - this.callCount);
  }

  reset(): void {
    this.callCount = 0;
    this.lastCallTime = 0;
  }
}

export class CircuitBreaker {
  private failureCount: number = 0;
  private successCount: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private lastStateChangeTime: number = Date.now();
  private failureThreshold: number;
  private successThreshold: number;
  private resetTimeout: number;

  constructor(
    failureThreshold: number = 5,
    successThreshold: number = 2,
    resetTimeoutMs: number = 60000
  ) {
    this.failureThreshold = failureThreshold;
    this.successThreshold = successThreshold;
    this.resetTimeout = resetTimeoutMs;
  }

  canAttempt(): boolean {
    if (this.state === 'closed') return true;
    if (this.state === 'open') {
      const timeSinceOpen = Date.now() - this.lastStateChangeTime;
      if (timeSinceOpen >= this.resetTimeout) {
        this.state = 'half-open';
        this.successCount = 0;
        return true;
      }
      return false;
    }
    return true;
  }

  recordSuccess(): void {
    this.failureCount = 0;

    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'closed';
        this.lastStateChangeTime = Date.now();
      }
    }
  }

  recordFailure(): void {
    this.failureCount++;

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
      this.lastStateChangeTime = Date.now();
    }
  }

  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }

  reset(): void {
    this.failureCount = 0;
    this.successCount = 0;
    this.state = 'closed';
    this.lastStateChangeTime = Date.now();
  }
}
