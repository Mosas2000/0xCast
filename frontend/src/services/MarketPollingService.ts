import { MarketUpdate, OrderBookUpdate } from '../types/websocket';

export interface PollingConfig {
  interval: number;
  marketIds: string[];
  enabled: boolean;
}

export interface PollResponse {
  marketUpdates: MarketUpdate[];
  orderbookUpdates: Map<string, OrderBookUpdate>;
}

export class MarketPollingService {
  private config: PollingConfig;
  private pollingTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastSequence: Map<string, number> = new Map();
  private callbacks: Map<string, (data: any) => void> = new Map();

  constructor(config: PollingConfig) {
    this.config = {
      interval: config.interval || 5000,
      marketIds: config.marketIds || [],
      enabled: config.enabled !== false,
    };
  }

  public start(): void {
    if (this.isRunning || !this.config.enabled) {
      return;
    }

    this.isRunning = true;
    this.pollingTimer = setInterval(() => {
      this.poll();
    }, this.config.interval);
  }

  public stop(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    this.isRunning = false;
  }

  public setMarketIds(marketIds: string[]): void {
    this.config.marketIds = marketIds;
  }

  public addMarket(marketId: string): void {
    if (!this.config.marketIds.includes(marketId)) {
      this.config.marketIds.push(marketId);
    }
  }

  public removeMarket(marketId: string): void {
    this.config.marketIds = this.config.marketIds.filter((id) => id !== marketId);
    this.lastSequence.delete(marketId);
  }

  public setInterval(interval: number): void {
    this.config.interval = interval;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  public onUpdate(key: string, callback: (data: any) => void): void {
    this.callbacks.set(key, callback);
  }

  public removeCallback(key: string): void {
    this.callbacks.delete(key);
  }

  public isRunning_(): boolean {
    return this.isRunning;
  }

  private async poll(): Promise<void> {
    if (this.config.marketIds.length === 0) {
      return;
    }

    try {
      const marketIds = this.config.marketIds;
      const pollResponse = await this.fetchMarketData(marketIds);

      this.processMarketUpdates(pollResponse.marketUpdates);
      this.processOrderbookUpdates(pollResponse.orderbookUpdates);

      this.executeCallback('poll:success', { timestamp: Date.now() });
    } catch (error) {
      this.executeCallback('poll:error', error);
    }
  }

  private async fetchMarketData(marketIds: string[]): Promise<PollResponse> {
    const queryParams = new URLSearchParams();
    marketIds.forEach((id) => queryParams.append('marketIds', id));

    const response = await fetch(`/api/markets/data?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`Polling failed: ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformResponse(data);
  }

  private transformResponse(data: any): PollResponse {
    const marketUpdates: MarketUpdate[] = [];
    const orderbookUpdates = new Map<string, OrderBookUpdate>();

    if (Array.isArray(data.markets)) {
      data.markets.forEach((market: any) => {
        marketUpdates.push({
          marketId: market.id,
          price: market.price,
          change: market.change,
          changePercent: market.changePercent,
          volume: market.volume,
          timestamp: market.timestamp || Date.now(),
          high24h: market.high24h,
          low24h: market.low24h,
        });

        if (market.orderBook) {
          orderbookUpdates.set(market.id, {
            marketId: market.id,
            bids: market.orderBook.bids || [],
            asks: market.orderBook.asks || [],
            timestamp: market.orderBook.timestamp || Date.now(),
            sequence: (this.lastSequence.get(market.id) || 0) + 1,
          });

          this.lastSequence.set(market.id, (this.lastSequence.get(market.id) || 0) + 1);
        }
      });
    }

    return { marketUpdates, orderbookUpdates };
  }

  private processMarketUpdates(updates: MarketUpdate[]): void {
    updates.forEach((update) => {
      this.executeCallback('market:update', update);
    });
  }

  private processOrderbookUpdates(updates: Map<string, OrderBookUpdate>): void {
    updates.forEach((update) => {
      this.executeCallback('orderbook:update', update);
    });
  }

  private executeCallback(key: string, data: any): void {
    const callback = this.callbacks.get(key);
    if (callback) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in polling callback ${key}:`, error);
      }
    }
  }
}
