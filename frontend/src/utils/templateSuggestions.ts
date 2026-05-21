import type { TemplateCategory } from '@/types/template';

export const QUESTION_TEMPLATES = {
  crypto_price: {
    patterns: [
      'Will {token} reach ${price} by {date}?',
      'Will {metric} exceed {value}% by {date}?',
      'Will {token} dominance stay above {percent}% through {date}?',
    ],
    placeholders: {
      token: ['Bitcoin', 'Ethereum', 'Solana', 'XRP', 'Cardano'],
      price: ['50,000', '100,000', '3,000', '5,000', '10,000'],
      metric: ['Bitcoin dominance', 'altcoin dominance', 'total crypto market cap'],
      value: ['50', '100', '200'],
      percent: ['40', '50', '60'],
      date: ['December 31, 2024', 'end of Q1 2025', 'June 30, 2025'],
    },
  },
  sports_outcome: {
    patterns: [
      'Will {team} beat {opponent} on {date}?',
      'Will {player} score {goals_or_points}+ in the next {event}?',
      'Will {team} win the {tournament} this season?',
    ],
    placeholders: {
      team: ['Lakers', 'Boston Celtics', 'Manchester United', 'Warriors', 'Heat'],
      opponent: ['Celtics', 'Lakers', 'Liverpool', 'Nets', 'Suns'],
      player: ['LeBron James', 'Lionel Messi', 'Cristiano Ronaldo', 'Luka Doncic'],
      goals_or_points: ['20', '2', '3', '5'],
      event: ['match', 'game', 'tournament', 'week'],
      tournament: ['championship', 'World Cup', 'Super Bowl', 'playoffs'],
      date: ['tomorrow', 'this weekend', 'next week'],
    },
  },
  political_event: {
    patterns: [
      'Will the {bill} pass {chamber} by {date}?',
      'Will {candidate} win the {election}?',
      'Will the {policy} be implemented by {date}?',
    ],
    placeholders: {
      bill: ['AI regulation bill', 'healthcare bill', 'infrastructure bill'],
      chamber: ['Senate', 'House', 'Congress'],
      candidate: ['Joe Biden', 'Donald Trump', 'Candidate A'],
      election: ['2024 presidential election', 'midterm elections'],
      policy: ['trade agreement', 'tax reform', 'environmental regulation'],
      date: ['end of 2024', 'Q1 2025', 'by next year'],
    },
  },
  economic_indicator: {
    patterns: [
      'Will {indicator} be below {value}% in {period}?',
      'Will the {index} remain above {level} through {date}?',
      'Will {metric} show {direction} in the next {timeframe}?',
    ],
    placeholders: {
      indicator: ['inflation', 'unemployment', 'CPI', 'inflation rate'],
      index: ['S&P 500', 'DOW', 'NASDAQ'],
      metric: ['GDP growth', 'job creation', 'home sales'],
      value: ['3', '4', '5'],
      level: ['5000', '6000', '7000'],
      period: ['Q4 2024', 'December 2024', 'Q1 2025'],
      direction: ['growth', 'decline', 'increase'],
      timeframe: ['month', 'quarter', 'year'],
      date: ['December 31, 2024', 'by next quarter'],
    },
  },
  tech_release: {
    patterns: [
      'Will {company} release {product} before {date}?',
      'Will {product} include {feature}?',
      'Will the {event} happen as scheduled?',
    ],
    placeholders: {
      company: ['Apple', 'Microsoft', 'Google', 'OpenAI', 'Meta'],
      product: ['Vision Pro 2', 'Windows 12', 'Gemini 2', 'ChatGPT 5'],
      feature: ['voice conversation', 'multimodal support', 'real-time processing'],
      event: ['product launch', 'keynote announcement', 'software update'],
      date: ['June 2025', 'by end of Q1 2025', 'before summer'],
    },
  },
  entertainment_event: {
    patterns: [
      'Will {movie} win Best Picture at the {award_show}?',
      'Will {show} be renewed for {season}?',
      'Will {album} debut at #{position} on {chart}?',
    ],
    placeholders: {
      movie: ['Oppenheimer', 'Killers of the Flower Moon', 'Oscar contender'],
      award_show: ['Oscars', 'Grammy Awards', 'Emmy Awards'],
      show: ['Severance', 'The Last of Us', 'Shogun'],
      season: ['Season 2', 'Season 3'],
      album: ['new Taylor Swift album', 'Kanye West album'],
      position: ['1', 'Top 5'],
      chart: ['Billboard 200', 'UK Charts'],
    },
  },
};

