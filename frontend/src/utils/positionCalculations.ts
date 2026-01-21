import { Position, Market, MarketOutcome, MarketStatus } from '../types/market';
import { calculatePotentialWinnings } from './calculations';
import { microStxToStx } from '../constants/markets';

/**
 * Calculate the current value of a user's position
 * @param position - User's position
 * @param market - Market data
 * @returns Current value in microSTX
 */
export function calculateCurrentValue(position: Position, market: Market): number {
    // If market is resolved, return claimable amount
    if (market.status === MarketStatus.RESOLVED) {
        return calculateClaimableAmount(position, market);
    }

    // For active markets, return potential winnings based on current odds
    const yesWinnings = position.yesStake > 0
        ? calculatePotentialWinnings(position.yesStake, market.totalYesStake, market.totalNoStake, MarketOutcome.YES)
        : 0;

    const noWinnings = position.noStake > 0
        ? calculatePotentialWinnings(position.noStake, market.totalYesStake, market.totalNoStake, MarketOutcome.NO)
        : 0;

    // Return the average of both potential outcomes
    return Math.floor((yesWinnings + noWinnings) / 2);
}

/**
 * Calculate profit/loss for a position
 * @param position - User's position
 * @param market - Market data
 * @returns Profit/loss in microSTX (positive = profit, negative = loss)
 */
export function calculateProfitLoss(position: Position, market: Market): number {
    const totalStaked = position.yesStake + position.noStake;
    const currentValue = calculateCurrentValue(position, market);

    return currentValue - totalStaked;
}

/**
 * Check if user's position would win if market resolved now
 * @param position - User's position
 * @param market - Market data
 * @returns true if position would win
 */
export function isWinningPosition(position: Position, market: Market): boolean {
    if (market.status !== MarketStatus.RESOLVED) {
        // For unresolved markets, can't determine winner
        return false;
    }

    // Check if user has stake on the winning outcome
    if (market.outcome === MarketOutcome.YES && position.yesStake > 0) {
        return true;
    }

    if (market.outcome === MarketOutcome.NO && position.noStake > 0) {
        return true;
    }

    return false;
}

/**
 * Calculate claimable winnings for a resolved market
 * @param position - User's position
 * @param market - Market data
 * @returns Claimable amount in microSTX (0 if already claimed or lost)
 */
export function calculateClaimableAmount(position: Position, market: Market): number {
    // Can't claim if market not resolved
    if (market.status !== MarketStatus.RESOLVED) {
        return 0;
    }

    // Can't claim if already claimed
    if (position.claimed) {
        return 0;
    }

    // Calculate winnings based on outcome
    if (market.outcome === MarketOutcome.YES && position.yesStake > 0) {
        return calculatePotentialWinnings(
            position.yesStake,
            market.totalYesStake,
            market.totalNoStake,
            MarketOutcome.YES
        );
    }

    if (market.outcome === MarketOutcome.NO && position.noStake > 0) {
        return calculatePotentialWinnings(
            position.noStake,
            market.totalYesStake,
            market.totalNoStake,
            MarketOutcome.NO
        );
    }

    // User didn't stake on winning outcome
    return 0;
}

/**
 * Format position value for display
 * @param microStx - Amount in microSTX
 * @returns Formatted string with STX
 */
export function formatPositionValue(microStx: number): string {
    const stx = microStxToStx(microStx);
    return `${stx.toFixed(2)} STX`;
}

/**
 * Calculate profit/loss percentage
 * @param position - User's position
 * @param market - Market data
 * @returns Percentage as decimal (e.g., 0.25 = 25%)
 */
export function calculateProfitLossPercentage(position: Position, market: Market): number {
    const totalStaked = position.yesStake + position.noStake;

    if (totalStaked === 0) {
        return 0;
    }

    const profitLoss = calculateProfitLoss(position, market);
    return profitLoss / totalStaked;
}
