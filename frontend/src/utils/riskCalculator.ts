export const calculateRisk = (market: { volatility: number; liquidity: number; timeToEnd: number }) => {
    const volatilityScore = market.volatility * 0.4;
    const liquidityScore = (1 - Math.min(market.liquidity / 10000, 1)) * 0.3;
    const timeScore = (market.timeToEnd / (30 * 24 * 60 * 60 * 1000)) * 0.3;
    return Math.min(volatilityScore + liquidityScore + timeScore, 1) * 100;
};
