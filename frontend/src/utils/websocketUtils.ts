import { MarketUpdate, OrderBookUpdate, TradeUpdate, OrderBookLevel } from '@/types/websocket';

export interface MarketDataSnapshot {
  marketId: string;
  currentPrice: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  closePrice: number;
  volume: number;
  bidPrice: number;
  askPrice: number;
  lastUpdateTime: number;
  updateCount: number;
}

export class MarketDataBuffer {
  private buffers: Map<string, MarketUpdate[]> = new Map();
  private snapshots: Map<string, MarketDataSnapshot> = new Map();
  private maxBufferSize: number;

  constructor(maxBufferSize: number = 1000) {
    this.maxBufferSize = maxBufferSize;
  }

  public addUpdate(marketId: string, update: MarketUpdate): void {
    if (!this.buffers.has(marketId)) {
      this.buffers.set(marketId, []);
    }

    const buffer = this.buffers.get(marketId)!;
    buffer.push(update);

    if (buffer.length > this.maxBufferSize) {
      buffer.shift();
    }

    this.updateSnapshot(marketId, update);
  }

  public getUpdates(marketId: string, from: number = 0): MarketUpdate[] {
    const buffer = this.buffers.get(marketId) || [];
    return buffer.slice(from);
  }

  public getLatestUpdate(marketId: string): MarketUpdate | undefined {
    const buffer = this.buffers.get(marketId);
    return buffer?.[buffer.length - 1];
  }

  public getSnapshot(marketId: string): MarketDataSnapshot | undefined {
    return this.snapshots.get(marketId);
  }

  public clearBuffer(marketId: string): void {
    this.buffers.delete(marketId);
    this.snapshots.delete(marketId);
  }

  public clearAll(): void {
    this.buffers.clear();
    this.snapshots.clear();
  }

  private updateSnapshot(marketId: string, update: MarketUpdate): void {
    const snapshot = this.snapshots.get(marketId);

    if (!snapshot) {
      this.snapshots.set(marketId, {
        marketId,
        currentPrice: update.price,
        highPrice: update.price,
        lowPrice: update.price,
        openPrice: update.price,
        closePrice: update.price,
        volume: update.volume,
        bidPrice: update.bid || update.price,
        askPrice: update.ask || update.price,
        lastUpdateTime: update.timestamp,
        updateCount: 1,
      });
      return;
    }

    snapshot.currentPrice = update.price;
    snapshot.highPrice = Math.max(snapshot.highPrice, update.price);
    snapshot.lowPrice = Math.min(snapshot.lowPrice, update.price);
    snapshot.volume = update.volume;
    snapshot.closePrice = update.price;
    snapshot.bidPrice = update.bid || snapshot.bidPrice;
    snapshot.askPrice = update.ask || snapshot.askPrice;
    snapshot.lastUpdateTime = update.timestamp;
    snapshot.updateCount++;
  }

  public getSize(): number {
    let total = 0;
    this.buffers.forEach((buffer) => {
      total += buffer.length;
    });
    return total;
  }
}

export class OrderBookBuffer {
  private orderbooks: Map<string, OrderBookUpdate[]> = new Map();
  private maxBufferSize: number;

  constructor(maxBufferSize: number = 500) {
    this.maxBufferSize = maxBufferSize;
  }

  public addOrderBook(marketId: string, orderBook: OrderBookUpdate): void {
    if (!this.orderbooks.has(marketId)) {
      this.orderbooks.set(marketId, []);
    }

    const buffer = this.orderbooks.get(marketId)!;
    buffer.push(orderBook);

    if (buffer.length > this.maxBufferSize) {
      buffer.shift();
    }
  }

  public getOrderBook(marketId: string): OrderBookUpdate | undefined {
    const buffer = this.orderbooks.get(marketId);
    return buffer?.[buffer.length - 1];
  }

  public getOrderBookHistory(marketId: string, limit: number = 100): OrderBookUpdate[] {
    const buffer = this.orderbooks.get(marketId) || [];
    return buffer.slice(-limit);
  }

  public clearBuffer(marketId: string): void {
    this.orderbooks.delete(marketId);
  }

  public clearAll(): void {
    this.orderbooks.clear();
  }
}

export class TradeBuffer {
  private trades: Map<string, TradeUpdate[]> = new Map();
  private maxBufferSize: number;

  constructor(maxBufferSize: number = 5000) {
    this.maxBufferSize = maxBufferSize;
  }

  public addTrade(marketId: string, trade: TradeUpdate): void {
    if (!this.trades.has(marketId)) {
      this.trades.set(marketId, []);
    }

    const buffer = this.trades.get(marketId)!;
    buffer.push(trade);

    if (buffer.length > this.maxBufferSize) {
      buffer.shift();
    }
  }

  public getTrades(marketId: string, limit: number = 100): TradeUpdate[] {
    const buffer = this.trades.get(marketId) || [];
    return buffer.slice(-limit);
  }

