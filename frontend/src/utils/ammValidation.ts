import { SwapQuote, AMMPool } from '@/types/amm';

export class SwapParameterValidator {
  validateAmountIn(amount: bigint): boolean {
    return amount > 0n;
  }

  validateMinimumAmountOut(amountOut: bigint, minimum: bigint): boolean {
    return amountOut >= minimum;
  }

  validatePoolReserves(pool: AMMPool): boolean {
    return pool.reserveA > 0n && pool.reserveB > 0n;
  }

  validatePoolFee(fee: number): boolean {
    return fee >= 0 && fee <= 100000;
  }

  validateDeadline(deadline: number): boolean {
    return deadline > Date.now();
  }

  validateSwapQuote(quote: SwapQuote, maxSlippage: number): boolean {
    if (quote.amountOut === 0n) return false;
    if (quote.slippage > maxSlippage) return false;
    if (quote.fee < 0n) return false;
    return true;
  }

  validatePoolLiquidity(pool: AMMPool, minimumLiquidity: bigint): boolean {
    return pool.totalLiquidity >= minimumLiquidity;
  }
}

export class AMMPoolValidator {
  validatePoolCreation(pool: AMMPool): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!pool.id || pool.id.trim().length === 0) {
      errors.push('Pool ID cannot be empty');
    }

    if (pool.reserveA <= 0n) {
      errors.push('Reserve A must be positive');
    }

    if (pool.reserveB <= 0n) {
      errors.push('Reserve B must be positive');
    }

    if (pool.fee < 0 || pool.fee > 100000) {
      errors.push('Fee must be between 0 and 100000 basis points');
    }

    if (pool.totalLiquidity <= 0n) {
      errors.push('Total liquidity must be positive');
    }

    if (!pool.tokenA || !pool.tokenB) {
      errors.push('Both tokens must be specified');
    }

    if (pool.tokenA === pool.tokenB) {
      errors.push('Token A and Token B cannot be the same');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validatePoolConsistency(pool: AMMPool): {
    valid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];

    const invariant = pool.reserveA * pool.reserveB;
    const expectedMinInvariant = (pool.totalLiquidity * pool.totalLiquidity) / 4n;

    if (invariant < expectedMinInvariant) {
      warnings.push('Pool invariant appears lower than expected');
    }

    const reserveRatio = Number(pool.reserveA) / Number(pool.reserveB);
    if (reserveRatio > 1000 || reserveRatio < 0.001) {
      warnings.push('Extreme reserve ratio detected');
    }

    if (pool.fee < 1) {
      warnings.push('Very low fee may not cover operating costs');
    }

    if (pool.fee > 10000) {
      warnings.push('High fee may reduce trading volume');
    }

    return {
      valid: warnings.length === 0,
      warnings,
    };
  }
}

export class LiquidityValidator {
  validateLiquidityParameters(
    reserveA: bigint,
    reserveB: bigint,
    amountADesired: bigint,
    amountBDesired: bigint
  ): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (amountADesired <= 0n || amountBDesired <= 0n) {
      issues.push('Amounts must be positive');
    }

    if (reserveA === 0n || reserveB === 0n) {
      if (reserveA !== 0n || reserveB !== 0n) {
        issues.push('Both reserves must be zero or non-zero');
      }
    } else {
      const ratio = Number(amountBDesired) / Number(amountADesired);
      const reserveRatio = Number(reserveB) / Number(reserveA);
      const tolerance = 0.01;

      if (Math.abs(ratio - reserveRatio) / reserveRatio > tolerance) {
        issues.push(
          `Amount ratio does not match reserve ratio within ${tolerance * 100}%`
        );
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  validateRemovalAmount(
    liquidity: bigint,
    reserveA: bigint,
    reserveB: bigint,
    amountAMin: bigint,
    amountBMin: bigint
  ): {
    valid: boolean;
    expectedAmountA: bigint;
    expectedAmountB: bigint;
  } {
    const totalSupply = liquidity;
    const expectedAmountA = (reserveA * liquidity) / totalSupply;
    const expectedAmountB = (reserveB * liquidity) / totalSupply;

    const valid = expectedAmountA >= amountAMin && expectedAmountB >= amountBMin;

    return {
      valid,
      expectedAmountA,
      expectedAmountB,
    };
  }
}

export class FlashSwapValidator {
  validateFlashSwapRequest(
    poolId: string,
    tokenOut: string,
    amountOut: bigint,
    deadline: number
  ): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!poolId || poolId.trim().length === 0) {
      errors.push('Pool ID is required');
    }

    if (!tokenOut || !['A', 'B'].includes(tokenOut)) {
      errors.push('Token must be A or B');
    }

    if (amountOut <= 0n) {
      errors.push('Amount out must be positive');
    }

    if (deadline <= Date.now()) {
      errors.push('Deadline must be in the future');
    }

    const maxDeadline = Date.now() + 60 * 60 * 1000;
    if (deadline > maxDeadline) {
      errors.push('Deadline too far in the future');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateFlashSwapReturn(
    expectedReturn: bigint,
    actualReturn: bigint,
    flashFee: bigint
  ): {
    valid: boolean;
    deficit: bigint;
  } {
    const required = expectedReturn + flashFee;
    const valid = actualReturn >= required;
    const deficit = valid ? 0n : required - actualReturn;

    return {
      valid,
      deficit,
    };
  }
}

export class PriceValidator {
  validatePriceMovement(
    oldPrice: number,
    newPrice: number,
    maxChangePercent: number
  ): {
    valid: boolean;
    changePercent: number;
  } {
    const changePercent = Math.abs((newPrice - oldPrice) / oldPrice) * 100;
    const valid = changePercent <= maxChangePercent;

    return {
      valid,
      changePercent,
    };
  }

  validatePriceReasonableness(
    spotPrice: number,
    executionPrice: number,
    maxPriceDeviation: number
  ): boolean {
    const deviation = Math.abs(executionPrice - spotPrice) / spotPrice;
    return deviation <= maxPriceDeviation;
  }
}
