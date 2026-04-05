/**
 * Market Categories and Sorting Types
 * 
 * Defines categories and sorting options for market filtering.
 */

export const MarketCategory = {
  ALL: 'all',
  CRYPTO: 'crypto',
  DEFI: 'defi',
  SPORTS: 'sports',
  POLITICS: 'politics',
  ENTERTAINMENT: 'entertainment',
  SCIENCE: 'science',
  BUSINESS: 'business',
  OTHER: 'other',
} as const;

export type MarketCategory = typeof MarketCategory[keyof typeof MarketCategory];

export const SortOption = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  VOLUME_HIGH: 'volume_high',
  VOLUME_LOW: 'volume_low',
  ENDING_SOON: 'ending_soon',
  MOST_PARTICIPANTS: 'most_participants',
} as const;

export type SortOption = typeof SortOption[keyof typeof SortOption];

export interface CategoryConfig {
  value: MarketCategory;
  label: string;
  icon: string;
  color: string;
}

export interface SortConfig {
  value: SortOption;
  label: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { value: MarketCategory.ALL, label: 'All Categories', icon: '🌐', color: '#3B82F6' },
  { value: MarketCategory.CRYPTO, label: 'Crypto', icon: '₿', color: '#F7931A' },
  { value: MarketCategory.DEFI, label: 'DeFi', icon: '🏦', color: '#627EEA' },
  { value: MarketCategory.SPORTS, label: 'Sports', icon: '⚽', color: '#22C55E' },
  { value: MarketCategory.POLITICS, label: 'Politics', icon: '🏛️', color: '#EF4444' },
  { value: MarketCategory.ENTERTAINMENT, label: 'Entertainment', icon: '🎬', color: '#EC4899' },
  { value: MarketCategory.SCIENCE, label: 'Science', icon: '🔬', color: '#8B5CF6' },
  { value: MarketCategory.BUSINESS, label: 'Business', icon: '📈', color: '#14B8A6' },
  { value: MarketCategory.OTHER, label: 'Other', icon: '📋', color: '#6B7280' },
];

export const SORT_OPTIONS: SortConfig[] = [
  { value: SortOption.NEWEST, label: 'Newest First' },
  { value: SortOption.OLDEST, label: 'Oldest First' },
  { value: SortOption.VOLUME_HIGH, label: 'Highest Volume' },
  { value: SortOption.VOLUME_LOW, label: 'Lowest Volume' },
  { value: SortOption.ENDING_SOON, label: 'Ending Soon' },
  { value: SortOption.MOST_PARTICIPANTS, label: 'Most Participants' },
];

/**
 * Categorize a market based on its question text
 */
export function categorizeMarket(question: string): MarketCategory {
  const q = question.toLowerCase();
  
  // Crypto keywords
  if (q.includes('bitcoin') || q.includes('btc') || q.includes('ethereum') || 
      q.includes('eth') || q.includes('crypto') || q.includes('stx') ||
      q.includes('stacks') || q.includes('token') || q.includes('coin')) {
    return MarketCategory.CRYPTO;
  }
  
  // DeFi keywords
  if (q.includes('defi') || q.includes('liquidity') || q.includes('yield') ||
      q.includes('swap') || q.includes('protocol') || q.includes('tvl')) {
    return MarketCategory.DEFI;
  }
  
  // Sports keywords
  if (q.includes('super bowl') || q.includes('world cup') || q.includes('nba') || q.includes('nfl') ||
      q.includes('football') || q.includes('basketball') || q.includes('soccer') ||
      q.includes('championship') || q.includes('match') || q.includes('finals') ||
      q.includes('playoff') || q.includes('game') || q.includes('sports') ||
      q.includes('tennis') || q.includes('golf') || q.includes('olympic')) {
    return MarketCategory.SPORTS;
  }
  
  // Politics keywords
  if (q.includes('election') || q.includes('president') || q.includes('vote') ||
      q.includes('congress') || q.includes('government') || q.includes('policy') ||
      q.includes('senate') || q.includes('republican') || q.includes('democrat')) {
    return MarketCategory.POLITICS;
  }
  
  // Entertainment keywords
  if (q.includes('movie') || q.includes('oscar') || q.includes('grammy') ||
      q.includes('album') || q.includes('concert') || q.includes('actor') ||
      q.includes('netflix') || q.includes('streaming') || q.includes('box office') ||
      q.includes('tv show') || q.includes('premiere') || q.includes('award')) {
    return MarketCategory.ENTERTAINMENT;
  }
  
  // Science keywords
  if (q.includes('space') || q.includes('nasa') || q.includes('research') ||
      q.includes('discovery') || q.includes('ai') || q.includes('artificial intelligence') ||
      q.includes('climate') || q.includes('vaccine') || q.includes('spacex') ||
      q.includes('mars') || q.includes('moon') || q.includes('rocket')) {
    return MarketCategory.SCIENCE;
  }
  
  // Business keywords
  if (q.includes('stock') || q.includes('company') || q.includes('ipo') ||
      q.includes('merger') || q.includes('earnings') || q.includes('revenue') ||
      q.includes('market cap') || q.includes('ceo') || q.includes('acquisition')) {
    return MarketCategory.BUSINESS;
  }
  
  return MarketCategory.OTHER;
}

/**
 * Get category config by value
 */
export function getCategoryConfig(category: MarketCategory): CategoryConfig {
  return CATEGORIES.find(c => c.value === category) || CATEGORIES[0];
}

/**
 * Get sort config by value
 */
export function getSortConfig(sort: SortOption): SortConfig {
  return SORT_OPTIONS.find(s => s.value === sort) || SORT_OPTIONS[0];
}
