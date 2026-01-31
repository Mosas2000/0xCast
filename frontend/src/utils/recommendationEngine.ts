export const generateRecommendations = (userHistory: string[], allMarkets: any[]) => {
    const userCategories = userHistory.map(h => h.split(':')[0]);
    const categoryScores: Record<string, number> = {};

    userCategories.forEach(cat => {
        categoryScores[cat] = (categoryScores[cat] || 0) + 1;
    });

    return allMarkets
        .filter(m => categoryScores[m.category])
        .sort((a, b) => (categoryScores[b.category] || 0) - (categoryScores[a.category] || 0))
        .slice(0, 10);
};
