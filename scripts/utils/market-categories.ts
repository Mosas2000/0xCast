export const CONTRACT_MARKET_CATEGORIES = {
    CRYPTO: 1,
    SPORTS: 2,
    POLITICS: 3,
    ECONOMICS: 4,
    OTHER: 5,
} as const;

const TOPIC_CATEGORY_MAP: Record<string, number> = {
    crypto: CONTRACT_MARKET_CATEGORIES.CRYPTO,
    sports: CONTRACT_MARKET_CATEGORIES.SPORTS,
    politics: CONTRACT_MARKET_CATEGORIES.POLITICS,
    economics: CONTRACT_MARKET_CATEGORIES.ECONOMICS,
    business: CONTRACT_MARKET_CATEGORIES.ECONOMICS,
    other: CONTRACT_MARKET_CATEGORIES.OTHER,
    tech: CONTRACT_MARKET_CATEGORIES.OTHER,
    entertainment: CONTRACT_MARKET_CATEGORIES.OTHER,
    science: CONTRACT_MARKET_CATEGORIES.OTHER,
    defi: CONTRACT_MARKET_CATEGORIES.CRYPTO,
};

function normalize(value: string): string {
    return value.trim().toLowerCase();
}

export function categoryFromTopic(topic: string): number {
    return TOPIC_CATEGORY_MAP[normalize(topic)] ?? CONTRACT_MARKET_CATEGORIES.OTHER;
}

export function categoryFromQuestion(question: string): number {
    const q = normalize(question);

    if (
        q.includes('bitcoin') ||
        q.includes('btc') ||
        q.includes('ethereum') ||
        q.includes('eth') ||
        q.includes('crypto') ||
        q.includes('stx') ||
        q.includes('stacks') ||
        q.includes('token') ||
        q.includes('coin')
    ) {
        return CONTRACT_MARKET_CATEGORIES.CRYPTO;
    }

    if (
        q.includes('super bowl') ||
        q.includes('world cup') ||
        q.includes('nba') ||
        q.includes('nfl') ||
        q.includes('football') ||
        q.includes('basketball') ||
        q.includes('soccer') ||
        q.includes('championship') ||
        q.includes('match') ||
        q.includes('finals') ||
        q.includes('playoff') ||
        q.includes('sports') ||
        q.includes('tennis') ||
        q.includes('golf') ||
        q.includes('olympic')
    ) {
        return CONTRACT_MARKET_CATEGORIES.SPORTS;
    }

    if (
        q.includes('election') ||
        q.includes('president') ||
        q.includes('vote') ||
        q.includes('congress') ||
        q.includes('government') ||
        q.includes('policy') ||
        q.includes('senate') ||
        q.includes('republican') ||
        q.includes('democrat')
    ) {
        return CONTRACT_MARKET_CATEGORIES.POLITICS;
    }

    if (
        q.includes('stock') ||
        q.includes('company') ||
        q.includes('ipo') ||
        q.includes('merger') ||
        q.includes('earnings') ||
        q.includes('revenue') ||
        q.includes('market cap') ||
        q.includes('ceo') ||
        q.includes('acquisition') ||
        q.includes('inflation') ||
        q.includes('unemployment') ||
        q.includes('gdp') ||
        q.includes('oil') ||
        q.includes('gold') ||
        q.includes('bank')
    ) {
        return CONTRACT_MARKET_CATEGORIES.ECONOMICS;
    }

    return CONTRACT_MARKET_CATEGORIES.OTHER;
}
