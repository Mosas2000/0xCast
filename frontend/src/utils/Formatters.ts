/**
 * Utility functions for formatting numbers and currencies.
 */
export class Formatters {
    /**
     * Abbreviates large numbers (e.g., 1200 -> 1.2k, 1000000 -> 1M).
     */
    static abbreviateNumber(value: number): string {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        }
        if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k';
        }
        return value.toString();
    }

    /**
     * Formats a number as a currency string.
     */
    static formatCurrency(value: number, currency: string = 'STX'): string {
        return `${value.toLocaleString()} ${currency}`;
    }

    /**
     * Formats a percentage value.
     */
    static formatPercent(value: number): string {
        return `${value.toFixed(2)}%`;
    }
}
