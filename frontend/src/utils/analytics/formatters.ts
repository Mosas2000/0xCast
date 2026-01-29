export function formatNumber(num: number, decimals: number = 0): string {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

export function formatCurrency(num: number, decimals: number = 2): string {
    return `$${formatNumber(num, decimals)}`;
}

export function formatSTX(num: number, decimals: number = 2): string {
    return `${formatNumber(num, decimals)} STX`;
}

export function formatPercentage(num: number, decimals: number = 1): string {
    return `${formatNumber(num, decimals)}%`;
}

export function formatCompactNumber(num: number): string {
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
}
