/**
 * Utility for analyzing market trends, price momentum, and directionality.
 */
export class TrendAnalyzer {
    /**
     * Calculates the Simple Moving Average (SMA).
     */
    static calculateSMA(prices: number[], period: number): number {
        if (prices.length < period) return 0;
        const subset = prices.slice(-period);
        const sum = subset.reduce((a, b) => a + b, 0);
        return sum / period;
    }

    /**
     * Determines the current trend direction based on SMA crossover.
     */
    static getTrendDirection(prices: number[]): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
        const shortTerm = this.calculateSMA(prices, 5);
        const longTerm = this.calculateSMA(prices, 20);

        if (shortTerm === 0 || longTerm === 0) return 'NEUTRAL';
        if (shortTerm > longTerm) return 'BULLISH';
        if (shortTerm < longTerm) return 'BEARISH';
        return 'NEUTRAL';
    }

    /**
     * Calculates Relative Strength Index (RSI).
     */
    static calculateRSI(prices: number[], period: number = 14): number {
        if (prices.length <= period) return 50;

        let gains = 0;
        let losses = 0;

        for (let i = prices.length - period; i < prices.length; i++) {
            const diff = prices[i] - prices[i - 1];
            if (diff >= 0) gains += diff;
            else losses -= diff;
        }

        if (losses === 0) return 100;
        const rs = (gains / period) / (losses / period);
        return 100 - (100 / (1 + rs));
    }

    /**
     * Returns a verbal summary of the market's technical health.
     */
    static analyzeHealth(prices: number[]): string {
        const rsi = this.calculateRSI(prices);
        const direction = this.getTrendDirection(prices);

        if (rsi > 70) return `Overbought territory. Expect a consolidation. (${direction})`;
        if (rsi < 30) return `Oversold condition. Potential bounce incoming. (${direction})`;
        return `Stable momentum. Normal trading range. (${direction})`;
    }
}
