import type { MarketTemplate, TemplateCategory } from '../types/template';

export interface TemplateComparison {
  templateId: TemplateCategory;
  name: string;
  description: string;
  bestFor: string[];
  exampleCount: number;
  estimatedTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const getTemplateComparisons = (): TemplateComparison[] => {
  return [
    {
      templateId: 'crypto_price',
      name: 'Crypto Price',
      description: 'Predict cryptocurrency price movements',
      bestFor: ['Price targets', 'Market dominance', 'Token launches'],
      exampleCount: 3,
      estimatedTime: '5-10 min',
      difficulty: 'Easy',
    },
    {
      templateId: 'sports_outcome',
      name: 'Sports Outcome',
      description: 'Predict sports match and tournament results',
      bestFor: ['Match winners', 'Player performance', 'Championships'],
      exampleCount: 3,
      estimatedTime: '5-10 min',
      difficulty: 'Easy',
    },
    {
      templateId: 'political_event',
      name: 'Political Event',
      description: 'Predict elections and policy outcomes',
      bestFor: ['Elections', 'Legislation', 'Appointments'],
      exampleCount: 3,
      estimatedTime: '10-15 min',
      difficulty: 'Medium',
    },
    {
      templateId: 'economic_indicator',
      name: 'Economic Indicator',
      description: 'Predict economic metrics and trends',
      bestFor: ['Inflation', 'Employment', 'GDP growth'],
      exampleCount: 3,
      estimatedTime: '10-15 min',
      difficulty: 'Medium',
    },
    {
      templateId: 'tech_release',
      name: 'Tech Release',
      description: 'Predict technology launches and features',
      bestFor: ['Product launches', 'Feature releases', 'Announcements'],
      exampleCount: 3,
      estimatedTime: '5-10 min',
      difficulty: 'Easy',
    },
    {
      templateId: 'entertainment_event',
      name: 'Entertainment Event',
      description: 'Predict entertainment awards and outcomes',
      bestFor: ['Awards', 'Show renewals', 'Chart performance'],
      exampleCount: 3,
      estimatedTime: '5-10 min',
      difficulty: 'Easy',
    },
    {
      templateId: 'custom',
      name: 'Custom Market',
      description: 'Create any prediction market',
      bestFor: ['Niche topics', 'Unique predictions', 'Custom scenarios'],
      exampleCount: 0,
      estimatedTime: '15-20 min',
      difficulty: 'Hard',
    },
  ];
};

export interface TemplateRecommendation {
  templateId: TemplateCategory;
  score: number;
  reasoning: string[];
}

export const recommendTemplate = (
  question: string,
  category?: string
): TemplateRecommendation[] => {
  const recommendations: Array<{
    templateId: TemplateCategory;
    score: number;
    reasons: string[];
  }> = [];

  const lowerQuestion = question.toLowerCase();

  const keywords = {
    crypto_price: [
      'bitcoin',
      'ethereum',
      'crypto',
      'btc',
      'eth',
      'price',
      'reach',
      'dominance',
      'altcoin',
      'token',
    ],
    sports_outcome: [
      'team',
      'game',
      'match',
      'player',
      'score',
      'win',
      'championship',
      'league',
      'coach',
      'tournament',
    ],
    political_event: [
      'election',
      'senate',
      'congress',
      'vote',
      'bill',
      'president',
      'candidate',
      'party',
      'legislature',
      'appointment',
    ],
    economic_indicator: [
      'gdp',
      'inflation',
      'unemployment',
      'interest',
      'rate',
      'cpi',
      'economic',
      'growth',
      'recession',
      'fed',
    ],
    tech_release: [
      'product',
      'launch',
      'release',
      'feature',
      'software',
      'update',
      'app',
      'platform',
      'announce',
      'beta',
    ],
    entertainment_event: [
      'award',
      'movie',
      'music',
      'show',
      'film',
      'actor',
      'singer',
      'entertainment',
      'ceremony',
      'renewal',
    ],
  };

  const templateIds = Object.keys(keywords) as TemplateCategory[];

  templateIds.forEach(templateId => {
    if (templateId === 'custom') return;

    const keywordList = keywords[templateId] || [];
    const matches = keywordList.filter(keyword =>
      lowerQuestion.includes(keyword)
    );

    const score = (matches.length / keywordList.length) * 100;

    if (score > 0) {
      recommendations.push({
        templateId,
        score,
        reasons: matches,
      });
    }
  });

  if (recommendations.length === 0) {
    recommendations.push({
      templateId: 'custom',
      score: 50,
      reasons: ['No matching template found, custom market recommended'],
    });
  }

  recommendations.sort((a, b) => b.score - a.score);

  return recommendations.map(rec => ({
    templateId: rec.templateId,
    score: Math.round(rec.score),
    reasoning: rec.reasons.length > 0
      ? [`Matched keywords: ${rec.reasons.slice(0, 3).join(', ')}`]
      : ['No specific keywords matched'],
  }));
};

export const getTemplateHelpText = (
  templateId: TemplateCategory
): {
  title: string;
  description: string;
  tips: string[];
} => {
  const helpTexts: Record<TemplateCategory, {
    title: string;
    description: string;
    tips: string[];
  }> = {
    crypto_price: {
      title: 'Crypto Price Predictions',
      description:
        'Predict cryptocurrency price movements on major exchanges.',
      tips: [
        'Use specific price targets like $50,000, not vague prices',
        'Reference major exchanges (Coinbase, Kraken, Binance)',
        'Include exact dates or timeframes',
        'Consider volatility when setting price levels',
      ],
    },
    sports_outcome: {
      title: 'Sports Outcomes',
      description:
        'Predict outcomes of sports matches, tournaments, and events.',
      tips: [
        'Specify the exact league and competition',
        'Include match date and teams/players',
        'Use official league statistics for resolution',
        'Consider home/away advantage and team form',
      ],
    },
    political_event: {
      title: 'Political Events',
      description: 'Predict election results and policy decisions.',
      tips: [
        'Use official government sources for resolution',
        'Specify jurisdiction (country, state, district)',
        'Be clear about voting thresholds',
        'Avoid subjective political statements',
      ],
    },
    economic_indicator: {
      title: 'Economic Indicators',
      description: 'Predict economic metrics and market trends.',
      tips: [
        'Use official government agencies (BLS, BEA, Fed)',
        'Specify the exact economic metric',
        'Include the time period (monthly, quarterly, yearly)',
        'Reference the official report or announcement',
      ],
    },
    tech_release: {
      title: 'Tech Releases',
      description: 'Predict technology launches and feature announcements.',
      tips: [
        'Use official company announcements',
        'Be specific about product or feature names',
        'Include expected or official deadlines',
        'Clarify what counts as a release (beta vs general availability)',
      ],
    },
    entertainment_event: {
      title: 'Entertainment Events',
      description: 'Predict awards, show renewals, and entertainment outcomes.',
      tips: [
        'Use official award organizations (Academy, Grammy, etc.)',
        'Specify the award and ceremony',
        'Include the year or date of the event',
        'Reference official sources for eligibility',
      ],
    },
    custom: {
      title: 'Custom Markets',
      description: 'Create any prediction market for unique topics.',
      tips: [
        'Be very specific about the outcome criteria',
        'Provide a clear, objective way to resolve',
        'Use reliable sources for verification',
        'Avoid ambiguous or subjective language',
      ],
    },
  };

  return (
    helpTexts[templateId] || {
      title: 'Market Template',
      description: 'Create a prediction market',
      tips: [],
    }
  );
};
