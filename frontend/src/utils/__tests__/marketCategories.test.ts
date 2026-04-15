import { describe, it, expect } from 'vitest';
import {
  MarketCategory,
  SortOption,
  CATEGORIES,
  SORT_OPTIONS,
  categorizeMarket,
  getCategoryConfig,
  getSortConfig,
} from '../marketCategories';

describe('MarketCategory constants', () => {
  it('has correct category values', () => {
    expect(MarketCategory.ALL).toBe('all');
    expect(MarketCategory.CRYPTO).toBe('crypto');
    expect(MarketCategory.DEFI).toBe('defi');
    expect(MarketCategory.SPORTS).toBe('sports');
    expect(MarketCategory.POLITICS).toBe('politics');
    expect(MarketCategory.ENTERTAINMENT).toBe('entertainment');
    expect(MarketCategory.SCIENCE).toBe('science');
    expect(MarketCategory.BUSINESS).toBe('business');
    expect(MarketCategory.OTHER).toBe('other');
  });
});

describe('SortOption constants', () => {
  it('has correct sort values', () => {
    expect(SortOption.NEWEST).toBe('newest');
    expect(SortOption.OLDEST).toBe('oldest');
    expect(SortOption.VOLUME_HIGH).toBe('volume_high');
    expect(SortOption.VOLUME_LOW).toBe('volume_low');
    expect(SortOption.ENDING_SOON).toBe('ending_soon');
    expect(SortOption.MOST_PARTICIPANTS).toBe('most_participants');
  });
});

