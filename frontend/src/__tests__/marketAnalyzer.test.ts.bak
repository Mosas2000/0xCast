import { describe, it, expect } from 'vitest';
import { MarketAnalyzer, TimeSeriesAnalyzer } from '../utils/marketAnalyzer';
import { MarketUpdate, TradeUpdate, OrderBookUpdate } from '../types/websocket';

describe('MarketAnalyzer', () => {
  const mockUpdates: MarketUpdate[] = [
    {
      sequence: 1,
      marketId: 'BTC',
      price: 50000,
      bid: 49999,
      ask: 50001,
      volume: 100,
      change: 0,
      changePercent: 0,
      timestamp: Date.now(),
    },
    {
      sequence: 2,
      marketId: 'BTC',
      price: 50500,
      bid: 50499,
      ask: 50501,
      volume: 200,
      change: 500,
      changePercent: 1.0,
      timestamp: Date.now(),
    },
    {
      sequence: 3,
      marketId: 'BTC',
      price: 50200,
      bid: 50199,
      ask: 50201,
      volume: 150,
      change: 200,
      changePercent: 0.4,
      timestamp: Date.now(),
    },
  ];

  const mockTrades: TradeUpdate[] = [
    {
      sequence: 1,
      marketId: 'BTC',
      price: 50000,
      amount: 1,
      side: 'buy',
      timestamp: Date.now(),
    },
    {
      sequence: 2,
      marketId: 'BTC',
      price: 50100,
      amount: 2,
      side: 'buy',
      timestamp: Date.now(),
    },
    {
      sequence: 3,
      marketId: 'BTC',
      price: 50000,
      amount: 1.5,
      side: 'sell',
      timestamp: Date.now(),
    },
  ];

  const mockOrderBook: OrderBookUpdate = {
    sequence: 1,
    marketId: 'BTC',
    bids: [
      { price: 49999, amount: 1 },
      { price: 49998, amount: 2 },
      { price: 49997, amount: 3 },
    ],
    asks: [
      { price: 50001, amount: 1 },
      { price: 50002, amount: 2 },
      { price: 50003, amount: 3 },
    ],
    timestamp: Date.now(),
  };

  describe('analyzePrice', () => {
    it('should calculate price statistics', () => {
      const stats = MarketAnalyzer.analyzePrice(mockUpdates);

      expect(stats.high).toBe(50500);
      expect(stats.low).toBe(50000);
      expect(stats.average).toBeGreaterThan(50000);
      expect(stats.average).toBeLessThan(50500);
    });

    it('should handle empty updates', () => {
      const stats = MarketAnalyzer.analyzePrice([]);

      expect(stats.high).toBe(0);
      expect(stats.low).toBe(0);
      expect(stats.average).toBe(0);
    });

    it('should calculate standard deviation', () => {
      const stats = MarketAnalyzer.analyzePrice(mockUpdates);
      expect(stats.standardDeviation).toBeGreaterThan(0);
    });

    it('should calculate median', () => {
      const stats = MarketAnalyzer.analyzePrice(mockUpdates);
      expect(stats.median).toBeGreaterThanOrEqual(50000);
      expect(stats.median).toBeLessThanOrEqual(50500);
    });
  });

  describe('analyzeTrades', () => {
    it('should calculate trade statistics', () => {
      const analysis = MarketAnalyzer.analyzeTrades(mockTrades);

      expect(analysis.buyVolume).toBe(3);
      expect(analysis.sellVolume).toBe(1.5);
      expect(analysis.buyCount).toBe(2);
      expect(analysis.sellCount).toBe(1);
    });

    it('should calculate buy pressure', () => {
      const analysis = MarketAnalyzer.analyzeTrades(mockTrades);

      expect(analysis.buyPressure).toBeGreaterThan(50);
      expect(analysis.buyPressure).toBeLessThan(100);
    });

    it('should calculate net volume', () => {
      const analysis = MarketAnalyzer.analyzeTrades(mockTrades);
      expect(analysis.netVolume).toBe(1.5);
    });

    it('should handle empty trades', () => {
      const analysis = MarketAnalyzer.analyzeTrades([]);

      expect(analysis.buyVolume).toBe(0);
      expect(analysis.sellVolume).toBe(0);
      expect(analysis.buyPressure).toBe(0);
    });
  });

  describe('analyzeOrderBook', () => {
    it('should calculate order book metrics', () => {
      const analysis = MarketAnalyzer.analyzeOrderBook(mockOrderBook);

      expect(analysis.totalBidVolume).toBe(6);
      expect(analysis.totalAskVolume).toBe(6);
      expect(analysis.spread).toBe(2);
      expect(analysis.midPrice).toBeCloseTo(50000, 0);
    });

    it('should calculate bid-ask ratio', () => {
      const analysis = MarketAnalyzer.analyzeOrderBook(mockOrderBook);
      expect(analysis.bidAskRatio).toBeCloseTo(1, 1);
    });

    it('should identify imbalances', () => {
      const imbalancedBook: OrderBookUpdate = {
        sequence: 1,
        marketId: 'BTC',
        bids: [{ price: 49999, amount: 10 }],
        asks: [{ price: 50001, amount: 1 }],
        timestamp: Date.now(),
      };

      const analysis = MarketAnalyzer.analyzeOrderBook(imbalancedBook);
      expect(Math.abs(analysis.bidAskImbalance)).toBeGreaterThan(50);
    });
  });

  describe('getVolatilityMetrics', () => {
    it('should calculate volatility', () => {
      const metrics = MarketAnalyzer.getVolatilityMetrics(mockUpdates);

      expect(metrics.highestPrice).toBe(50500);
      expect(metrics.lowestPrice).toBe(50000);
      expect(metrics.volatility).toBeGreaterThanOrEqual(0);
    });

    it('should calculate price range', () => {
      const metrics = MarketAnalyzer.getVolatilityMetrics(mockUpdates);

      expect(metrics.priceRange).toBe(500);
      expect(metrics.rangePercent).toBeGreaterThan(0);
    });
  });

  describe('detectTrendChange', () => {
    it('should detect significant trend changes', () => {
      const prices = [100, 101, 102, 103, 104, 105, 115, 116, 117];
      const hasChange = MarketAnalyzer.detectTrendChange(prices);

      expect(hasChange).toBe(true);
    });

    it('should not detect minor fluctuations as trends', () => {
      const prices = [100, 100.5, 100.2, 100.1, 100.3, 100.4, 100.2, 100.1];
      const hasChange = MarketAnalyzer.detectTrendChange(prices);

      expect(hasChange).toBe(false);
    });
  });

  describe('calculateDominance', () => {
    it('should calculate buy-sell dominance', () => {
      const dominance = MarketAnalyzer.calculateDominance(mockTrades);

      expect(dominance.buyDominance).toBeGreaterThan(50);
      expect(dominance.sellDominance).toBeLessThan(50);
      expect(dominance.buyDominance + dominance.sellDominance).toBeCloseTo(100, 1);
    });
  });

  describe('findSupportResistance', () => {
    it('should identify support and resistance levels', () => {
      const levels = MarketAnalyzer.findSupportResistance(mockUpdates);

      expect(levels.support).toBe(50000);
      expect(levels.resistance).toBe(50500);
    });
  });

  describe('calculatePriceLevel', () => {
    it('should return bid price', () => {
      const price = MarketAnalyzer.calculatePriceLevel(100, 102, 'bid');
      expect(price).toBe(100);
    });

    it('should return ask price', () => {
      const price = MarketAnalyzer.calculatePriceLevel(100, 102, 'ask');
      expect(price).toBe(102);
    });

    it('should return mid price', () => {
      const price = MarketAnalyzer.calculatePriceLevel(100, 102, 'mid');
      expect(price).toBe(101);
    });
  });

  describe('detectPumpAndDump', () => {
    it('should detect pump and dump patterns', () => {
      const now = Date.now();
      const trades: TradeUpdate[] = [
        {
          sequence: 1,
          marketId: 'BTC',
          price: 100,
          amount: 1,
          side: 'buy',
          timestamp: now - 50000,
        },
        {
          sequence: 2,
          marketId: 'BTC',
          price: 140,
          amount: 1,
          side: 'buy',
          timestamp: now - 40000,
        },
        {
          sequence: 3,
          marketId: 'BTC',
          price: 105,
          amount: 1,
          side: 'sell',
          timestamp: now - 10000,
        },
      ];

      const isP_D = MarketAnalyzer.detectPumpAndDump(trades, 60000);
      expect(isP_D).toBe(true);
    });

    it('should not flag normal trading as pump and dump', () => {
      const isP_D = MarketAnalyzer.detectPumpAndDump(mockTrades);
      expect(isP_D).toBe(false);
    });
  });

  describe('calculateLiquidity', () => {
    it('should estimate market impact', () => {
      const liquidity = MarketAnalyzer.calculateLiquidity(mockOrderBook, 5);

      expect(typeof liquidity.impactBuy).toBe('number');
      expect(typeof liquidity.impactSell).toBe('number');
    });
  });
});

