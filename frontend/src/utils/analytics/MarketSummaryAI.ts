/**
 * Utility for generating AI-powered market summaries and narrative descriptions based on raw on-chain data.
 */
export class MarketSummaryAI {
    /**
     * Generates a descriptive summary for a market.
     */
    static generateSummary(
        question: string,
        volume: number,
        outcomeOdds: number,
        sentiment: string
    ): string {
        const bias = outcomeOdds > 0.5 ? 'trending towards YES' : 'leaning towards NO';
        const activity = volume > 50000 ? 'high-conviction' : 'moderate';

        return `The market for "${question}" is currently seeing ${activity} activity. Participants are ${bias}, mirrored by a ${sentiment} community sentiment.`;
    }

    /**
     * Highlights key risks or anomalies in market behavior.
     */
    static detectAnomalies(volume: number, oddsChange24h: number): string | null {
        if (oddsChange24h > 0.3) {
            return 'Flash Volatility Detected: Price shifted significantly (>30%) in 24h.';
        }
        if (volume > 100000 && oddsChange24h < 0.05) {
            return 'High Friction: Heavy volume with minimal price movement suggests strong divergence.';
        }
        return null;
    }

    /**
     * Provides a "Quick Take" narrative for the user dashboard.
     */
    static getQuickTake(question: string, outcome: string): string {
        return `The data suggests ${outcome} is the current consensus for "${question}". Position accordingly.`;
    }
}
