import { RealtimeMarketClient } from './RealtimeMarketClient';
import { MarketPollingService } from './MarketPollingService';
import { MarketUpdate, OrderBookUpdate, TradeUpdate, WebSocketEventMap, WebSocketEventHandler } from '../types/websocket';

export interface RealtimeDataManagerConfig {
  wsUrl: string;
  wsEnabled: boolean;
  pollingEnabled: boolean;
  pollingInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export class RealtimeDataManager {
  private wsClient: RealtimeMarketClient | null = null;
  private pollingService: MarketPollingService | null = null;
  private config: RealtimeDataManagerConfig;
  private isRunning: boolean = false;
  private useWebSocket: boolean = true;
  private subscribedMarkets: Set<string> = new Set();

  constructor(config: Partial<RealtimeDataManagerConfig> = {}) {
    this.config = {
      wsUrl: config.wsUrl || 'ws://localhost:8080/markets',
      wsEnabled: config.wsEnabled !== false,
      pollingEnabled: config.pollingEnabled !== false,
      pollingInterval: config.pollingInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
    };
  }

  public async start(): Promise<void> {
    this.isRunning = true;

    if (this.config.wsEnabled) {
      await this.initializeWebSocket();
    } else {
      this.useWebSocket = false;
      this.initializePolling();
    }
  }

  public async stop(): Promise<void> {
    this.isRunning = false;

    if (this.wsClient) {
      this.wsClient.disconnect();
    }

    if (this.pollingService) {
      this.pollingService.stop();
    }
  }

  public subscribeToMarket(marketId: string): void {
    if (this.subscribedMarkets.has(marketId)) {
      return;
    }

    this.subscribedMarkets.add(marketId);

    if (this.useWebSocket && this.wsClient) {
      this.wsClient.subscribe([`market:${marketId}`, `orderbook:${marketId}`]);
    }

    if (this.pollingService) {
      this.pollingService.addMarket(marketId);
    }
  }

  public unsubscribeFromMarket(marketId: string): void {
    this.subscribedMarkets.delete(marketId);

    if (this.useWebSocket && this.wsClient) {
      this.wsClient.unsubscribe([`market:${marketId}`, `orderbook:${marketId}`]);
    }

    if (this.pollingService) {
      this.pollingService.removeMarket(marketId);
    }
  }

  public on<K extends keyof WebSocketEventMap>(
    event: K,
    handler: WebSocketEventHandler<WebSocketEventMap[K]>,
  ): void {
    if (this.wsClient) {
      this.wsClient.on(event, handler);
    }

    if (this.pollingService) {
      if (event === 'market:update') {
        this.pollingService.onUpdate('market:update', handler as WebSocketEventHandler<MarketUpdate>);
      } else if (event === 'orderbook:update') {
        this.pollingService.onUpdate('orderbook:update', handler as WebSocketEventHandler<OrderBookUpdate>);
      }
    }
  }

  public off<K extends keyof WebSocketEventMap>(
    event: K,
    handler: WebSocketEventHandler<WebSocketEventMap[K]>,
  ): void {
    if (this.wsClient) {
      this.wsClient.off(event, handler);
    }
  }

  public getMarketData(marketId: string) {
    if (this.useWebSocket && this.wsClient) {
      return this.wsClient.getMarketData(marketId);
    }
    return undefined;
  }

  public isConnected(): boolean {
    if (this.useWebSocket && this.wsClient) {
      return this.wsClient.isConnected();
    }
    return this.pollingService?.isRunning_() || false;
  }

  public isUsingWebSocket(): boolean {
    return this.useWebSocket;
  }

  public getSubscribedMarkets(): string[] {
    return Array.from(this.subscribedMarkets);
  }

  public setPollingInterval(interval: number): void {
    if (this.pollingService) {
      this.pollingService.setInterval(interval);
    }
  }

  private async initializeWebSocket(): Promise<void> {
    try {
      this.wsClient = new RealtimeMarketClient({
        url: this.config.wsUrl,
        maxReconnectAttempts: this.config.maxReconnectAttempts,
        heartbeatInterval: this.config.heartbeatInterval,
        autoSubscribe: Array.from(this.subscribedMarkets).map((id) => `market:${id}`),
      });

      this.wsClient.on('connection:error', (error) => {
        if (this.config.pollingEnabled) {
          this.fallbackToPolling();
        }
      });

      await this.wsClient.connect();
    } catch (error) {
      if (this.config.pollingEnabled) {
        this.fallbackToPolling();
      }
    }
  }

  private initializePolling(): void {
    this.pollingService = new MarketPollingService({
      interval: this.config.pollingInterval,
      marketIds: Array.from(this.subscribedMarkets),
      enabled: true,
    });

    this.pollingService.start();
  }

  private fallbackToPolling(): void {
    if (this.useWebSocket) {
      this.useWebSocket = false;

      if (this.wsClient) {
        this.wsClient.disconnect();
      }

      if (!this.pollingService) {
        this.initializePolling();
      } else {
        this.pollingService.start();
      }
    }
  }

  public getConfiguration(): RealtimeDataManagerConfig {
    return { ...this.config };
  }

  public updateConfiguration(config: Partial<RealtimeDataManagerConfig>): void {
    Object.assign(this.config, config);
  }
}

let globalInstance: RealtimeDataManager | null = null;

export function getRealtimeDataManager(config?: Partial<RealtimeDataManagerConfig>): RealtimeDataManager {
  if (!globalInstance) {
    globalInstance = new RealtimeDataManager(config);
  }
  return globalInstance;
}

export function createRealtimeDataManager(config?: Partial<RealtimeDataManagerConfig>): RealtimeDataManager {
  return new RealtimeDataManager(config);
}
