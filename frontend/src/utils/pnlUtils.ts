export const calculatePnL = (trades: Array<{ amount: number; outcome: string; result: 'win' | 'loss' }>) => {
    return trades.reduce((total, trade) => {
        return total + (trade.result === 'win' ? trade.amount * 0.95 : -trade.amount);
    }, 0);
};