describe('TimeSeriesAnalyzer', () => {
  const prices = [100, 102, 101, 105, 103, 108, 106, 109, 107, 110];

  describe('getLocalMaximum', () => {
    it('should find local maximum', () => {
      const max = TimeSeriesAnalyzer.getLocalMaximum(prices);
      expect(max).toBe(105);
    });
  });

  describe('getLocalMinimum', () => {
    it('should find local minimum', () => {
      const min = TimeSeriesAnalyzer.getLocalMinimum(prices);
      expect(min).toBe(101);
    });
  });

  describe('identifyTrend', () => {
    it('should identify uptrend', () => {
      const uptrend = Array.from({ length: 20 }, (_, i) => 100 + i);
      const trend = TimeSeriesAnalyzer.identifyTrend(uptrend);
      expect(trend).toBe('uptrend');
    });

    it('should identify downtrend', () => {
      const downtrend = Array.from({ length: 20 }, (_, i) => 100 - i);
      const trend = TimeSeriesAnalyzer.identifyTrend(downtrend);
      expect(trend).toBe('downtrend');
    });

    it('should identify range', () => {
      const range = [100, 100.5, 100.2, 100.1, 100.3];
      const trend = TimeSeriesAnalyzer.identifyTrend(range);
      expect(trend).toBe('range');
    });
  });

  describe('calculateAverageChange', () => {
    it('should calculate average price change', () => {
      const avgChange = TimeSeriesAnalyzer.calculateAverageChange(prices);
      expect(avgChange).toBeGreaterThan(0);
    });
  });

  describe('getPercentile', () => {
    it('should return correct percentile', () => {
      const p50 = TimeSeriesAnalyzer.getPercentile(prices, 50);
      expect(p50).toBeGreaterThanOrEqual(100);
      expect(p50).toBeLessThanOrEqual(110);
    });
  });
});
