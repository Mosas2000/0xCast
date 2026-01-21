/**
 * Format STX amount with thousands separator
 * @param amount - Amount in STX
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted STX string
 */
export function formatSTX(amount: number, decimals: number = 2): string {
    return `${amount.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })} STX`;
}

/**
 * Format USD amount with currency symbol
 * @param amount - Amount in USD
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted USD string
 */
export function formatUSD(amount: number, decimals: number = 2): string {
    return `$${amount.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })}`;
}

/**
 * Format percentage from decimal
 * @param decimal - Decimal value (e.g., 0.1234 for 12.34%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(decimal: number, decimals: number = 2): string {
    return `${(decimal * 100).toFixed(decimals)}%`;
}

/**
 * Compact large numbers with K, M, B suffixes
 * @param number - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Compacted number string
 */
export function compactNumber(number: number, decimals: number = 1): string {
    if (number < 1000) return number.toString();
    if (number < 1_000_000) return `${(number / 1000).toFixed(decimals)}K`;
    if (number < 1_000_000_000) return `${(number / 1_000_000).toFixed(decimals)}M`;
    return `${(number / 1_000_000_000).toFixed(decimals)}B`;
}
