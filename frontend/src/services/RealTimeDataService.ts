import { Candlestick } from '@/types/charting';

export interface RealTimeUpdate {
  type: 'candle_update' | 'candle_new' | 'price_update' | 'volume_update';
  timestamp: number;
  data: Candlestick | { price: number; timestamp: number } | { volume: number; timestamp: number };
}

export interface WebSocketConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
}

export class RealTimeDataService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnected = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectAttempts: 5,
      reconnectDelay: 3000,
      heartbeatInterval: 30000,
      ...config,
    };
    this.maxReconnectAttempts = config.reconnectAttempts || 5;
    this.reconnectDelay = config.reconnectDelay || 3000;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event: MessageEvent) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error: Event) => {
          this.isConnected = false;
          this.emit('error', error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.stopHeartbeat();
          this.attemptReconnect();
          this.emit('disconnected');
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  subscribe(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  unsubscribe(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, ...args: any[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }

  private handleMessage(data: string): void {
    try {
      const update: RealTimeUpdate = JSON.parse(data);

      switch (update.type) {
        case 'candle_update':
          this.emit('candle_update', update.data);
          break;
        case 'candle_new':
          this.emit('candle_new', update.data);
          break;
        case 'price_update':
          this.emit('price_update', update.data);
          break;
        case 'volume_update':
          this.emit('volume_update', update.data);
          break;
      }

      this.emit('update', update);
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, delay);
    }
  }

  private startHeartbeat(): void {
    if (this.config.heartbeatInterval) {
      this.heartbeatInterval = setInterval(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, this.config.heartbeatInterval);
    }
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  isConnectedToServer(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }
}

export class PollingDataService {
  private pollInterval: NodeJS.Timeout | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private pollRate = 1000;
  private lastUpdate = 0;

  constructor(pollRateMs = 1000) {
    this.pollRate = pollRateMs;
  }

  startPolling(
    fetchFunction: () => Promise<Candlestick[]>,
    interval: number = this.pollRate
  ): void {
    this.stopPolling();

    this.pollInterval = setInterval(async () => {
      try {
        const candles = await fetchFunction();
        this.emit('update', candles);
        this.lastUpdate = Date.now();
      } catch (error) {
        this.emit('error', error);
      }
    }, interval);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  subscribe(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  unsubscribe(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, ...args: any[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }

  getLastUpdateTime(): number {
    return this.lastUpdate;
  }

  getUpdateAge(): number {
    return Date.now() - this.lastUpdate;
  }
}

export class DataStreamAggregator {
  private streams: Map<string, RealTimeDataService | PollingDataService> = new Map();
  private aggregatedData: Map<string, any> = new Map();

  addStream(
    key: string,
    service: RealTimeDataService | PollingDataService
  ): void {
    this.streams.set(key, service);

    if (service instanceof RealTimeDataService) {
      service.subscribe('update', (data: any) => {
        this.aggregatedData.set(key, data);
        this.broadcastAggregatedData();
      });
    } else if (service instanceof PollingDataService) {
      service.subscribe('update', (data: any) => {
        this.aggregatedData.set(key, data);
        this.broadcastAggregatedData();
      });
    }
  }

  removeStream(key: string): void {
    const service = this.streams.get(key);
    if (service instanceof PollingDataService) {
      service.stopPolling();
    }
    this.streams.delete(key);
    this.aggregatedData.delete(key);
  }

  getAggregatedData(): Record<string, any> {
    const result: Record<string, any> = {};
    this.aggregatedData.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private broadcastAggregatedData(): void {
    // Broadcast aggregated data to listeners
  }
}

export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number;

  constructor(ttlMs = 60000) {
    this.ttl = ttlMs;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    });
  }

  size(): number {
    return this.cache.size;
  }
}
