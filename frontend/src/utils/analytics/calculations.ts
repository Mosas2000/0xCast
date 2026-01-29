// Stub functions - will implement later
export function calculateWinRate(wins: number, total: number): number {
    if (total === 0) return 0;
    return (wins / total) * 100;
}

export function calculateROI(profit: number, invested: number): number {
    if (invested === 0) return 0;
    return (profit / invested) * 100;
}

export function calculateTrend(current: number, previous: number): 'up' | 'down' | 'neutral' {
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'neutral';
}

export function calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
}
