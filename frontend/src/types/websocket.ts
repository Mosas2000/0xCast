import type { JsonValue } from './common';

export interface MarketUpdate {
  marketId: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
  high24h: number;
  low24h: number;
  bid?: number;
  ask?: number;
}

export interface OrderBookLevel {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBookUpdate {
  marketId: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
  sequence: number;
}

export interface TradeUpdate {
  tradeId: string;
  marketId: string;
  price: number;
  amount: number;
  buyer: string;
  seller: string;
  timestamp: number;
  side: 'buy' | 'sell';
}

export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'update' | 'error' | 'ping' | 'pong';
  channel?: string;
  data?: JsonValue;
  error?: string;
  sequence?: number;
}

export interface SubscriptionRequest {
  type: 'subscribe' | 'unsubscribe';
  channels: string[];
}

export interface MarketDataSnapshot {
  marketId: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  volumeUsd: number;
  high24h: number;
  low24h: number;
  lastUpdate: number;
  orderBook?: OrderBookUpdate;
  recentTrades?: TradeUpdate[];
}

export interface WebSocketConnection {
  id: string;
  clientId: string;
  subscriptions: Set<string>;
  lastActivity: number;
  isActive: boolean;
}

export interface WebSocketServerConfig {
  port: number;
  host?: string;
  pingInterval?: number;
  pongTimeout?: number;
  maxConnections?: number;
  updateBatchInterval?: number;
}

export interface WebSocketClientConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  autoSubscribe?: string[];
}

export type WebSocketEventHandler<T> = (data: T) => void;

export interface WebSocketEventMap {
  'market:update': MarketUpdate;
  'orderbook:update': OrderBookUpdate;
  'trade:update': TradeUpdate;
  'connection:open': void;
  'connection:close': void;
  'connection:error': Error;
  'subscription:added': string;
  'subscription:removed': string;
}

export interface BatchedUpdate {
  marketId: string;
  updates: MarketUpdate[];
  orderbookUpdates: OrderBookUpdate[];
  tradeUpdates: TradeUpdate[];
  timestamp: number;
}

export interface RealtimeMarketState {
  markets: Map<string, MarketDataSnapshot>;
  subscriptions: Set<string>;
  lastUpdate: number;
  isConnected: boolean;
  messageQueue: WebSocketMessage[];
  reconnectAttempts: number;
}
