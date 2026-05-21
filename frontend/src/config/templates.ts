import type { MarketCategory } from './market';
import {
  TEMPLATE_CATEGORIES,
  TEMPLATE_EXAMPLES,
  TEMPLATE_TIPS,
  type MarketTemplate,
  type TemplateCategory,
} from '@/types/template';

export const marketTemplates: Record<TemplateCategory, MarketTemplate> = {
  [TEMPLATE_CATEGORIES.CRYPTO_PRICE]: {
    id: TEMPLATE_CATEGORIES.CRYPTO_PRICE,
    name: 'Crypto Price Prediction',
    description: 'Predict cryptocurrency price movements',
    category: 'crypto',
    icon: '₿',
    examples: TEMPLATE_EXAMPLES.crypto_price,
    steps: [
      {
        id: 'select-template',
        label: 'Select Template',
        description: 'Choose a market template type',
        required: true,
      },
      {
        id: 'enter-question',
        label: 'Ask Your Question',
        description: 'Write a clear prediction question',
        required: true,
      },
      {
        id: 'set-duration',
        label: 'Set Duration',
        description: 'Choose how long the market will run',
        required: true,
      },
      {
        id: 'review',
        label: 'Review',
        description: 'Review and confirm your market',
        required: true,
      },
    ],
    commonDurations: [
      { label: '1 Day', blocks: 144 },
      { label: '3 Days', blocks: 432 },
      { label: '1 Week', blocks: 1008 },
      { label: '2 Weeks', blocks: 2016 },
      { label: '1 Month', blocks: 4320 },
    ],
    tips: TEMPLATE_TIPS.crypto_price,
    questionGuide: 'Ask about specific cryptocurrencies reaching price targets or moving in certain directions. Include the timeframe and price level.',
    categoryGuide: 'This market will be categorized as "Crypto" for discovery and analytics.',
  },
  [TEMPLATE_CATEGORIES.SPORTS_OUTCOME]: {
    id: TEMPLATE_CATEGORIES.SPORTS_OUTCOME,
    name: 'Sports Outcome',
    description: 'Predict sports match and tournament outcomes',
    category: 'sports',
    icon: '⚽',
    examples: TEMPLATE_EXAMPLES.sports_outcome,
    steps: [
      {
        id: 'select-template',
        label: 'Select Template',
        description: 'Choose a market template type',
        required: true,
      },
      {
        id: 'enter-question',
        label: 'Ask Your Question',
        description: 'Write a clear prediction question',
        required: true,
      },
      {
        id: 'set-duration',
        label: 'Set Duration',
        description: 'Choose how long the market will run',
        required: true,
      },
      {
        id: 'review',
        label: 'Review',
        description: 'Review and confirm your market',
        required: true,
      },
    ],
    commonDurations: [
      { label: '1 Day', blocks: 144 },
      { label: '3 Days', blocks: 432 },
      { label: '1 Week', blocks: 1008 },
      { label: '2 Weeks', blocks: 2016 },
      { label: '1 Month', blocks: 4320 },
    ],
    tips: TEMPLATE_TIPS.sports_outcome,
    questionGuide: 'Ask about specific sports events, teams, or players. Include the date of the event and make the outcome clearly resolvable.',
    categoryGuide: 'This market will be categorized as "Sports" for discovery and analytics.',
  },
  [TEMPLATE_CATEGORIES.POLITICAL_EVENT]: {
    id: TEMPLATE_CATEGORIES.POLITICAL_EVENT,
    name: 'Political Event',
    description: 'Predict political events and elections',
    category: 'politics',
    icon: '🗳️',
    examples: TEMPLATE_EXAMPLES.political_event,
    steps: [
      {
        id: 'select-template',
        label: 'Select Template',
        description: 'Choose a market template type',
        required: true,
      },
      {
        id: 'enter-question',
        label: 'Ask Your Question',
        description: 'Write a clear prediction question',
        required: true,
      },
      {
        id: 'set-duration',
        label: 'Set Duration',
        description: 'Choose how long the market will run',
        required: true,
      },
      {
        id: 'review',
        label: 'Review',
        description: 'Review and confirm your market',
        required: true,
      },
    ],
    commonDurations: [
      { label: '1 Week', blocks: 1008 },
      { label: '2 Weeks', blocks: 2016 },
      { label: '1 Month', blocks: 4320 },
      { label: '3 Months', blocks: 12960 },
    ],
    tips: TEMPLATE_TIPS.political_event,
    questionGuide: 'Ask about elections, legislation, or political decisions. Be specific about the jurisdiction and the decision being made.',
    categoryGuide: 'This market will be categorized as "Politics" for discovery and analytics.',
  },
  [TEMPLATE_CATEGORIES.ECONOMIC_INDICATOR]: {
    id: TEMPLATE_CATEGORIES.ECONOMIC_INDICATOR,
    name: 'Economic Indicator',
    description: 'Predict economic indicators and market trends',
    category: 'economics',
    icon: '📈',
    examples: TEMPLATE_EXAMPLES.economic_indicator,
    steps: [
      {
        id: 'select-template',
        label: 'Select Template',
        description: 'Choose a market template type',
        required: true,
      },
      {
        id: 'enter-question',
        label: 'Ask Your Question',
        description: 'Write a clear prediction question',
        required: true,
      },
      {
        id: 'set-duration',
        label: 'Set Duration',
        description: 'Choose how long the market will run',
        required: true,
      },
      {
        id: 'review',
        label: 'Review',
        description: 'Review and confirm your market',
        required: true,
      },
    ],
    commonDurations: [
      { label: '3 Days', blocks: 432 },
      { label: '1 Week', blocks: 1008 },
      { label: '2 Weeks', blocks: 2016 },
      { label: '1 Month', blocks: 4320 },
      { label: '3 Months', blocks: 12960 },
    ],
    tips: TEMPLATE_TIPS.economic_indicator,
    questionGuide: 'Ask about inflation, employment, GDP, or other economic metrics. Reference official government sources for resolution.',
    categoryGuide: 'This market will be categorized as "Economics" for discovery and analytics.',
  },
  [TEMPLATE_CATEGORIES.TECH_RELEASE]: {
    id: TEMPLATE_CATEGORIES.TECH_RELEASE,
    name: 'Tech Release',
    description: 'Predict technology releases and announcements',
    category: 'technology',
    icon: '💻',
    examples: TEMPLATE_EXAMPLES.tech_release,
    steps: [
      {
        id: 'select-template',
        label: 'Select Template',
        description: 'Choose a market template type',
        required: true,
      },
      {
        id: 'enter-question',
        label: 'Ask Your Question',
        description: 'Write a clear prediction question',
        required: true,
      },
      {
        id: 'set-duration',
        label: 'Set Duration',
        description: 'Choose how long the market will run',
        required: true,
      },
      {
        id: 'review',
        label: 'Review',
        description: 'Review and confirm your market',
        required: true,
      },
    ],
    commonDurations: [
      { label: '3 Days', blocks: 432 },
      { label: '1 Week', blocks: 1008 },
      { label: '2 Weeks', blocks: 2016 },
      { label: '1 Month', blocks: 4320 },
    ],
    tips: TEMPLATE_TIPS.tech_release,
    questionGuide: 'Ask about product launches, software updates, or tech announcements. Use official company announcements as the source of truth.',
    categoryGuide: 'This market will be categorized as "Technology" for discovery and analytics.',
  },
  [TEMPLATE_CATEGORIES.ENTERTAINMENT_EVENT]: {
    id: TEMPLATE_CATEGORIES.ENTERTAINMENT_EVENT,
    name: 'Entertainment Event',
    description: 'Predict entertainment awards and events',
    category: 'entertainment',
    icon: '🎬',
    examples: TEMPLATE_EXAMPLES.entertainment_event,
    steps: [
      {
        id: 'select-template',
        label: 'Select Template',
        description: 'Choose a market template type',
        required: true,
      },
      {
        id: 'enter-question',
        label: 'Ask Your Question',
        description: 'Write a clear prediction question',
        required: true,
      },
      {
        id: 'set-duration',
        label: 'Set Duration',
        description: 'Choose how long the market will run',
        required: true,
      },
      {
        id: 'review',
        label: 'Review',
        description: 'Review and confirm your market',
        required: true,
      },
    ],
    commonDurations: [
      { label: '3 Days', blocks: 432 },
      { label: '1 Week', blocks: 1008 },
      { label: '2 Weeks', blocks: 2016 },
      { label: '1 Month', blocks: 4320 },
    ],
    tips: TEMPLATE_TIPS.entertainment_event,
    questionGuide: 'Ask about award winners, show outcomes, or entertainment events. Use official award organizations as your source of truth.',
    categoryGuide: 'This market will be categorized as "Entertainment" for discovery and analytics.',
  },
  [TEMPLATE_CATEGORIES.CUSTOM]: {
    id: TEMPLATE_CATEGORIES.CUSTOM,
    name: 'Custom Market',
    description: 'Create a custom market with your own rules',
    category: 'other',
    icon: '🔮',
    examples: [],
    steps: [
      {
        id: 'select-template',
        label: 'Select Template',
        description: 'Choose a market template type',
        required: true,
      },
      {
        id: 'enter-question',
        label: 'Ask Your Question',
        description: 'Write a clear prediction question',
        required: true,
      },
      {
        id: 'set-duration',
        label: 'Set Duration',
        description: 'Choose how long the market will run',
        required: true,
      },
      {
        id: 'review',
        label: 'Review',
        description: 'Review and confirm your market',
        required: true,
      },
    ],
    commonDurations: [
      { label: '3 Days', blocks: 432 },
      { label: '1 Week', blocks: 1008 },
      { label: '2 Weeks', blocks: 2016 },
      { label: '1 Month', blocks: 4320 },
      { label: '3 Months', blocks: 12960 },
    ],
    tips: TEMPLATE_TIPS.custom,
    questionGuide: 'Create your own prediction question. Make sure it is clear, specific, and has an objective resolution criteria.',
    categoryGuide: 'Choose an appropriate category for your custom market to help others discover it.',
  },
};

export const getTemplate = (templateId: TemplateCategory): MarketTemplate | undefined => {
  return marketTemplates[templateId];
};

export const getAllTemplates = (): MarketTemplate[] => {
  return Object.values(marketTemplates);
};

export const getTemplatesByCategory = (category: string): MarketTemplate[] => {
  return Object.values(marketTemplates).filter(template => template.category === category);
};
