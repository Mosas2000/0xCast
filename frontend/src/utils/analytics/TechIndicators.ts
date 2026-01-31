/**
 * Utility for calculating common technical indicators (Bollinger Bands, MACD, etc.) for advanced charting.
 */
export class TechIndicators {
    /**
     * Calculates Bollinger Bands.
     */
    static calculateBollingerBands(prices: number[], period: number = 20, multiplier: number = 2): { upper: number, lower: number, middle: number } {
        if (prices.length < period) return { upper: 0, lower: 0, middle: 0 };

        const middle = prices.slice(-period).reduce((a, b) => a + b, 0) / period;
        const stdDev = Math.sqrt(prices.slice(-period).reduce((a, b) => a + Math.pow(b - middle, 2), 0) / period);

        return {
            upper: Number((middle + multiplier * stdDev).toFixed(4)),
            lower: Number((middle - multiplier * stdDev).toFixed(4)),
            middle: Number(middle.toFixed(4))
        };
    }

    /**
     * Calculates Simple MACD (Moving Average Convergence Divergence).
     */
    static calculateMACD(prices: number[]): { macd: number, signal: number, histogram: number } {
        // Simplified version for mock charting
        const fastEMA = prices.slice(-12).reduce((a, b) => a + b, 0) / 12;
        const slowEMA = prices.slice(-26).reduce((a, b) => a + b, 0) / 26;
        const macd = fastEMA - slowEMA;
        const signal = macd * 0.9; // Mock signal line

        return {
            macd: Number(macd.toFixed(4)),
            signal: Number(signal.toFixed(4)),
            histogram: Number((macd - signal).toFixed(4))
        };
    }

    /**
     * Calculates the Average True Range (ATR) as a volatility measure.
     */
    static calculateATR(highs: number[], lows: number[], closes: number[]): number {
        if (highs.length < 14) return 0;
        // Simplified version
        let trSum = 0;
        for (let i = 1; i < 14; i++) {
            trSum += Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1]));
        }
        return Number((trSum / 14).toFixed(4));
    }
}
