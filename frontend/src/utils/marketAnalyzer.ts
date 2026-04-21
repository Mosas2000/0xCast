import { MarketUpdate, OrderBookUpdate, TradeUpdate } from '../types/websocket';

export interface MarketStats {
  high: number;
  low: number;
  average: number;
  median: number;
  standardDeviation: number;
  volumeWeightedPrice: number;
}

export interface TradeAnalysis {
  buyVolume: number;
  sellVolume: number;
  buyCount: number;
  sellCount: number;
  averageBuyPrice: number;
  averageSellPrice: number;
  buyPressure: number;
  netVolume: number;
}

export interface OrderBookAnalysis {
  totalBidVolume: number;
  totalAskVolume: number;
  bidAskRatio: number;
  spread: number;
  spreadPercent: number;
  midPrice: number;
  bidAskImbalance: number;
  weightedBidPrice: number;
  weightedAskPrice: number;
}

export interface VolatilityMetrics {
  highestPrice: number;
  lowestPrice: number;
  priceRange: number;
  rangePercent: number;
  volatility: number;
}

export class MarketAnalyzer {
  static analyzePrice(updates: MarketUpdate[]): MarketStats {
    if (updates.length === 0) {
      return {
        high: 0,
        low: 0,
        average: 0,
        median: 0,
        standardDeviation: 0,
        volumeWeightedPrice: 0,
      };
    }

    const prices = updates.map((u) => u.price);
    const volumes = updates.map((u) => u.volume);

    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const average = prices.reduce((a, b) => a + b, 0) / prices.length;

    const sorted = [...prices].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    const variance = prices.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) / prices.length;
    const standardDeviation = Math.sqrt(variance);

    const totalVolume = volumes.reduce((a, b) => a + b, 0);
    const volumeWeightedPrice = prices.reduce((sum, p, i) => sum + p * (volumes[i] / totalVolume), 0);

