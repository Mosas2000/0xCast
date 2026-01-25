import type { Market, Position } from '../types/market';
import { MarketStatus, MarketOutcome } from '../types/market';
import { microStxToStx } from '../constants/markets';

/**
 * Parse raw market data from contract response to Market type
 * @param marketId - The market ID
 * @param rawData - Raw data from contract call
 * @returns Parsed Market object
 */
export function parseMarketData(marketId: number, rawData: any): Market {
    return {
        id: marketId,
        question: rawData.question,
        creator: rawData.creator,
        endDate: Number(rawData['end-date']),
        resolutionDate: Number(rawData['resolution-date']),
        totalYesStake: Number(rawData['total-yes-stake']),
        totalNoStake: Number(rawData['total-no-stake']),
        status: Number(rawData.status) as MarketStatus,
        outcome: Number(rawData.outcome) as MarketOutcome,
        createdAt: Number(rawData['created-at']),
    };
}

/**
 * Parse raw position data from contract response to Position type
 * @param marketId - The market ID
 * @param user - The user's address
 * @param rawData - Raw data from contract call
 * @returns Parsed Position object
 */
export function parsePosition(marketId: number, user: string, rawData: any): Position {
    return {
        marketId,
        user,
        yesStake: Number(rawData['yes-stake']),
        noStake: Number(rawData['no-stake']),
        claimed: Boolean(rawData.claimed),
    };
}

/**
 * Calculate odds for YES and NO outcomes
 * @param yesStake - Total YES stake in microSTX
 * @param noStake - Total NO stake in microSTX
 * @returns Object with YES and NO odds as percentages (0-100)
 */
export function calculateOdds(yesStake: number, noStake: number): { yes: number; no: number } {
    const total = yesStake + noStake;

    if (total === 0) {
        return { yes: 50, no: 50 };
    }

    const yesOdds = (yesStake / total) * 100;
    const noOdds = (noStake / total) * 100;

    return {
        yes: Math.round(yesOdds * 10) / 10, // Round to 1 decimal
        no: Math.round(noOdds * 10) / 10,
    };
}

/**
 * Format stake amount from microSTX to STX with proper decimals
 * @param microStx - Amount in microSTX
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with STX suffix
 */
export function formatStakeAmount(microStx: number, decimals: number = 2): string {
    const stx = microStxToStx(microStx);
    return `${stx.toFixed(decimals)} STX`;
}

/**
 * Get total pool size for a market
 * @param yesStake - Total YES stake in microSTX
 * @param noStake - Total NO stake in microSTX
 * @returns Total pool size in microSTX
 */
export function getTotalPoolSize(yesStake: number, noStake: number): number {
    return yesStake + noStake;
}

/**
 * Check if a market has any stakes
 * @param market - The market object
 * @returns true if market has stakes
 */
export function hasStakes(market: Market): boolean {
    return market.totalYesStake > 0 || market.totalNoStake > 0;
}

/**
 * Get the winning outcome label
 * @param outcome - The market outcome
 * @returns Human-readable outcome label
 */
export function getOutcomeLabel(outcome: MarketOutcome): string {
    switch (outcome) {
        case MarketOutcome.YES:
            return 'YES';
        case MarketOutcome.NO:
            return 'NO';
        case MarketOutcome.NONE:
        default:
            return 'Pending';
    }
}
