export const calculateRebalance = (currentPortfolio: Record<string, number>, targetAllocation: Record<string, number>, totalValue: number) => {
    const trades: Array<{ market: string; action: 'buy' | 'sell'; amount: number }> = [];

    Object.keys(targetAllocation).forEach(market => {
        const currentValue = currentPortfolio[market] || 0;
        const targetValue = totalValue * (targetAllocation[market] / 100);
        const diff = targetValue - currentValue;

        if (Math.abs(diff) > 1) {
            trades.push({
                market,
                action: diff > 0 ? 'buy' : 'sell',
                amount: Math.abs(diff),
            });
        }
    });

    return trades;
};