  public getRecentTrades(marketId: string, sinceTimestamp: number): TradeUpdate[] {
    const buffer = this.trades.get(marketId) || [];
    return buffer.filter((trade) => trade.timestamp >= sinceTimestamp);
  }

  public calculateVWAP(marketId: string, limit: number = 100): number {
    const trades = this.getTrades(marketId, limit);

    if (trades.length === 0) return 0;

    let totalVolume = 0;
    let totalVolumePrice = 0;

    trades.forEach((trade) => {
      totalVolume += trade.amount;
      totalVolumePrice += trade.price * trade.amount;
    });

    return totalVolume > 0 ? totalVolumePrice / totalVolume : 0;
  }

  public clearBuffer(marketId: string): void {
    this.trades.delete(marketId);
  }

  public clearAll(): void {
    this.trades.clear();
  }
}

export function calculateSpread(bid: number, ask: number): { spread: number; spreadPercent: number } {
  const spread = ask - bid;
  const spreadPercent = (spread / bid) * 100;
  return { spread, spreadPercent };
}

export function calculateMidPrice(bid: number, ask: number): number {
  return (bid + ask) / 2;
}

export function calculatePriceChange(currentPrice: number, previousPrice: number): { change: number; changePercent: number } {
  const change = currentPrice - previousPrice;
  const changePercent = previousPrice > 0 ? (change / previousPrice) * 100 : 0;
  return { change, changePercent };
}

export function formatPrice(price: number, decimals: number = 2): string {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatVolume(volume: number, decimals: number = 0): string {
  if (volume >= 1e9) {
    return `${(volume / 1e9).toFixed(decimals)}B`;
  }
  if (volume >= 1e6) {
    return `${(volume / 1e6).toFixed(decimals)}M`;
  }
  if (volume >= 1e3) {
    return `${(volume / 1e3).toFixed(decimals)}K`;
  }
  return volume.toFixed(decimals);
}

export function calculateOHLC(updates: MarketUpdate[]): { open: number; high: number; low: number; close: number } {
  if (updates.length === 0) {
    return { open: 0, high: 0, low: 0, close: 0 };
  }

  return {
    open: updates[0].price,
    high: Math.max(...updates.map((u) => u.price)),
    low: Math.min(...updates.map((u) => u.price)),
    close: updates[updates.length - 1].price,
  };
}

export function mergeOrderBooks(oldBook: OrderBookUpdate, newBook: OrderBookUpdate): OrderBookUpdate {
  if (newBook.sequence <= oldBook.sequence) {
    return oldBook;
  }

  const mergedBids = mergeOrderLevels(oldBook.bids, newBook.bids);
  const mergedAsks = mergeOrderLevels(oldBook.asks, newBook.asks);

  return {
    ...newBook,
    bids: mergedBids,
    asks: mergedAsks,
  };
}

function mergeOrderLevels(old: OrderBookLevel[], updates: OrderBookLevel[]): OrderBookLevel[] {
  const map = new Map<number, number>();

  old.forEach(({ price, amount }) => {
    map.set(price, amount);
  });

  updates.forEach(({ price, amount }) => {
    if (amount === 0) {
      map.delete(price);
    } else {
      map.set(price, amount);
    }
  });

  const sortedLevels = Array.from(map.entries())
    .map(([price, amount]) => ({ price, amount }))
    .sort((a, b) => b.price - a.price);

  let cumulativeTotal = 0;
  return sortedLevels.map((level) => {
    cumulativeTotal += level.amount;
    return {
      price: level.price,
      amount: level.amount,
      total: cumulativeTotal,
    };
  });
}

export function detectPriceAnomaly(currentPrice: number, historicalPrices: number[], threshold: number = 3): boolean {
  if (historicalPrices.length < 2) {
    return false;
  }

  const mean = historicalPrices.reduce((a, b) => a + b, 0) / historicalPrices.length;
  const variance = historicalPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / historicalPrices.length;
  const stdDev = Math.sqrt(variance);

  const zScore = Math.abs((currentPrice - mean) / stdDev);
  return zScore > threshold;
}

export function calculateMovingAverage(prices: number[], period: number): number[] {
  const result: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(0);
      continue;
    }

    const slice = prices.slice(i - period + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / period;
    result.push(avg);
  }

  return result;
}

export function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length < period + 1) {
    return [];
  }

  const deltas: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    deltas.push(prices[i] - prices[i - 1]);
  }

  let gains = 0;
  let losses = 0;

  for (let i = 0; i < period; i++) {
    if (deltas[i] > 0) {
      gains += deltas[i];
    } else {
      losses += Math.abs(deltas[i]);
    }
  }

  const rsiValues: number[] = [];
  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period; i < deltas.length; i++) {
    if (deltas[i] > 0) {
      avgGain = (avgGain * (period - 1) + deltas[i]) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(deltas[i])) / period;
    }

    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    rsiValues.push(rsi);
  }

  return rsiValues;
}
