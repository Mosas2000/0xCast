/**
 * Market calculation helpers for 0xCast SDK
 */

import type { Market, MarketOdds, MarketOutcome } from './types.js';

export type { Market, MarketOdds, MarketOutcome };

// ─── Odds & Probability ───────────────────────────────────────────────────────

/**
 * Calculates the current odds and implied probabilities for a market
 * based on the AMM pool sizes.
 *
 * Returns 50/50 when both pools are empty.
 */
export function calculateOdds(yesPool: bigint, noPool: bigint): MarketOdds {
  const total = yesPool + noPool;

  if (total === 0n) {
    return {
      yes: 2.0,
      no: 2.0,
      yesImpliedProbability: 0.5,
      noImpliedProbability: 0.5,
    };
  }

  const yesProb = Number(yesPool) / Number(total);
  const noProb = Number(noPool) / Number(total);

  return {
    yes: yesProb > 0 ? 1 / yesProb : Infinity,
    no: noProb > 0 ? 1 / noProb : Infinity,
    yesImpliedProbability: yesProb,
    noImpliedProbability: noProb,
  };
}

/**
 * Calculates the potential payout for a given stake on an outcome.
 *
 * @param stake - Amount being staked (in micro-STX)
 * @param outcome - 'yes' or 'no'
 * @param yesPool - Current yes pool size (in micro-STX)
 * @param noPool - Current no pool size (in micro-STX)
 * @returns Estimated payout in micro-STX
 */
export function calculatePayout(
  stake: bigint,
  outcome: MarketOutcome,
  yesPool: bigint,
  noPool: bigint
): bigint {
  const total = yesPool + noPool + stake;
  const outcomePool = (outcome === 'yes' ? yesPool : noPool) + stake;

  if (outcomePool === 0n) return 0n;

  return (stake * total) / outcomePool;
}

/**
 * Formats a micro-STX amount as a human-readable STX string.
 *
 * @example
 * formatSTX(1_000_000n) // => '1.000000 STX'
 */
export function formatSTX(microStx: bigint, decimals = 6): string {
  const divisor = BigInt(10 ** decimals);
  const whole = microStx / divisor;
  const fraction = microStx % divisor;
  return `${whole}.${fraction.toString().padStart(decimals, '0')} STX`;
}

/**
 * Converts STX to micro-STX.
 *
 * @example
 * toMicroSTX(1.5) // => 1_500_000n
 */
export function toMicroSTX(stx: number): bigint {
  return BigInt(Math.round(stx * 1_000_000));
}

/**
 * Converts micro-STX to STX as a number.
 */
export function fromMicroSTX(microStx: bigint): number {
  return Number(microStx) / 1_000_000;
}

// ─── Market Status ────────────────────────────────────────────────────────────

/**
 * Returns true if the market is currently accepting predictions.
 */
export function isMarketOpen(market: Market): boolean {
  return market.status === 'open' && Date.now() < market.closesAt * 1000;
}

/**
 * Returns true if the market has been resolved.
 */
export function isMarketResolved(market: Market): boolean {
  return market.status === 'resolved';
}

/**
 * Returns the winning outcome label, or null if unresolved.
 */
export function getWinningOutcome(market: Market): 'Yes' | 'No' | null {
  if (!market.resolvedOutcome) return null;
  return market.resolvedOutcome === 'yes' ? 'Yes' : 'No';
}
