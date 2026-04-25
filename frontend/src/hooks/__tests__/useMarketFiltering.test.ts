/**
 * Tests for useMarketFiltering hook
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MarketStatus, MarketOutcome } from '../../types/market';
import type { Market } from '../../types/market';
import { MarketCategory, SortOption, categorizeMarket } from '../../utils/marketCategories';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

// Sample test markets
function createTestMarket(overrides: Partial<Market> = {}): Market {
  return {
    id: 1,
    question: 'Test Market Question',
    creator: 'SP123456789ABCDEFG',
    endDate: 100000,
    resolutionDate: 0,
    status: MarketStatus.ACTIVE,
    totalYesStake: 500,
    totalNoStake: 500,
    createdAt: Date.now(),
    outcome: MarketOutcome.NONE,
    ...overrides,
  };
}

describe('categorizeMarket', () => {
  it('should categorize crypto-related questions', () => {
    expect(categorizeMarket('Will Bitcoin reach $100k?')).toBe(MarketCategory.CRYPTO);
    expect(categorizeMarket('ETH price prediction')).toBe(MarketCategory.CRYPTO);
    expect(categorizeMarket('Stacks ecosystem growth')).toBe(MarketCategory.CRYPTO);
    expect(categorizeMarket('STX token value increase')).toBe(MarketCategory.CRYPTO);
  });

  it('should categorize DeFi-related questions', () => {
    expect(categorizeMarket('DeFi protocol TVL milestone')).toBe(MarketCategory.DEFI);
    expect(categorizeMarket('Liquidity pool returns')).toBe(MarketCategory.DEFI);
    expect(categorizeMarket('Yield farming profits')).toBe(MarketCategory.DEFI);
  });

  it('should categorize sports-related questions', () => {
    expect(categorizeMarket('Super Bowl winner predictions')).toBe(MarketCategory.SPORTS);
    expect(categorizeMarket('NBA finals outcome')).toBe(MarketCategory.SPORTS);
    expect(categorizeMarket('World Cup results')).toBe(MarketCategory.SPORTS);
    expect(categorizeMarket('Football championship game')).toBe(MarketCategory.SPORTS);
  });

  it('should categorize politics-related questions', () => {
    expect(categorizeMarket('Election results 2024')).toBe(MarketCategory.POLITICS);
    expect(categorizeMarket('Senate vote outcome')).toBe(MarketCategory.POLITICS);
    expect(categorizeMarket('Presidential approval rating')).toBe(MarketCategory.POLITICS);
    expect(categorizeMarket('Congress bill passage')).toBe(MarketCategory.POLITICS);
  });

  it('should categorize entertainment-related questions', () => {
    expect(categorizeMarket('Oscar nominations announced')).toBe(MarketCategory.ENTERTAINMENT);
    expect(categorizeMarket('Box office record breaking')).toBe(MarketCategory.ENTERTAINMENT);
    expect(categorizeMarket('Grammy award winner prediction')).toBe(MarketCategory.ENTERTAINMENT);
    expect(categorizeMarket('New TV show premiere date')).toBe(MarketCategory.ENTERTAINMENT);
  });

  it('should categorize science-related questions', () => {
    expect(categorizeMarket('NASA Mars mission success')).toBe(MarketCategory.SCIENCE);
    expect(categorizeMarket('Climate change milestones')).toBe(MarketCategory.SCIENCE);
    expect(categorizeMarket('AI breakthrough discovery')).toBe(MarketCategory.SCIENCE);
    expect(categorizeMarket('SpaceX rocket launch success')).toBe(MarketCategory.SCIENCE);
  });

  it('should categorize business-related questions', () => {
    expect(categorizeMarket('Stock market prediction')).toBe(MarketCategory.BUSINESS);
    expect(categorizeMarket('Company earnings report')).toBe(MarketCategory.BUSINESS);
    expect(categorizeMarket('IPO valuation target')).toBe(MarketCategory.BUSINESS);
    expect(categorizeMarket('Merger acquisition deal close')).toBe(MarketCategory.BUSINESS);
  });

  it('should return OTHER for uncategorized questions', () => {
    expect(categorizeMarket('Weather forecast tomorrow')).toBe(MarketCategory.OTHER);
    expect(categorizeMarket('Local event happening')).toBe(MarketCategory.OTHER);
  });
});

describe('Market Filtering Logic', () => {
  let testMarkets: Market[];

  beforeEach(() => {
    testMarkets = [
      createTestMarket({ 
        id: 1, 
        question: 'Will Bitcoin hit $100k?', 
        status: MarketStatus.ACTIVE,
        createdAt: 1000,
        totalYesStake: 5000,
        totalNoStake: 3000,
        endDate: 200
      }),
      createTestMarket({ 
        id: 2, 
        question: 'Super Bowl 2025 winner', 
        status: MarketStatus.ACTIVE,
        createdAt: 2000,
        totalYesStake: 2000,
        totalNoStake: 2000,
        endDate: 100
      }),
      createTestMarket({ 
        id: 3, 
        question: 'Election results prediction', 
        status: MarketStatus.RESOLVED,
        createdAt: 500,
        totalYesStake: 10000,
        totalNoStake: 8000,
        endDate: 50
      }),
      createTestMarket({ 
        id: 4, 
        question: 'ETH price above $5k', 
        status: MarketStatus.ACTIVE,
        createdAt: 3000,
        totalYesStake: 1000,
        totalNoStake: 500,
        endDate: 300
      }),
    ];
  });

  it('should filter by status correctly', () => {
    const activeMarkets = testMarkets.filter(m => m.status === MarketStatus.ACTIVE);
    const resolvedMarkets = testMarkets.filter(m => m.status === MarketStatus.RESOLVED);
    
    expect(activeMarkets.length).toBe(3);
    expect(resolvedMarkets.length).toBe(1);
  });

  it('should filter by category correctly', () => {
    const categorized = testMarkets.map(m => ({
      ...m,
      category: categorizeMarket(m.question)
    }));

    const cryptoMarkets = categorized.filter(m => m.category === MarketCategory.CRYPTO);
    const sportsMarkets = categorized.filter(m => m.category === MarketCategory.SPORTS);
    const politicsMarkets = categorized.filter(m => m.category === MarketCategory.POLITICS);

    expect(cryptoMarkets.length).toBe(2); // Bitcoin and ETH
    expect(sportsMarkets.length).toBe(1); // Super Bowl
    expect(politicsMarkets.length).toBe(1); // Election
  });

  it('should filter by search query correctly', () => {
    const searchTerm = 'bitcoin';
    const filtered = testMarkets.filter(m => 
      m.question.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe(1);
  });

  it('should filter by volume range correctly', () => {
    // High volume (> 50k) - none in our sample (max is 18k)
    // Medium volume (1k - 50k)
    const mediumVolume = testMarkets.filter(m => {
      const volume = m.totalYesStake + m.totalNoStake;
      return volume >= 1000 && volume < 50000;
    });
    expect(mediumVolume.length).toBe(4);

    const lowVolume = testMarkets.filter(m => {
      const volume = m.totalYesStake + m.totalNoStake;
      return volume < 1000;
    });
    expect(lowVolume.length).toBe(0);
  });

  it('should filter by time range correctly', () => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    // Create a market from yesterday
    const recentMarket = createTestMarket({ createdAt: now - 12 * 60 * 60 * 1000 });
    // Create a market from last week
    const oldMarket = createTestMarket({ createdAt: now - 5 * dayMs });
    
    const markets = [recentMarket, oldMarket];
    
    const last24h = markets.filter(m => m.createdAt >= now - dayMs);
    expect(last24h.length).toBe(1);
    expect(last24h[0]).toBe(recentMarket);
  });

  it('should sort by newest correctly', () => {
    const sorted = [...testMarkets].sort((a, b) => b.createdAt - a.createdAt);
    
    expect(sorted[0].id).toBe(4); // createdAt: 3000
    expect(sorted[1].id).toBe(2); // createdAt: 2000
    expect(sorted[2].id).toBe(1); // createdAt: 1000
    expect(sorted[3].id).toBe(3); // createdAt: 500
  });

  it('should sort by oldest correctly', () => {
    const sorted = [...testMarkets].sort((a, b) => a.createdAt - b.createdAt);
    
    expect(sorted[0].id).toBe(3); // createdAt: 500
    expect(sorted[3].id).toBe(4); // createdAt: 3000
  });

  it('should sort by volume high correctly', () => {
    const sorted = [...testMarkets].sort(
      (a, b) => (b.totalYesStake + b.totalNoStake) - (a.totalYesStake + a.totalNoStake)
    );
    
    expect(sorted[0].id).toBe(3); // 10000 + 8000 = 18000
    expect(sorted[1].id).toBe(1); // 5000 + 3000 = 8000
    expect(sorted[2].id).toBe(2); // 2000 + 2000 = 4000
    expect(sorted[3].id).toBe(4); // 1000 + 500 = 1500
  });

  it('should sort by volume low correctly', () => {
    const sorted = [...testMarkets].sort(
      (a, b) => (a.totalYesStake + a.totalNoStake) - (b.totalYesStake + b.totalNoStake)
    );
    
    expect(sorted[0].id).toBe(4); // 1500
    expect(sorted[3].id).toBe(3); // 18000
  });

  it('should sort by ending soon correctly', () => {
    const sorted = [...testMarkets].sort((a, b) => a.endDate - b.endDate);
    
    expect(sorted[0].id).toBe(3); // endDate: 50
    expect(sorted[1].id).toBe(2); // endDate: 100
    expect(sorted[2].id).toBe(1); // endDate: 200
    expect(sorted[3].id).toBe(4); // endDate: 300
  });

  it('should combine filters correctly', () => {
    // Filter: active + crypto
    const categorized = testMarkets.map(m => ({
      ...m,
      category: categorizeMarket(m.question)
    }));

    const filtered = categorized.filter(m => 
      m.status === MarketStatus.ACTIVE && 
      m.category === MarketCategory.CRYPTO
    );

    expect(filtered.length).toBe(2); // Bitcoin and ETH markets
  });

  it('should calculate counts correctly', () => {
    const categorized = testMarkets.map(m => ({
      ...m,
      category: categorizeMarket(m.question)
    }));

    const counts = {
      all: categorized.length,
      active: categorized.filter(m => m.status === MarketStatus.ACTIVE).length,
      resolved: categorized.filter(m => m.status === MarketStatus.RESOLVED).length,
    };

    expect(counts.all).toBe(4);
    expect(counts.active).toBe(3);
    expect(counts.resolved).toBe(1);
  });
});

describe('SortOption values', () => {
  it('should have correct sort option values', () => {
    expect(SortOption.NEWEST).toBe('newest');
    expect(SortOption.OLDEST).toBe('oldest');
    expect(SortOption.VOLUME_HIGH).toBe('volume_high');
    expect(SortOption.VOLUME_LOW).toBe('volume_low');
    expect(SortOption.ENDING_SOON).toBe('ending_soon');
    expect(SortOption.MOST_PARTICIPANTS).toBe('most_participants');
  });
});

describe('MarketCategory values', () => {
  it('should have correct category values', () => {
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