    return {
      high,
      low,
      average,
      median,
      standardDeviation,
      volumeWeightedPrice,
    };
  }

  static analyzeTrades(trades: TradeUpdate[]): TradeAnalysis {
    if (trades.length === 0) {
      return {
        buyVolume: 0,
        sellVolume: 0,
        buyCount: 0,
        sellCount: 0,
        averageBuyPrice: 0,
        averageSellPrice: 0,
        buyPressure: 0,
        netVolume: 0,
      };
    }

    const buys = trades.filter((t) => t.side === 'buy');
    const sells = trades.filter((t) => t.side === 'sell');

    const buyVolume = buys.reduce((sum, t) => sum + t.amount, 0);
    const sellVolume = sells.reduce((sum, t) => sum + t.amount, 0);

    const averageBuyPrice = buys.length > 0 ? buys.reduce((sum, t) => sum + t.price, 0) / buys.length : 0;
    const averageSellPrice = sells.length > 0 ? sells.reduce((sum, t) => sum + t.price, 0) / sells.length : 0;

    const totalVolume = buyVolume + sellVolume;
    const buyPressure = totalVolume > 0 ? (buyVolume / totalVolume) * 100 : 0;
    const netVolume = buyVolume - sellVolume;

    return {
      buyVolume,
      sellVolume,
      buyCount: buys.length,
      sellCount: sells.length,
      averageBuyPrice,
      averageSellPrice,
      buyPressure,
      netVolume,
    };
  }

  static analyzeOrderBook(orderBook: OrderBookUpdate): OrderBookAnalysis {
    if (!orderBook || orderBook.bids.length === 0 || orderBook.asks.length === 0) {
      return {
        totalBidVolume: 0,
        totalAskVolume: 0,
        bidAskRatio: 0,
        spread: 0,
        spreadPercent: 0,
        midPrice: 0,
        bidAskImbalance: 0,
        weightedBidPrice: 0,
        weightedAskPrice: 0,
      };
    }

    const totalBidVolume = orderBook.bids.reduce((sum, bid) => sum + bid.amount, 0);
    const totalAskVolume = orderBook.asks.reduce((sum, ask) => sum + ask.amount, 0);

    const bidAskRatio = totalAskVolume > 0 ? totalBidVolume / totalAskVolume : 0;
    const bestBid = orderBook.bids[0].price;
    const bestAsk = orderBook.asks[0].price;
    const spread = bestAsk - bestBid;
    const spreadPercent = (spread / bestBid) * 100;
    const midPrice = (bestBid + bestAsk) / 2;

    const totalVolume = totalBidVolume + totalAskVolume;
    const bidAskImbalance = totalVolume > 0 ? ((totalBidVolume - totalAskVolume) / totalVolume) * 100 : 0;

    const weightedBidPrice =
      totalBidVolume > 0 ? orderBook.bids.reduce((sum, bid) => sum + bid.price * bid.amount, 0) / totalBidVolume : 0;

    const weightedAskPrice =
      totalAskVolume > 0 ? orderBook.asks.reduce((sum, ask) => sum + ask.price * ask.amount, 0) / totalAskVolume : 0;

    return {
      totalBidVolume,
      totalAskVolume,
      bidAskRatio,
      spread,
      spreadPercent,
      midPrice,
      bidAskImbalance,
      weightedBidPrice,
      weightedAskPrice,
    };
  }

  static getVolatilityMetrics(updates: MarketUpdate[]): VolatilityMetrics {
    if (updates.length === 0) {
      return {
        highestPrice: 0,
        lowestPrice: 0,
        priceRange: 0,
        rangePercent: 0,
        volatility: 0,
      };
    }

    const prices = updates.map((u) => u.price);
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);
    const priceRange = highestPrice - lowestPrice;
    const rangePercent = (priceRange / lowestPrice) * 100;

    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);

    return {
      highestPrice,
      lowestPrice,
      priceRange,
      rangePercent,
      volatility: volatility * 100,
    };
  }

  static detectTrendChange(prices: number[], threshold: number = 2): boolean {
    if (prices.length < 3) return false;

    const recent = prices.slice(-3);
    const previous = prices.slice(-6, -3);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;

    const change = Math.abs(recentAvg - previousAvg) / previousAvg;
    return change > threshold / 100;
  }

  static calculateDominance(trades: TradeUpdate[]): { buyDominance: number; sellDominance: number } {
    if (trades.length === 0) {
      return { buyDominance: 0, sellDominance: 0 };
    }

    const buys = trades.filter((t) => t.side === 'buy').length;
    const sells = trades.filter((t) => t.side === 'sell').length;
    const total = buys + sells;

    return {
      buyDominance: (buys / total) * 100,
      sellDominance: (sells / total) * 100,
    };
  }

  static findSupportResistance(updates: MarketUpdate[], lookback: number = 20): { support: number; resistance: number } {
    const recent = updates.slice(-lookback);
    const prices = recent.map((u) => u.price);

    const low = Math.min(...prices);
    const high = Math.max(...prices);

    return {
      support: low,
      resistance: high,
    };
  }

  static calculatePriceLevel(bid: number, ask: number, level: 'bid' | 'ask' | 'mid' = 'mid'): number {
    switch (level) {
      case 'bid':
        return bid;
      case 'ask':
        return ask;
      case 'mid':
      default:
        return (bid + ask) / 2;
    }
  }

  static detectPumpAndDump(trades: TradeUpdate[], timeWindow: number = 60000): boolean {
    if (trades.length < 10) return false;

    const now = Date.now();
    const recentTrades = trades.filter((t) => now - t.timestamp <= timeWindow);

    if (recentTrades.length === 0) return false;

    const prices = recentTrades.map((t) => t.price);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const maxPrice = Math.max(...prices);

    const increase = (maxPrice - firstPrice) / firstPrice;
    const decrease = (maxPrice - lastPrice) / maxPrice;

    return increase > 0.3 && decrease > 0.2;
  }

  static calculateLiquidity(orderBook: OrderBookUpdate, targetSize: number): { impactBuy: number; impactSell: number } {
    if (!orderBook || orderBook.bids.length === 0 || orderBook.asks.length === 0) {
      return { impactBuy: 0, impactSell: 0 };
    }

    let remainingBuySize = targetSize;
    let buyValue = 0;
    for (const bid of orderBook.bids) {
      const fillSize = Math.min(remainingBuySize, bid.amount);
      buyValue += fillSize * bid.price;
      remainingBuySize -= fillSize;
      if (remainingBuySize === 0) break;
    }

    let remainingSellSize = targetSize;
    let sellValue = 0;
    for (const ask of orderBook.asks) {
      const fillSize = Math.min(remainingSellSize, ask.amount);
      sellValue += fillSize * ask.price;
      remainingSellSize -= fillSize;
      if (remainingSellSize === 0) break;
    }

    const impactBuy = remainingBuySize > 0 ? Infinity : buyValue / (targetSize * (orderBook.bids[0].price + orderBook.asks[0].price) / 2) - 1;

    const impactSell = remainingSellSize > 0 ? Infinity : sellValue / (targetSize * (orderBook.bids[0].price + orderBook.asks[0].price) / 2) - 1;

    return {
      impactBuy: Math.abs(impactBuy),
      impactSell: Math.abs(impactSell),
    };
  }
}

export class TimeSeriesAnalyzer {
  static getLocalMaximum(prices: number[]): number | undefined {
    if (prices.length < 3) return undefined;

    let max: number | undefined;
    let maxIndex = -1;

    for (let i = 1; i < prices.length - 1; i++) {
      if (prices[i] > prices[i - 1] && prices[i] > prices[i + 1]) {
        if (!max || prices[i] > max) {
          max = prices[i];
          maxIndex = i;
        }
      }
    }

    return max;
  }

  static getLocalMinimum(prices: number[]): number | undefined {
    if (prices.length < 3) return undefined;

    let min: number | undefined;
    let minIndex = -1;

    for (let i = 1; i < prices.length - 1; i++) {
      if (prices[i] < prices[i - 1] && prices[i] < prices[i + 1]) {
        if (!min || prices[i] < min) {
          min = prices[i];
          minIndex = i;
        }
      }
    }

    return min;
  }

  static identifyTrend(prices: number[]): 'uptrend' | 'downtrend' | 'range' {
    if (prices.length < 3) return 'range';

    const short = prices.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const long = prices.reduce((a, b) => a + b, 0) / prices.length;

    if (short > long * 1.02) return 'uptrend';
    if (short < long * 0.98) return 'downtrend';
    return 'range';
  }

  static calculateAverageChange(prices: number[]): number {
    if (prices.length < 2) return 0;

    let totalChange = 0;
    for (let i = 1; i < prices.length; i++) {
      totalChange += prices[i] - prices[i - 1];
    }

    return totalChange / (prices.length - 1);
  }

  static getPercentile(prices: number[], percentile: number): number {
    const sorted = [...prices].sort((a, b) => a - b);
    const index = (percentile / 100) * sorted.length;
    return sorted[Math.floor(index)];
  }
}
