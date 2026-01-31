export const calculateTrendingScore = (market: { volume: number; participants: number; recentActivity: number; createdAt: number }) => {
    const ageInDays = (Date.now() - market.createdAt) / (1000 * 60 * 60 * 24);
    const ageFactor = Math.max(0, 1 - ageInDays / 30);
    return (market.volume * 0.4 + market.participants * 0.3 + market.recentActivity * 0.3) * ageFactor;
};
