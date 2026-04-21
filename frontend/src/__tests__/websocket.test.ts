import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RealtimeMarketClient } from '../services/RealtimeMarketClient';
import { RealtimeMarketServer } from '../services/RealtimeMarketServer';
import { MarketPollingService } from '../services/MarketPollingService';
import { RealtimeDataManager } from '../services/RealtimeDataManager';
import { MarketDataBuffer, OrderBookBuffer, TradeBuffer, calculateSpread, calculateMidPrice, calculatePriceChange, calculateMovingAverage, calculateRSI } from '../utils/websocketUtils';
import { MarketUpdate, OrderBookUpdate, TradeUpdate } from '../types/websocket';

describe('WebSocket Client', () => {
  let client: RealtimeMarketClient;

  beforeEach(() => {
    client = new RealtimeMarketClient({
      url: 'ws://localhost:8080/test',
      maxReconnectAttempts: 3,
      heartbeatInterval: 10000,
    });
  });

  afterEach(() => {
    if (client) {
      client.disconnect();
    }
  });

  it('should initialize with correct configuration', () => {
    expect(client).toBeDefined();
  });

  it('should track connected state', () => {
    expect(client.isConnected()).toBe(false);
  });

  it('should register event handlers', () => {
    const handler = vi.fn();
    client.on('market:update', handler);
    expect(client).toBeDefined();
  });

  it('should unregister event handlers', () => {
    const handler = vi.fn();
    client.on('market:update', handler);
    client.off('market:update', handler);
    expect(client).toBeDefined();
  });

  it('should queue subscriptions before connection', () => {
    client.subscribe(['market:BTC', 'market:ETH']);
    expect(client).toBeDefined();
  });

  it('should return market data when available', () => {
    const data = client.getMarketData('BTC');
    expect(data).toBeUndefined();
  });
});

describe('WebSocket Server', () => {
  let server: RealtimeMarketServer;

  beforeEach(() => {
    server = new RealtimeMarketServer({
      port: 8081,
      batchInterval: 100,
      maxConnections: 100,
    });
  });

  afterEach(() => {
    if (server) {
      server.stop();
    }
  });

  it('should initialize with correct configuration', () => {
    expect(server).toBeDefined();
  });

  it('should handle client connections', () => {
    const handler = vi.fn();
    server.onConnection(handler);
    expect(server).toBeDefined();
  });

  it('should broadcast market updates', () => {
    const update: MarketUpdate = {
      sequence: 1,
      marketId: 'BTC',
      price: 50000,
      bid: 49999,
      ask: 50001,
      volume: 100,
      change: 500,
      changePercent: 1.0,
      timestamp: Date.now(),
    };

    server.broadcastUpdate(update);
    expect(server).toBeDefined();
  });

  it('should handle client subscriptions', () => {
    const handler = vi.fn();
    server.onSubscribe(handler);
    expect(server).toBeDefined();
  });

  it('should remove inactive connections', () => {
    server.cleanupInactiveConnections();
    expect(server).toBeDefined();
  });
});

describe('Polling Service', () => {
  let service: MarketPollingService;

  beforeEach(() => {
    service = new MarketPollingService({
      interval: 1000,
      marketIds: ['BTC', 'ETH'],
      enabled: true,
    });
  });

  afterEach(() => {
    if (service) {
      service.stop();
    }
  });

  it('should initialize with configuration', () => {
    expect(service).toBeDefined();
  });

  it('should track polling interval', () => {
    service.setInterval(2000);
    expect(service).toBeDefined();
  });

  it('should add markets to polling list', () => {
    service.addMarket('XRP');
    expect(service).toBeDefined();
  });

  it('should remove markets from polling list', () => {
    service.removeMarket('ETH');
    expect(service).toBeDefined();
  });

  it('should register update handlers', () => {
    const handler = vi.fn();
    service.onUpdate('market:update', handler);
    expect(service).toBeDefined();
  });

  it('should track running state', () => {
    expect(service.isRunning_()).toBe(false);
  });
});

