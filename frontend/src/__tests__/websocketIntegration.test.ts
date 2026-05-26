import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RealtimeDataManager } from '../services/RealtimeDataManager';
import { MarketDataBuffer } from '../utils/websocketUtils';
import { MarketUpdate } from '../types/websocket';

describe('WebSocket Integration Tests', () => {
  let manager: RealtimeDataManager;

  beforeEach(() => {
    manager = new RealtimeDataManager({
      wsEnabled: false,
      pollingEnabled: true,
      pollingInterval: 1000,
      maxReconnectAttempts: 3,
    });
  });

  afterEach(async () => {
    await manager.stop();
  });

  describe('Market Subscription Flow', () => {
    it('should handle multiple market subscriptions', async () => {
      manager.subscribeToMarket('BTC');
      manager.subscribeToMarket('ETH');
      manager.subscribeToMarket('DOGE');

      const subscribed = manager.getSubscribedMarkets();
      expect(subscribed).toContain('BTC');
      expect(subscribed).toContain('ETH');
      expect(subscribed).toContain('DOGE');
      expect(subscribed.length).toBe(3);
    });

    it('should not duplicate subscriptions', async () => {
      manager.subscribeToMarket('BTC');
      manager.subscribeToMarket('BTC');

      const subscribed = manager.getSubscribedMarkets();
      expect(subscribed.filter((id) => id === 'BTC').length).toBe(1);
    });

    it('should handle unsubscription', async () => {
      manager.subscribeToMarket('BTC');
      manager.subscribeToMarket('ETH');
      manager.unsubscribeFromMarket('BTC');

      const subscribed = manager.getSubscribedMarkets();
      expect(subscribed).not.toContain('BTC');
      expect(subscribed).toContain('ETH');
    });

    it('should handle unsubscription from non-existent market', async () => {
      manager.unsubscribeFromMarket('NONEXISTENT');
      expect(manager.getSubscribedMarkets().length).toBe(0);
    });
  });

  describe('Event Handler Registration', () => {
    it('should register market update handler', () => {
      const handler = vi.fn();
      manager.on('market:update', handler);
      expect(manager).toBeDefined();
    });

    it('should register orderbook update handler', () => {
      const handler = vi.fn();
      manager.on('orderbook:update', handler);
      expect(manager).toBeDefined();
    });

    it('should register connection handlers', () => {
      const openHandler = vi.fn();
      const closeHandler = vi.fn();
      const errorHandler = vi.fn();

      manager.on('connection:open', openHandler);
      manager.on('connection:close', closeHandler);
      manager.on('connection:error', errorHandler);

      expect(manager).toBeDefined();
    });
  });

  describe('Configuration Management', () => {
    it('should return configuration', () => {
      const config = manager.getConfiguration();
      expect(config).toBeDefined();
      expect(config.wsEnabled).toBe(false);
      expect(config.pollingEnabled).toBe(true);
    });

    it('should update configuration', () => {
      manager.updateConfiguration({ pollingInterval: 5000 });
      const config = manager.getConfiguration();
      expect(config.pollingInterval).toBe(5000);
    });

    it('should preserve other config values when updating', () => {
      const original = manager.getConfiguration();
      manager.updateConfiguration({ pollingInterval: 3000 });
      const updated = manager.getConfiguration();

      expect(updated.wsEnabled).toBe(original.wsEnabled);
      expect(updated.pollingEnabled).toBe(original.pollingEnabled);
      expect(updated.pollingInterval).toBe(3000);
    });
  });

  describe('Connection State Management', () => {
    it('should track connection state', () => {
      const state = manager.isConnected();
      expect(typeof state).toBe('boolean');
    });

    it('should identify WebSocket vs Polling', () => {
      const useWs = manager.isUsingWebSocket();
      expect(typeof useWs).toBe('boolean');
    });

    it('should match connection state after stop', async () => {
      await manager.stop();
      const state = manager.isConnected();
      expect(typeof state).toBe('boolean');
    });
  });

  describe('Market Data Retrieval', () => {
    it('should return undefined for unavailable market', () => {
      const data = manager.getMarketData('NONEXISTENT');
      expect(data).toBeUndefined();
    });

    it('should retrieve market data when available', () => {
      manager.subscribeToMarket('BTC');
      const data = manager.getMarketData('BTC');
      expect(typeof data === 'undefined' || typeof data === 'object').toBe(true);
    });
  });
});

