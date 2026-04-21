import {
  WebSocketMessage,
  WebSocketClientConfig,
  RealtimeMarketState,
  MarketUpdate,
  OrderBookUpdate,
  TradeUpdate,
  WebSocketEventMap,
  WebSocketEventHandler,
} from '../types/websocket';

export class RealtimeMarketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketClientConfig;
  private state: RealtimeMarketState;
  private eventHandlers: Map<keyof WebSocketEventMap, Set<Function>> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageSequence: number = 0;

  constructor(config: WebSocketClientConfig) {
    this.config = {
      url: config.url,
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
      autoSubscribe: config.autoSubscribe || [],
    };

    this.state = {
      markets: new Map(),
      subscriptions: new Set(),
      lastUpdate: Date.now(),
      isConnected: false,
      messageQueue: [],
      reconnectAttempts: 0,
    };
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          this.state.isConnected = true;
          this.state.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connection:open', undefined);

          if (this.config.autoSubscribe && this.config.autoSubscribe.length > 0) {
            this.subscribe(this.config.autoSubscribe);
          }

          this.processMessageQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          this.emit('connection:error', new Error('WebSocket error'));
          reject(error);
        };

        this.ws.onclose = () => {
          this.state.isConnected = false;
          this.stopHeartbeat();
          this.emit('connection:close', undefined);
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.state.isConnected = false;
  }

  public subscribe(channels: string[]): boolean {
    if (!this.state.isConnected) {
      channels.forEach((channel) => this.state.subscriptions.add(channel));
      this.state.messageQueue.push({
        type: 'subscribe',
        channels: channels,
      });
      return false;
    }

    channels.forEach((channel) => {
      this.state.subscriptions.add(channel);
    });

    const message: WebSocketMessage = {
      type: 'subscribe',
      channels: channels,
      sequence: this.messageSequence++,
    };

    this.send(message);

    channels.forEach((channel) => {
      this.emit('subscription:added', channel);
    });

    return true;
  }

  public unsubscribe(channels: string[]): boolean {
    if (!this.state.isConnected) {
      channels.forEach((channel) => this.state.subscriptions.delete(channel));
      return false;
    }

    channels.forEach((channel) => {
      this.state.subscriptions.delete(channel);
    });

    const message: WebSocketMessage = {
      type: 'unsubscribe',
      channels: channels,
      sequence: this.messageSequence++,
    };

    this.send(message);

    channels.forEach((channel) => {
      this.emit('subscription:removed', channel);
    });

    return true;
  }

  public on<K extends keyof WebSocketEventMap>(
    event: K,
    handler: WebSocketEventHandler<WebSocketEventMap[K]>,
  ): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  public off<K extends keyof WebSocketEventMap>(
    event: K,
    handler: WebSocketEventHandler<WebSocketEventMap[K]>,
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  public getMarketData(marketId: string) {
    return this.state.markets.get(marketId);
  }

  public isConnected(): boolean {
    return this.state.isConnected;
  }

  public getSubscriptions(): string[] {
    return Array.from(this.state.subscriptions);
  }

  public getReconnectAttempts(): number {
    return this.state.reconnectAttempts;
  }

  private handleMessage(rawData: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(rawData);

      switch (message.type) {
        case 'update':
          if (message.data) {
            if ('bids' in message.data && 'asks' in message.data) {
              this.handleOrderBookUpdate(message.data as OrderBookUpdate);
            } else if ('tradeId' in message.data) {
              this.handleTradeUpdate(message.data as TradeUpdate);
            } else {
              this.handleMarketUpdate(message.data as MarketUpdate);
            }
          }
          break;

        case 'ping':
          this.send({ type: 'pong', sequence: this.messageSequence++ });
          break;

        case 'error':
          this.emit('connection:error', new Error(message.error || 'Unknown error'));
          break;
      }

      this.state.lastUpdate = Date.now();
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }

  private handleMarketUpdate(update: MarketUpdate): void {
    this.state.markets.set(update.marketId, {
      marketId: update.marketId,
      price: update.price,
      change: update.change,
      changePercent: update.changePercent,
      volume: update.volume,
      volumeUsd: 0,
      high24h: update.high24h,
      low24h: update.low24h,
      lastUpdate: update.timestamp,
    });

    this.emit('market:update', update);
  }

  private handleOrderBookUpdate(update: OrderBookUpdate): void {
    const market = this.state.markets.get(update.marketId);
    if (market) {
      market.orderBook = update;
      market.lastUpdate = update.timestamp;
    }
    this.emit('orderbook:update', update);
  }

  private handleTradeUpdate(update: TradeUpdate): void {
    const market = this.state.markets.get(update.marketId);
    if (market) {
      if (!market.recentTrades) {
        market.recentTrades = [];
      }
      market.recentTrades.push(update);
      if (market.recentTrades.length > 50) {
        market.recentTrades.shift();
      }
      market.lastUpdate = update.timestamp;
    }
    this.emit('trade:update', update);
  }

  private emit<K extends keyof WebSocketEventMap>(
    event: K,
    data: WebSocketEventMap[K],
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          (handler as any)(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  private send(message: WebSocketMessage): void {
    if (this.ws && this.state.isConnected) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.state.isConnected) {
        this.send({ type: 'ping', sequence: this.messageSequence++ });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private attemptReconnect(): void {
    if (this.state.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      this.emit('connection:error', new Error('Max reconnect attempts reached'));
      return;
    }

    this.state.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, this.config.reconnectInterval);
  }

  private processMessageQueue(): void {
    while (this.state.messageQueue.length > 0) {
      const message = this.state.messageQueue.shift();
      if (message && message.type === 'subscribe') {
        this.subscribe(message.channels || []);
      }
    }
  }
}