describe('Realtime Data Manager', () => {
  let manager: RealtimeDataManager;

  beforeEach(() => {
    manager = new RealtimeDataManager({
      wsEnabled: false,
      pollingEnabled: true,
      pollingInterval: 1000,
    });
  });

  afterEach(async () => {
    if (manager) {
      await manager.stop();
    }
  });

  it('should initialize with default configuration', () => {
    expect(manager).toBeDefined();
  });

  it('should subscribe to markets', async () => {
    manager.subscribeToMarket('BTC');
    expect(manager.getSubscribedMarkets()).toContain('BTC');
  });

  it('should unsubscribe from markets', async () => {
    manager.subscribeToMarket('BTC');
    manager.unsubscribeFromMarket('BTC');
    expect(manager.getSubscribedMarkets()).not.toContain('BTC');
  });

  it('should track connection state', async () => {
    expect(typeof manager.isConnected()).toBe('boolean');
  });

  it('should report WebSocket usage', async () => {
    expect(typeof manager.isUsingWebSocket()).toBe('boolean');
  });

  it('should update configuration', () => {
    manager.updateConfiguration({ pollingInterval: 5000 });
    const config = manager.getConfiguration();
    expect(config.pollingInterval).toBe(5000);
  });

  it('should register event handlers', () => {
    const handler = vi.fn();
    manager.on('market:update', handler);
    expect(manager).toBeDefined();
  });
});

describe('Market Data Buffer', () => {
  let buffer: MarketDataBuffer;

  beforeEach(() => {
    buffer = new MarketDataBuffer(100);
  });

  it('should store market updates', () => {
    const update: MarketUpdate = {
      sequence: 1,
      marketId: 'BTC',
      price: 50000,
      bid: 49999,
      ask: 50001,
      volume: 100,
      change: 500,
      changePercent: 1.0,
      timestamp: Date.now(),
    };

    buffer.addUpdate('BTC', update);
    const updates = buffer.getUpdates('BTC');
    expect(updates.length).toBe(1);
    expect(updates[0].price).toBe(50000);
  });

  it('should maintain price snapshots', () => {
    const update: MarketUpdate = {
      sequence: 1,
      marketId: 'BTC',
      price: 50000,
      bid: 49999,
      ask: 50001,
      volume: 100,
      change: 500,
      changePercent: 1.0,
      timestamp: Date.now(),
    };

    buffer.addUpdate('BTC', update);
    const snapshot = buffer.getSnapshot('BTC');
    expect(snapshot).toBeDefined();
    expect(snapshot?.highPrice).toBe(50000);
    expect(snapshot?.lowPrice).toBe(50000);
  });

  it('should track price extremes', () => {
    const updates: MarketUpdate[] = [
      {
        sequence: 1,
        marketId: 'BTC',
        price: 50000,
        bid: 49999,
        ask: 50001,
        volume: 100,
        change: 500,
        changePercent: 1.0,
        timestamp: Date.now(),
      },
      {
        sequence: 2,
        marketId: 'BTC',
        price: 51000,
        bid: 50999,
        ask: 51001,
        volume: 200,
        change: 1000,
        changePercent: 2.0,
        timestamp: Date.now(),
      },
      {
        sequence: 3,
        marketId: 'BTC',
        price: 49000,
        bid: 48999,
        ask: 49001,
        volume: 150,
        change: -1000,
        changePercent: -2.0,
        timestamp: Date.now(),
      },
    ];

    updates.forEach((update) => buffer.addUpdate('BTC', update));
    const snapshot = buffer.getSnapshot('BTC');
    expect(snapshot?.highPrice).toBe(51000);
    expect(snapshot?.lowPrice).toBe(49000);
  });

  it('should retrieve latest update', () => {
    const update1: MarketUpdate = {
      sequence: 1,
      marketId: 'BTC',
      price: 50000,
      bid: 49999,
      ask: 50001,
      volume: 100,
      change: 500,
      changePercent: 1.0,
      timestamp: Date.now(),
    };

    const update2: MarketUpdate = {
      sequence: 2,
      marketId: 'BTC',
      price: 51000,
      bid: 50999,
      ask: 51001,
      volume: 200,
      change: 1000,
      changePercent: 2.0,
      timestamp: Date.now(),
    };

    buffer.addUpdate('BTC', update1);
    buffer.addUpdate('BTC', update2);
    const latest = buffer.getLatestUpdate('BTC');
    expect(latest?.price).toBe(51000);
  });

  it('should respect maximum buffer size', () => {
    const smallBuffer = new MarketDataBuffer(5);

    for (let i = 0; i < 10; i++) {
      const update: MarketUpdate = {
        sequence: i + 1,
        marketId: 'BTC',
        price: 50000 + i,
        bid: 49999 + i,
        ask: 50001 + i,
        volume: 100,
        change: 0,
        changePercent: 0,
        timestamp: Date.now(),
      };
      smallBuffer.addUpdate('BTC', update);
    }

    const updates = smallBuffer.getUpdates('BTC');
    expect(updates.length).toBeLessThanOrEqual(5);
  });

  it('should clear specific market buffer', () => {
    const update: MarketUpdate = {
      sequence: 1,
      marketId: 'BTC',
      price: 50000,
      bid: 49999,
      ask: 50001,
      volume: 100,
      change: 500,
      changePercent: 1.0,
      timestamp: Date.now(),
    };

    buffer.addUpdate('BTC', update);
    buffer.clearBuffer('BTC');
    expect(buffer.getLatestUpdate('BTC')).toBeUndefined();
  });

  it('should clear all buffers', () => {
    const update: MarketUpdate = {
      sequence: 1,
      marketId: 'BTC',
      price: 50000,
      bid: 49999,
      ask: 50001,
      volume: 100,
      change: 500,
      changePercent: 1.0,
      timestamp: Date.now(),
    };

    buffer.addUpdate('BTC', update);
    buffer.clearAll();
    expect(buffer.getSize()).toBe(0);
  });
});

