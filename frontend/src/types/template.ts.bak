export const TEMPLATE_CATEGORIES = {
  CRYPTO_PRICE: 'crypto_price',
  SPORTS_OUTCOME: 'sports_outcome',
  POLITICAL_EVENT: 'political_event',
  ECONOMIC_INDICATOR: 'economic_indicator',
  TECH_RELEASE: 'tech_release',
  ENTERTAINMENT_EVENT: 'entertainment_event',
  CUSTOM: 'custom',
} as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[keyof typeof TEMPLATE_CATEGORIES];

export interface TemplateExample {
  question: string;
  category: string;
  duration: number;
}

export interface TemplateStep {
  id: string;
  label: string;
  description: string;
  required: boolean;
}

export interface MarketTemplate {
  id: TemplateCategory;
  name: string;
  description: string;
  category: string;
  icon: string;
  examples: TemplateExample[];
  steps: TemplateStep[];
  commonDurations: Array<{ label: string; blocks: number }>;
  tips: string[];
  questionGuide: string;
  categoryGuide: string;
}

export interface TemplateValidationRule {
  field: string;
  rule: string;
  message: string;
  validator: (value: unknown) => boolean;
}

export interface ValidationState {
  question: {
    valid: boolean;
    error: string | null;
    suggestion: string | null;
  };
  duration: {
    valid: boolean;
    error: string | null;
  };
  category: {
    valid: boolean;
    error: string | null;
  };
}

export interface WizardState {
  currentStep: number;
  totalSteps: number;
  template: MarketTemplate | null;
  formData: {
    question: string;
    category: string;
    duration: number;
    templateId: TemplateCategory | null;
  };
  validation: ValidationState;
  isComplete: boolean;
}

export interface TemplateContextualHelp {
  topic: string;
  content: string;
  examples: string[];
  tips: string[];
  warnings: string[];
}

export const TEMPLATE_EXAMPLES: Record<TemplateCategory, TemplateExample[]> = {
  [TEMPLATE_CATEGORIES.CRYPTO_PRICE]: [
    {
      question: 'Will Bitcoin reach $50,000 by end of Q2 2024?',
      category: 'crypto',
      duration: 1008,
    },
    {
      question: 'Will Ethereum be above $2,500 on this date?',
      category: 'crypto',
      duration: 432,
    },
    {
      question: 'Will the Bitcoin dominance exceed 50% by this date?',
      category: 'crypto',
      duration: 2016,
    },
  ],
  [TEMPLATE_CATEGORIES.SPORTS_OUTCOME]: [
    {
      question: 'Will the home team win the match this weekend?',
      category: 'sports',
      duration: 144,
    },
    {
      question: 'Will Player X score more than 3 goals in the tournament?',
      category: 'sports',
      duration: 432,
    },
    {
      question: 'Will Team Y win the championship this season?',
      category: 'sports',
      duration: 4320,
    },
  ],
  [TEMPLATE_CATEGORIES.POLITICAL_EVENT]: [
    {
      question: 'Will the bill pass in the next session?',
      category: 'politics',
      duration: 2016,
    },
    {
      question: 'Will candidate X win the election?',
      category: 'politics',
      duration: 4320,
    },
    {
      question: 'Will the trade agreement be ratified this year?',
      category: 'politics',
      duration: 12960,
    },
  ],
  [TEMPLATE_CATEGORIES.ECONOMIC_INDICATOR]: [
    {
      question: 'Will inflation remain below 5% this quarter?',
      category: 'economics',
      duration: 2016,
    },
    {
      question: 'Will unemployment rise above 4.5%?',
      category: 'economics',
      duration: 1008,
    },
    {
      question: 'Will GDP growth exceed 3% next quarter?',
      category: 'economics',
      duration: 2016,
    },
  ],
  [TEMPLATE_CATEGORIES.TECH_RELEASE]: [
    {
      question: 'Will the new product launch happen as scheduled?',
      category: 'technology',
      duration: 432,
    },
    {
      question: 'Will the software update include the announced features?',
      category: 'technology',
      duration: 144,
    },
    {
      question: 'Will the company announce a major acquisition this year?',
      category: 'technology',
      duration: 4320,
    },
  ],
  [TEMPLATE_CATEGORIES.ENTERTAINMENT_EVENT]: [
    {
      question: 'Will the movie win the Best Picture award?',
      category: 'entertainment',
      duration: 1008,
    },
    {
      question: 'Will the show be renewed for another season?',
      category: 'entertainment',
      duration: 432,
    },
    {
      question: 'Will the concert happen without postponement?',
      category: 'entertainment',
      duration: 144,
    },
  ],
  [TEMPLATE_CATEGORIES.CUSTOM]: [],
};

export const TEMPLATE_TIPS: Record<TemplateCategory, string[]> = {
  [TEMPLATE_CATEGORIES.CRYPTO_PRICE]: [
    'Include specific price targets and dates',
    'Reference reliable price sources for resolution',
    'Consider market volatility when setting timeframes',
    'Use precise exchange information if relevant',
  ],
  [TEMPLATE_CATEGORIES.SPORTS_OUTCOME]: [
    'Specify the exact match, tournament, or season',
    'Include relevant leagues or competitions',
    'Define tiebreaker rules clearly if applicable',
    'Reference official sports data sources',
  ],
  [TEMPLATE_CATEGORIES.POLITICAL_EVENT]: [
    'Be specific about the jurisdiction and timeline',
    'Define voting or approval thresholds clearly',
    'Reference official government sources',
    'Avoid ambiguous political statements',
  ],
  [TEMPLATE_CATEGORIES.ECONOMIC_INDICATOR]: [
    'Use official government or institutional sources',
    'Specify which economic index or indicator',
    'Include the reporting agency',
    'Define the measurement period clearly',
  ],
  [TEMPLATE_CATEGORIES.TECH_RELEASE]: [
    'Reference official company announcements',
    'Be specific about product or feature names',
    'Define success criteria clearly',
    'Include official deadlines or timelines',
  ],
  [TEMPLATE_CATEGORIES.ENTERTAINMENT_EVENT]: [
    'Specify the exact event and award ceremony',
    'Include official event dates and venues',
    'Reference official award organizations',
    'Be clear about eligibility requirements',
  ],
  [TEMPLATE_CATEGORIES.CUSTOM]: [
    'Make your question clear and specific',
    'Avoid ambiguous or vague language',
    'Provide a way to objectively verify the outcome',
    'Set a reasonable timeframe for resolution',
  ],
};

export const QUESTION_VALIDATION_RULES: TemplateValidationRule[] = [
  {
    field: 'question',
    rule: 'minLength',
    message: 'Question must be at least 10 characters',
    validator: (value: string) => value.length >= 10,
  },
  {
    field: 'question',
    rule: 'maxLength',
    message: 'Question must not exceed 500 characters',
    validator: (value: string) => value.length <= 500,
  },
  {
    field: 'question',
    rule: 'notStartsWithWill',
    message: 'Consider starting with "Will" for clarity',
    validator: (value: string) => value.trim().toLowerCase().startsWith('will'),
  },
  {
    field: 'question',
    rule: 'hasDate',
    message: 'Include a specific date or timeframe',
    validator: (value: string) => {
      const datePatterns = [/\d{4}/, /\d{1,2}\/\d{1,2}/, /january|february|march|april|may|june|july|august|september|october|november|december/i];
      return datePatterns.some(pattern => pattern.test(value));
    },
  },
  {
    field: 'question',
    rule: 'noBadCharacters',
    message: 'Avoid special characters except basic punctuation',
    validator: (value: string) => !/[<>{}|\\^[\]`]/.test(value),
  },
];
