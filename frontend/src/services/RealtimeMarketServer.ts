import { WebSocketServerConfig, WebSocketMessage, MarketUpdate, OrderBookUpdate, TradeUpdate, WebSocketConnection } from '../types/websocket';

export class RealtimeMarketServer {
  private connections: Map<string, WebSocketConnection> = new Map();
  private marketUpdates: Map<string, MarketUpdate[]> = new Map();
  private orderbookUpdates: Map<string, OrderBookUpdate[]> = new Map();
  private tradeUpdates: Map<string, TradeUpdate[]> = new Map();
  private updateQueue: MarketUpdate[] = [];
  private config: WebSocketServerConfig;
  private isRunning: boolean = false;
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(config: WebSocketServerConfig) {
    this.config = {
      port: config.port,
      host: config.host || 'localhost',
      pingInterval: config.pingInterval || 30000,
      pongTimeout: config.pongTimeout || 5000,
      maxConnections: config.maxConnections || 10000,
      updateBatchInterval: config.updateBatchInterval || 100,
    };
  }

  public start(): void {
    this.isRunning = true;
    this.startBatchProcessor();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
    this.connections.clear();
  }

  public addConnection(clientId: string): string {
    const connectionId = this.generateConnectionId();
    const connection: WebSocketConnection = {
      id: connectionId,
      clientId,
      subscriptions: new Set(),
      lastActivity: Date.now(),
      isActive: true,
    };
    this.connections.set(connectionId, connection);
    return connectionId;
  }

  public removeConnection(connectionId: string): void {
    this.connections.delete(connectionId);
  }

  public subscribe(connectionId: string, channels: string[]): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    channels.forEach((channel) => {
      connection.subscriptions.add(channel);
    });
    connection.lastActivity = Date.now();
    return true;
  }

  public unsubscribe(connectionId: string, channels: string[]): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return false;
    }

    channels.forEach((channel) => {
      connection.subscriptions.delete(channel);
    });
    connection.lastActivity = Date.now();
    return true;
  }

  public broadcastMarketUpdate(update: MarketUpdate): void {
    if (!this.isRunning) {
      return;
    }

    this.updateQueue.push(update);

    if (!this.marketUpdates.has(update.marketId)) {
      this.marketUpdates.set(update.marketId, []);
    }
    this.marketUpdates.get(update.marketId)!.push(update);
  }

  public broadcastOrderBookUpdate(update: OrderBookUpdate): void {
    if (!this.isRunning) {
      return;
    }

    if (!this.orderbookUpdates.has(update.marketId)) {
      this.orderbookUpdates.set(update.marketId, []);
    }
    this.orderbookUpdates.get(update.marketId)!.push(update);
  }

  public broadcastTradeUpdate(update: TradeUpdate): void {
    if (!this.isRunning) {
      return;
    }

    if (!this.tradeUpdates.has(update.marketId)) {
      this.tradeUpdates.set(update.marketId, []);
    }
    this.tradeUpdates.get(update.marketId)!.push(update);
  }

  public getConnectionCount(): number {
    return this.connections.size;
  }

  public isConnectionActive(connectionId: string): boolean {
    const connection = this.connections.get(connectionId);
    return connection ? connection.isActive : false;
  }

  public getSubscribedChannels(connectionId: string): string[] {
    const connection = this.connections.get(connectionId);
    return connection ? Array.from(connection.subscriptions) : [];
  }

  private startBatchProcessor(): void {
    this.batchTimer = setInterval(() => {
      this.processBatch();
    }, this.config.updateBatchInterval);
  }

  private processBatch(): void {
    if (this.updateQueue.length === 0) {
      return;
    }

    const batch = this.updateQueue.splice(0, this.updateQueue.length);
    const messagesByConnection = new Map<string, WebSocketMessage[]>();

    this.connections.forEach((connection, connectionId) => {
      const messages: WebSocketMessage[] = [];

      batch.forEach((update) => {
        const channel = `market:${update.marketId}`;
        if (connection.subscriptions.has(channel)) {
          messages.push({
            type: 'update',
            channel: channel,
            data: update,
          });
        }
      });

      if (messages.length > 0) {
        messagesByConnection.set(connectionId, messages);
      }
    });

    this.sendBatchedMessages(messagesByConnection);
  }

  private sendBatchedMessages(messagesByConnection: Map<string, WebSocketMessage[]>): void {
    messagesByConnection.forEach((messages, connectionId) => {
      const connection = this.connections.get(connectionId);
      if (connection && connection.isActive) {
        connection.lastActivity = Date.now();
      }
    });
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getConfig(): WebSocketServerConfig {
    return this.config;
  }

  public getActiveConnections(): number {
    let active = 0;
    this.connections.forEach((connection) => {
      if (connection.isActive) {
        active++;
      }
    });
    return active;
  }

  public cleanupInactiveConnections(timeoutMs: number = 60000): void {
    const now = Date.now();
    const inactiveConnections: string[] = [];

    this.connections.forEach((connection, connectionId) => {
      if (now - connection.lastActivity > timeoutMs) {
        inactiveConnections.push(connectionId);
      }
    });

    inactiveConnections.forEach((connectionId) => {
      this.removeConnection(connectionId);
    });
  }
}