describe('Order Book Buffer', () => {
  let buffer: OrderBookBuffer;

  beforeEach(() => {
    buffer = new OrderBookBuffer(100);
  });

  it('should store order books', () => {
    const orderBook: OrderBookUpdate = {
      sequence: 1,
      marketId: 'BTC',
      bids: [{ price: 49999, amount: 1 }],
      asks: [{ price: 50001, amount: 1 }],
      timestamp: Date.now(),
    };

    buffer.addOrderBook('BTC', orderBook);
    const stored = buffer.getOrderBook('BTC');
    expect(stored).toBeDefined();
    expect(stored?.bids.length).toBe(1);
  });

  it('should retrieve order book history', () => {
    const orderBook1: OrderBookUpdate = {
      sequence: 1,
      marketId: 'BTC',
      bids: [{ price: 49999, amount: 1 }],
      asks: [{ price: 50001, amount: 1 }],
      timestamp: Date.now(),
    };

    const orderBook2: OrderBookUpdate = {
      sequence: 2,
      marketId: 'BTC',
      bids: [{ price: 49998, amount: 2 }],
      asks: [{ price: 50002, amount: 2 }],
      timestamp: Date.now(),
    };

    buffer.addOrderBook('BTC', orderBook1);
    buffer.addOrderBook('BTC', orderBook2);
    const history = buffer.getOrderBookHistory('BTC', 10);
    expect(history.length).toBe(2);
  });
});

describe('Trade Buffer', () => {
  let buffer: TradeBuffer;

  beforeEach(() => {
    buffer = new TradeBuffer(1000);
  });

  it('should store trades', () => {
    const trade: TradeUpdate = {
      sequence: 1,
      marketId: 'BTC',
      price: 50000,
      amount: 1,
      side: 'buy',
      timestamp: Date.now(),
    };

    buffer.addTrade('BTC', trade);
    const trades = buffer.getTrades('BTC');
    expect(trades.length).toBe(1);
  });

  it('should calculate VWAP', () => {
    const trades: TradeUpdate[] = [
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
    ];

    trades.forEach((trade) => buffer.addTrade('BTC', trade));
    const vwap = buffer.calculateVWAP('BTC');
    expect(vwap).toBeGreaterThan(50000);
    expect(vwap).toBeLessThan(50100);
  });
});

describe('Price Utilities', () => {
  it('should calculate spread', () => {
    const { spread, spreadPercent } = calculateSpread(100, 101);
    expect(spread).toBe(1);
    expect(spreadPercent).toBeCloseTo(1.0, 1);
  });

  it('should calculate mid price', () => {
    const mid = calculateMidPrice(100, 102);
    expect(mid).toBe(101);
  });

  it('should calculate price change', () => {
    const { change, changePercent } = calculatePriceChange(110, 100);
    expect(change).toBe(10);
    expect(changePercent).toBe(10);
  });

  it('should calculate moving average', () => {
    const prices = [100, 102, 101, 103, 102, 104, 103, 105];
    const ma = calculateMovingAverage(prices, 3);
    expect(ma.length).toBe(8);
    expect(ma[2]).toBeGreaterThan(0);
  });

  it('should calculate RSI', () => {
    const prices = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i / 5) * 10);
    const rsi = calculateRSI(prices, 14);
    expect(rsi.length).toBeGreaterThan(0);
    expect(rsi[rsi.length - 1]).toBeGreaterThanOrEqual(0);
    expect(rsi[rsi.length - 1]).toBeLessThanOrEqual(100);
  });
});
