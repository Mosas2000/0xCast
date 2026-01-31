/**
 * Utility for aggregating multiple trading operations into a single execution context.
 */
export interface BatchStep {
    marketId: string;
    outcome: 'YES' | 'NO';
    amount: number;
}

export class TradeBatcher {
    private steps: BatchStep[] = [];

    /**
     * Adds a trade to the current batch.
     */
    addTrade(step: BatchStep): void {
        this.steps.push(step);
    }

    /**
     * Calculates the cumulative STX required for the entire batch.
     */
    getTotalAmount(): number {
        return this.steps.reduce((sum, step) => sum + step.amount, 0);
    }

    /**
     * Groups steps by market to optimize execution sequences.
     */
    getOptimizedSteps(): Record<string, BatchStep[]> {
        return this.steps.reduce((acc, step) => {
            if (!acc[step.marketId]) acc[step.marketId] = [];
            acc[step.marketId].push(step);
            return acc;
        }, {} as Record<string, BatchStep[]>);
    }

    /**
     * Returns the count of unique markets in the batch.
     */
    getMarketCount(): number {
        return new Set(this.steps.map(s => s.marketId)).size;
    }

    /**
     * Clears the current batch.
     */
    clear(): void {
        this.steps = [];
    }
}