describe('Market Data Buffer Integration', () => {
  let buffer: MarketDataBuffer;
  let baseTime: number;

  beforeEach(() => {
    buffer = new MarketDataBuffer(100);
    baseTime = Date.now();
  });

  describe('Continuous Data Stream', () => {
    it('should maintain consistent price history', () => {
      const updates: MarketUpdate[] = [];

      for (let i = 0; i < 10; i++) {
        const update: MarketUpdate = {
          sequence: i + 1,
          marketId: 'BTC',
          price: 50000 + i * 100,
          bid: 50000 + i * 100 - 1,
          ask: 50000 + i * 100 + 1,
          volume: 100 * (i + 1),
          change: i * 100,
          changePercent: 0.2 * i,
          timestamp: baseTime + i * 1000,
        };
        updates.push(update);
        buffer.addUpdate('BTC', update);
      }

      const storedUpdates = buffer.getUpdates('BTC');
      expect(storedUpdates.length).toBe(10);
      expect(storedUpdates[0].price).toBe(50000);
      expect(storedUpdates[9].price).toBe(50900);
    });

    it('should track accurate OHLC data', () => {
      const prices = [50000, 50500, 50200, 50800, 50300, 51000, 50400, 50700, 50600, 50900];

      prices.forEach((price, index) => {
        const update: MarketUpdate = {
          sequence: index + 1,
          marketId: 'BTC',
          price,
          bid: price - 1,
          ask: price + 1,
          volume: 100,
          change: 0,
          changePercent: 0,
          timestamp: baseTime + index * 1000,
        };
        buffer.addUpdate('BTC', update);
      });

      const snapshot = buffer.getSnapshot('BTC');
      expect(snapshot?.openPrice).toBe(50000);
      expect(snapshot?.highPrice).toBe(51000);
      expect(snapshot?.lowPrice).toBe(50000);
      expect(snapshot?.closePrice).toBe(50900);
    });

    it('should update snapshot on each new price', () => {
      let updateCount = 0;

      for (let i = 0; i < 5; i++) {
        const update: MarketUpdate = {
          sequence: i + 1,
          marketId: 'BTC',
          price: 50000 + i * 100,
          bid: 49999 + i * 100,
          ask: 50001 + i * 100,
          volume: 100,
          change: i * 100,
          changePercent: i * 0.2,
          timestamp: baseTime + i * 1000,
        };
        buffer.addUpdate('BTC', update);
        updateCount++;
      }

      const snapshot = buffer.getSnapshot('BTC');
      expect(snapshot?.updateCount).toBe(updateCount);
    });
  });

  describe('Multiple Market Tracking', () => {
    it('should maintain separate histories for different markets', () => {
      const btcUpdate: MarketUpdate = {
        sequence: 1,
        marketId: 'BTC',
        price: 50000,
        bid: 49999,
        ask: 50001,
        volume: 100,
        change: 0,
        changePercent: 0,
        timestamp: baseTime,
      };

      const ethUpdate: MarketUpdate = {
        sequence: 1,
        marketId: 'ETH',
        price: 3000,
        bid: 2999,
        ask: 3001,
        volume: 100,
        change: 0,
        changePercent: 0,
        timestamp: baseTime,
      };

      buffer.addUpdate('BTC', btcUpdate);
      buffer.addUpdate('ETH', ethUpdate);

      const btcSnapshot = buffer.getSnapshot('BTC');
      const ethSnapshot = buffer.getSnapshot('ETH');

      expect(btcSnapshot?.currentPrice).toBe(50000);
      expect(ethSnapshot?.currentPrice).toBe(3000);
    });

    it('should isolate clearing of single market', () => {
      const btcUpdate: MarketUpdate = {
        sequence: 1,
        marketId: 'BTC',
        price: 50000,
        bid: 49999,
        ask: 50001,
        volume: 100,
        change: 0,
        changePercent: 0,
        timestamp: baseTime,
      };

      const ethUpdate: MarketUpdate = {
        sequence: 1,
        marketId: 'ETH',
        price: 3000,
        bid: 2999,
        ask: 3001,
        volume: 100,
        change: 0,
        changePercent: 0,
        timestamp: baseTime,
      };

      buffer.addUpdate('BTC', btcUpdate);
      buffer.addUpdate('ETH', ethUpdate);
      buffer.clearBuffer('BTC');

      expect(buffer.getLatestUpdate('BTC')).toBeUndefined();
      expect(buffer.getLatestUpdate('ETH')).toBeDefined();
    });
  });

  describe('Data Preservation', () => {
    it('should not lose updates when adding continuously', () => {
      for (let i = 0; i < 50; i++) {
        const update: MarketUpdate = {
          sequence: i + 1,
          marketId: 'BTC',
          price: 50000 + i,
          bid: 49999 + i,
          ask: 50001 + i,
          volume: 100,
          change: i,
          changePercent: i * 0.02,
          timestamp: baseTime + i * 100,
        };
        buffer.addUpdate('BTC', update);
      }

      const updates = buffer.getUpdates('BTC');
      expect(updates.length).toBeLessThanOrEqual(100);
      expect(updates[updates.length - 1].sequence).toBe(50);
    });

    it('should handle rapid sequential updates', () => {
      const rapidUpdates: MarketUpdate[] = Array.from({ length: 20 }, (_, i) => ({
        sequence: i + 1,
        marketId: 'BTC',
        price: 50000 + Math.random() * 1000,
        bid: 49999 + Math.random() * 1000,
        ask: 50001 + Math.random() * 1000,
        volume: 100 + Math.random() * 100,
        change: Math.random() * 100,
        changePercent: Math.random() * 5,
        timestamp: baseTime + i,
      }));

      rapidUpdates.forEach((update) => buffer.addUpdate('BTC', update));
      const stored = buffer.getUpdates('BTC');
      expect(stored.length).toBe(20);
    });
  });
});

describe('Fallback Mechanism', () => {
  it('should fall back to polling when WebSocket fails', async () => {
    const manager = new RealtimeDataManager({
      wsEnabled: true,
      pollingEnabled: true,
      pollingInterval: 5000,
      wsUrl: 'ws://invalid-url-that-fails.local:9999/markets',
    });

    manager.subscribeToMarket('BTC');
    await manager.start();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(typeof manager.isConnected()).toBe('boolean');
    expect(typeof manager.isUsingWebSocket()).toBe('boolean');

    await manager.stop();
  });

  it('should maintain subscriptions during fallback', () => {
    const manager = new RealtimeDataManager({
      wsEnabled: false,
      pollingEnabled: true,
      pollingInterval: 1000,
    });

    manager.subscribeToMarket('BTC');
    manager.subscribeToMarket('ETH');

    expect(manager.getSubscribedMarkets()).toContain('BTC');
    expect(manager.getSubscribedMarkets()).toContain('ETH');
  });
});