describe('CATEGORIES config', () => {
  it('has all expected categories', () => {
    expect(CATEGORIES).toHaveLength(9);
    const values = CATEGORIES.map(c => c.value);
    expect(values).toContain(MarketCategory.ALL);
    expect(values).toContain(MarketCategory.CRYPTO);
    expect(values).toContain(MarketCategory.OTHER);
  });

  it('each category has required fields', () => {
    CATEGORIES.forEach(cat => {
      expect(cat).toHaveProperty('value');
      expect(cat).toHaveProperty('label');
      expect(cat).toHaveProperty('icon');
      expect(cat).toHaveProperty('color');
      expect(cat.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe('SORT_OPTIONS config', () => {
  it('has all expected sort options', () => {
    expect(SORT_OPTIONS).toHaveLength(6);
    const values = SORT_OPTIONS.map(s => s.value);
    expect(values).toContain(SortOption.NEWEST);
    expect(values).toContain(SortOption.ENDING_SOON);
  });

  it('each option has required fields', () => {
    SORT_OPTIONS.forEach(opt => {
      expect(opt).toHaveProperty('value');
      expect(opt).toHaveProperty('label');
      expect(opt.label).toBeTruthy();
    });
  });
});

describe('categorizeMarket', () => {
  describe('Crypto category', () => {
    it('detects Bitcoin keywords', () => {
      expect(categorizeMarket('Will Bitcoin reach $100k?')).toBe(MarketCategory.CRYPTO);
      expect(categorizeMarket('BTC price prediction')).toBe(MarketCategory.CRYPTO);
    });

    it('detects Ethereum keywords', () => {
      expect(categorizeMarket('Will Ethereum flip Bitcoin?')).toBe(MarketCategory.CRYPTO);
      expect(categorizeMarket('ETH 2.0 launch date')).toBe(MarketCategory.CRYPTO);
    });

    it('detects Stacks keywords', () => {
      expect(categorizeMarket('STX price in 2024')).toBe(MarketCategory.CRYPTO);
      expect(categorizeMarket('Stacks ecosystem growth')).toBe(MarketCategory.CRYPTO);
    });

    it('detects generic crypto keywords', () => {
      expect(categorizeMarket('Best crypto to buy')).toBe(MarketCategory.CRYPTO);
      expect(categorizeMarket('New token launch')).toBe(MarketCategory.CRYPTO);
    });
  });

  describe('DeFi category', () => {
    it('detects DeFi keywords', () => {
      expect(categorizeMarket('DeFi TVL predictions')).toBe(MarketCategory.DEFI);
      expect(categorizeMarket('Liquidity pool rewards')).toBe(MarketCategory.DEFI);
      expect(categorizeMarket('Protocol update coming')).toBe(MarketCategory.DEFI);
    });
  });

  describe('Sports category', () => {
    it('detects major events', () => {
      expect(categorizeMarket('Super Bowl winner 2024')).toBe(MarketCategory.SPORTS);
      expect(categorizeMarket('World Cup final prediction')).toBe(MarketCategory.SPORTS);
    });

    it('detects sport types', () => {
      expect(categorizeMarket('NBA championship odds')).toBe(MarketCategory.SPORTS);
      expect(categorizeMarket('NFL playoff predictions')).toBe(MarketCategory.SPORTS);
      expect(categorizeMarket('Tennis match outcome')).toBe(MarketCategory.SPORTS);
    });
  });

  describe('Politics category', () => {
    it('detects election keywords', () => {
      expect(categorizeMarket('Presidential election results')).toBe(MarketCategory.POLITICS);
      expect(categorizeMarket('Who will win the vote?')).toBe(MarketCategory.POLITICS);
    });

    it('detects government keywords', () => {
      expect(categorizeMarket('Congress policy decision')).toBe(MarketCategory.POLITICS);
      expect(categorizeMarket('Senate vote outcome')).toBe(MarketCategory.POLITICS);
    });
  });

  describe('Entertainment category', () => {
    it('detects movie keywords', () => {
      expect(categorizeMarket('Oscar winner prediction')).toBe(MarketCategory.ENTERTAINMENT);
      expect(categorizeMarket('Box office records')).toBe(MarketCategory.ENTERTAINMENT);
    });

    it('detects music keywords', () => {
      expect(categorizeMarket('Grammy awards results')).toBe(MarketCategory.ENTERTAINMENT);
      expect(categorizeMarket('Album release date')).toBe(MarketCategory.ENTERTAINMENT);
    });

    it('detects streaming keywords', () => {
      expect(categorizeMarket('Netflix show popularity')).toBe(MarketCategory.ENTERTAINMENT);
      expect(categorizeMarket('TV show premiere ratings')).toBe(MarketCategory.ENTERTAINMENT);
    });
  });

  describe('Science category', () => {
    it('detects space keywords', () => {
      expect(categorizeMarket('NASA mission success')).toBe(MarketCategory.SCIENCE);
      expect(categorizeMarket('SpaceX Mars landing')).toBe(MarketCategory.SCIENCE);
      expect(categorizeMarket('Rocket launch date')).toBe(MarketCategory.SCIENCE);
    });

    it('detects tech/AI keywords', () => {
      expect(categorizeMarket('AI breakthrough discovery')).toBe(MarketCategory.SCIENCE);
      expect(categorizeMarket('Artificial intelligence regulation')).toBe(MarketCategory.SCIENCE);
    });

    it('detects research keywords', () => {
      expect(categorizeMarket('Vaccine approval timeline')).toBe(MarketCategory.SCIENCE);
      expect(categorizeMarket('Climate research findings')).toBe(MarketCategory.SCIENCE);
    });
  });

  describe('Business category', () => {
    it('detects stock keywords', () => {
      expect(categorizeMarket('Stock market predictions')).toBe(MarketCategory.BUSINESS);
      expect(categorizeMarket('IPO success rate')).toBe(MarketCategory.BUSINESS);
    });

    it('detects company keywords', () => {
      expect(categorizeMarket('Company earnings report')).toBe(MarketCategory.BUSINESS);
      expect(categorizeMarket('CEO resignation news')).toBe(MarketCategory.BUSINESS);
      expect(categorizeMarket('Merger announcement date')).toBe(MarketCategory.BUSINESS);
    });
  });

  describe('Other category', () => {
    it('returns OTHER for unmatched questions', () => {
      expect(categorizeMarket('Random question here')).toBe(MarketCategory.OTHER);
      expect(categorizeMarket('Will the sun set today?')).toBe(MarketCategory.OTHER);
    });
  });

  it('handles case insensitivity', () => {
    expect(categorizeMarket('BITCOIN PRICE')).toBe(MarketCategory.CRYPTO);
    expect(categorizeMarket('super BOWL')).toBe(MarketCategory.SPORTS);
  });
});

describe('getCategoryConfig', () => {
  it('returns correct config for known category', () => {
    const config = getCategoryConfig(MarketCategory.CRYPTO);
    expect(config.value).toBe(MarketCategory.CRYPTO);
    expect(config.label).toBe('Crypto');
    expect(config.icon).toBe('₿');
  });

  it('returns first category (ALL) for unknown category', () => {
    const config = getCategoryConfig('unknown' as never);
    expect(config.value).toBe(MarketCategory.ALL);
  });

  it('returns config for each valid category', () => {
    Object.values(MarketCategory).forEach(cat => {
      const config = getCategoryConfig(cat);
      expect(config.value).toBe(cat);
    });
  });
});

describe('getSortConfig', () => {
  it('returns correct config for known sort option', () => {
    const config = getSortConfig(SortOption.NEWEST);
    expect(config.value).toBe(SortOption.NEWEST);
    expect(config.label).toBe('Newest First');
  });

  it('returns first option for unknown sort', () => {
    const config = getSortConfig('unknown' as never);
    expect(config.value).toBe(SortOption.NEWEST);
  });

  it('returns config for each valid sort option', () => {
    Object.values(SortOption).forEach(sort => {
      const config = getSortConfig(sort);
      expect(config.value).toBe(sort);
    });
  });
});