export const generateQuestionFromTemplate = (
  templateId: TemplateCategory,
  patternIndex: number = 0,
  placeholdersMap?: Record<string, string>
): string => {
  const templates = QUESTION_TEMPLATES[templateId];
  if (!templates) return '';

  const patterns = templates.patterns;
  if (patternIndex >= patterns.length) return '';

  let question = patterns[patternIndex];

  const placeholders = placeholdersMap || {};

  Object.keys(placeholders).forEach(key => {
    question = question.replace(`{${key}}`, placeholders[key]);
  });

  const remainingPlaceholders = question.match(/{[^}]+}/g) || [];
  remainingPlaceholders.forEach(placeholder => {
    const key = placeholder.slice(1, -1);
    const options = templates.placeholders[key as keyof typeof templates.placeholders];
    if (Array.isArray(options)) {
      const randomOption = options[Math.floor(Math.random() * options.length)];
      question = question.replace(placeholder, randomOption);
    }
  });

  return question;
};

export const getSuggestionFor = (
  field: 'question' | 'duration' | 'category',
  currentValue?: any
): string => {
  const suggestions = {
    question: [
      'Include a specific date or timeframe',
      'Add precise metrics or numbers',
      'Reference an authoritative source for resolution',
      'Avoid subjective or ambiguous language',
      'Make sure the outcome is binary (yes/no)',
    ],
    duration: [
      'Consider the timeframe needed for the outcome',
      'Allow time for the event to occur plus resolution',
      'Shorter durations create more urgency',
      'Longer durations allow more information to emerge',
    ],
    category: [
      'Choose the category that best matches your prediction',
      'This helps other users discover your market',
      'Categories improve market discoverability',
    ],
  };

  const fieldSuggestions = suggestions[field];
  return fieldSuggestions[Math.floor(Math.random() * fieldSuggestions.length)];
};

export const getCommonMistakes = (): string[] => {
  return [
    'Being too vague about the outcome criteria',
    'Not specifying a clear date or timeframe',
    'Using ambiguous language like "might" or "could"',
    'Forgetting to include how the market will be resolved',
    'Setting an unrealistic timeframe',
    'Making the outcome too easy to dispute',
    'Not considering market close vs resolution date',
  ];
};

export const validateQuestionQuality = (question: string): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 100;

  if (question.length < 20) {
    feedback.push('Question is quite short, consider adding more detail');
    score -= 10;
  }

  if (question.length > 400) {
    feedback.push('Question is very long, consider breaking it into multiple markets');
    score -= 10;
  }

  const hasDate =
    /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}|january|february|march|april|may|june|july|august|september|october|november|december|today|tomorrow|next|end of|by)/i.test(
      question
    );
  if (!hasDate) {
    feedback.push('Consider adding a specific date or timeframe');
    score -= 15;
  }

  if (!question.endsWith('?')) {
    feedback.push('Consider ending the question with a question mark');
    score -= 5;
  }

  const vagueWords = ['probably', 'might', 'could', 'maybe', 'roughly', 'approximately'];
  if (vagueWords.some(word => question.toLowerCase().includes(word))) {
    feedback.push('Avoid vague language like "probably" or "might" - be specific');
    score -= 20;
  }

  const hasNumbers =
    /[\$€£₹\d]|percent|%|above|below|exceed|more than|less than/.test(question);
  if (!hasNumbers) {
    feedback.push('Consider including specific numbers or metrics');
    score -= 15;
  }

  const problematicWords = ['obviously', 'clearly', 'definitely', 'certainly'];
  if (problematicWords.some(word => question.toLowerCase().includes(word))) {
    feedback.push('Remove words that presume the outcome (obviously, clearly, etc.)');
    score -= 10;
  }

  return {
    score: Math.max(0, score),
    feedback: feedback.length > 0 ? feedback : ['Your question looks good!'],
  };
};

export const DurationPresets = {
  SAME_DAY: 36,
  NEXT_DAY: 144,
  THREE_DAYS: 432,
  ONE_WEEK: 1008,
  TWO_WEEKS: 2016,
  ONE_MONTH: 4320,
  THREE_MONTHS: 12960,
  SIX_MONTHS: 25920,
  ONE_YEAR: 52560,
};

export const getCategoryFromQuestion = (question: string): string => {
  const lowerQuestion = question.toLowerCase();

  const categoryKeywords = {
    crypto: ['bitcoin', 'ethereum', 'crypto', 'btc', 'eth', 'price', 'dominance', 'token', 'coin', 'blockchain'],
    sports: ['team', 'game', 'match', 'player', 'score', 'league', 'championship', 'tournament', 'win'],
    politics: ['election', 'senate', 'congress', 'vote', 'bill', 'president', 'candidate', 'legislation'],
    economics: ['gdp', 'inflation', 'unemployment', 'interest', 'rate', 'cpi', 'economic', 'growth'],
    technology: ['product', 'launch', 'release', 'software', 'update', 'app', 'platform', 'feature'],
    entertainment: ['award', 'movie', 'music', 'show', 'film', 'actor', 'singer', 'ceremony'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
      return category;
    }
  }

  return 'other';
};
