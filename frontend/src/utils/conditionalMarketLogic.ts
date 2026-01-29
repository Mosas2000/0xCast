/**
 * Logic for handling conditional prediction markets.
 */
export interface MarketOutcome {
    marketId: number;
    result: string;
}

export interface Condition {
    type: 'EQUAL' | 'NOT_EQUAL';
    marketId: number;
    requiredResult: string;
}

export class ConditionalMarketLogic {
    /**
     * Evaluates if a conditional market can be resolved based on dependent market outcomes.
     */
    static isResolvable(conditions: Condition[], outcomes: MarketOutcome[]): boolean {
        return conditions.every(condition => {
            const outcome = outcomes.find(o => o.marketId === condition.marketId);
            if (!outcome) return false;

            if (condition.type === 'EQUAL') {
                return outcome.result === condition.requiredResult;
            } else {
                return outcome.result !== condition.requiredResult;
            }
        });
    }

    /**
     * Calculates potential payout based on conditional probability modifiers.
     */
    static calculateConditionalPayout(basePayout: number, modifier: number): number {
        return basePayout * (1 + modifier);
    }

    /**
     * Validates if a set of conditions contains circular dependencies.
     * (Placeholder for complex graph cycle detection)
     */
    static hasCircularDependency(marketId: number, conditions: Condition[]): boolean {
        return conditions.some(c => c.marketId === marketId);
    }
}
