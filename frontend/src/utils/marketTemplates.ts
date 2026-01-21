export interface MarketTemplate {
    id: string;
    name: string;
    category: 'crypto' | 'events' | 'sports' | 'other';
    questionTemplate: string;
    description: string;
    defaultEndDays?: number;
    defaultResolutionDays?: number;
}

export const popularTemplates: MarketTemplate[] = [
    {
        id: 'btc-price',
        name: 'Bitcoin Price',
        category: 'crypto',
        questionTemplate: 'Will Bitcoin reach $[PRICE] by [DATE]?',
        description: 'Predict BTC price movements',
        defaultEndDays: 30,
        defaultResolutionDays: 32,
    },
    {
        id: 'eth-price',
        name: 'Ethereum Price',
        category: 'crypto',
        questionTemplate: 'Will Ethereum reach $[PRICE] by [DATE]?',
        description: 'Predict ETH price movements',
        defaultEndDays: 30,
        defaultResolutionDays: 32,
    },
    {
        id: 'election',
        name: 'Election Outcome',
        category: 'events',
        questionTemplate: 'Will [CANDIDATE] win the [ELECTION] election?',
        description: 'Political election predictions',
        defaultEndDays: 90,
        defaultResolutionDays: 95,
    },
    {
        id: 'product-launch',
        name: 'Product Launch',
        category: 'events',
        questionTemplate: 'Will [COMPANY] launch [PRODUCT] by [DATE]?',
        description: 'Tech product releases',
        defaultEndDays: 60,
        defaultResolutionDays: 62,
    },
    {
        id: 'sports-game',
        name: 'Sports Match',
        category: 'sports',
        questionTemplate: 'Will [TEAM] win against [OPPONENT] on [DATE]?',
        description: 'Sports game outcomes',
        defaultEndDays: 7,
        defaultResolutionDays: 8,
    },
];

export const templateCategories = {
    crypto: 'Cryptocurrency',
    events: 'Events & News',
    sports: 'Sports',
    other: 'Other',
};

interface TemplateParams {
    [key: string]: string;
}

/**
 * Generate market data from template
 * @param template - Template to use
 * @param params - Parameters to fill in template
 * @returns Generated market question and dates
 */
export function generateMarketFromTemplate(
    template: MarketTemplate,
    params: TemplateParams
): {
    question: string;
    endDate: Date;
    resolutionDate: Date;
} {
    let question = template.questionTemplate;

    // Replace placeholders with params
    Object.entries(params).forEach(([key, value]) => {
        question = question.replace(`[${key.toUpperCase()}]`, value);
    });

    // Calculate default dates
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + (template.defaultEndDays || 30));

    const resolutionDate = new Date(now);
    resolutionDate.setDate(resolutionDate.getDate() + (template.defaultResolutionDays || 32));

    return {
        question,
        endDate,
        resolutionDate,
    };
}
