# WebSocket Examples

## Basic Market Data Streaming

### Server Example

```typescript
import { RealtimeMarketServer } from './services/RealtimeMarketServer';

const server = new RealtimeMarketServer({
  port: 8080,
  batchInterval: 100,
  maxConnections: 1000,
});

server.start();

// Simulate market updates
setInterval(() => {
  const btcPrice = 50000 + Math.random() * 1000;
  const ethPrice = 3000 + Math.random() * 200;

  server.broadcastUpdate({
    sequence: Date.now(),
    marketId: 'BTC',
    price: btcPrice,
    bid: btcPrice - 1,
    ask: btcPrice + 1,
    volume: 1000000,
    change: Math.random() * 1000,
    changePercent: Math.random() * 5,
    timestamp: Date.now(),
  });

  server.broadcastUpdate({
    sequence: Date.now() + 1,
    marketId: 'ETH',
    price: ethPrice,
    bid: ethPrice - 0.5,
    ask: ethPrice + 0.5,
    volume: 500000,
    change: Math.random() * 100,
    changePercent: Math.random() * 3,
    timestamp: Date.now(),
  });
}, 1000);

process.on('SIGINT', () => {
  server.stop();
  process.exit();
});
```

### Client Example

```typescript
import { RealtimeDataManager } from './services/RealtimeDataManager';

const manager = new RealtimeDataManager({
  wsUrl: 'ws://localhost:8080/markets',
  wsEnabled: true,
  pollingEnabled: true,
});

await manager.start();

// Subscribe to markets
manager.subscribeToMarket('BTC');
manager.subscribeToMarket('ETH');

// Listen for market updates
manager.on('market:update', (update) => {
  console.log(`${update.marketId}: $${update.price.toFixed(2)} (${update.changePercent.toFixed(2)}%)`);
});

// Monitor connection
manager.on('connection:open', () => {
  console.log('Connected');
});

manager.on('connection:close', () => {
  console.log('Disconnected');
});

manager.on('connection:error', (error) => {
  console.error('Connection error:', error);
});

// Keep running
process.on('SIGINT', async () => {
  await manager.stop();
  process.exit();
});
```

## React Component Examples

### Market Price Display

```typescript
import React from 'react';
import { useRealtimePrice } from '../hooks/useRealtimeMarket';

export function LivePriceDisplay({ marketId }) {
  const { price, change, changePercent } = useRealtimePrice(marketId);

  return (
    <div className="price-display">
      <h2>{marketId}</h2>
      <div className="price">${price.toFixed(2)}</div>
      <div className={`change ${change >= 0 ? 'positive' : 'negative'}`}>
        {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
      </div>
    </div>
  );
}
```

### Order Book Component

```typescript
import React from 'react';
import { useRealtimeOrderBook } from '../hooks/useRealtimeMarket';

export function LiveOrderBook({ marketId }) {
  const { orderBook, isLoading } = useRealtimeOrderBook(marketId);

  if (isLoading) return <div>Loading...</div>;
  if (!orderBook) return <div>No data</div>;

  const totalBidAmount = orderBook.bids.reduce((sum, bid) => sum + bid.amount, 0);
  const totalAskAmount = orderBook.asks.reduce((sum, ask) => sum + ask.amount, 0);

  return (
    <div className="orderbook">
      <div className="side bids">
        <h3>Bids ({totalBidAmount.toFixed(2)})</h3>
        <div className="levels">
          {orderBook.bids.slice(0, 10).map((bid, i) => (
            <div key={i} className="level">
              <span className="price">${bid.price.toFixed(4)}</span>
              <span className="amount">{bid.amount.toFixed(4)}</span>
              <span className="total">${(bid.price * bid.amount).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="side asks">
        <h3>Asks ({totalAskAmount.toFixed(2)})</h3>
        <div className="levels">
          {orderBook.asks.slice(0, 10).map((ask, i) => (
            <div key={i} className="level">
              <span className="price">${ask.price.toFixed(4)}</span>
              <span className="amount">{ask.amount.toFixed(4)}</span>
              <span className="total">${(ask.price * ask.amount).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Trade Stream Component

```typescript
import React from 'react';
import { useRealtimeTrades } from '../hooks/useRealtimeMarket';

export function TradeStream({ marketId }) {
  const { trades } = useRealtimeTrades(marketId);

  const totalVolume = trades.reduce((sum, trade) => sum + trade.amount, 0);

  return (
    <div className="trade-stream">
      <h3>Trades ({trades.length})</h3>
      <div className="stats">
        <span>Volume: {totalVolume.toFixed(2)}</span>
        <span>Avg Price: ${(trades.reduce((sum, t) => sum + t.price, 0) / trades.length).toFixed(2)}</span>
      </div>
      <div className="trades">
        {trades.slice(0, 20).map((trade, i) => (
          <div key={i} className={`trade ${trade.side}`}>
            <span className="time">{new Date(trade.timestamp).toLocaleTimeString()}</span>
            <span className="side">{trade.side.toUpperCase()}</span>
            <span className="amount">{trade.amount.toFixed(4)}</span>
            <span className="price">${trade.price.toFixed(2)}</span>
            <span className="total">${(trade.price * trade.amount).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Market Watchlist

```typescript
import React, { useState } from 'react';
import { useRealtimeMarkets } from '../hooks/useRealtimeMarket';

export function MarketWatchlist({ initialMarkets = ['BTC', 'ETH', 'DOGE'] }) {
  const [markets, setMarkets] = useState(initialMarkets);
  const { marketsData } = useRealtimeMarkets(markets);

  const addMarket = (marketId) => {
    if (!markets.includes(marketId)) {
      setMarkets([...markets, marketId]);
    }
  };

  const removeMarket = (marketId) => {
    setMarkets(markets.filter((id) => id !== marketId));
  };

  return (
    <div className="watchlist">
      <h2>Market Watchlist</h2>

      <div className="markets-grid">
        {Array.from(marketsData.entries()).map(([marketId, data]) => (
          <div key={marketId} className="market-card">
            <div className="header">
              <h3>{marketId}</h3>
              <button onClick={() => removeMarket(marketId)}>Remove</button>
            </div>
            <div className={`price ${data.change >= 0 ? 'up' : 'down'}`}>${data.price.toFixed(2)}</div>
            <div className="change">
              {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
            </div>
            <div className="volume">Vol: {(data.volume / 1e6).toFixed(2)}M</div>
          </div>
        ))}
      </div>

      <div className="actions">
        <input type="text" id="newMarket" placeholder="Market ID" />
        <button onClick={() => addMarket(document.getElementById('newMarket')?.value)}>Add Market</button>
      </div>
    </div>
  );
}
```

### Connection Status Indicator

```typescript
import React from 'react';
import { useRealtimeConnection } from '../hooks/useRealtimeMarket';

export function ConnectionStatus() {
  const { isConnected, useWebSocket } = useRealtimeConnection();

  return (
    <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
      <div className="indicator-dot"></div>
      <div className="status-text">
        {isConnected ? 'Live' : 'Offline'}
      </div>
      <div className="mode-badge">
        {useWebSocket ? 'WebSocket' : 'Polling'}
      </div>
    </div>
  );
}
```

## Data Analysis Example

```typescript
import { MarketDataBuffer, calculateMovingAverage, calculateRSI } from './utils/websocketUtils';

const buffer = new MarketDataBuffer(500);

function analyzeMarket(marketId) {
  const updates = buffer.getUpdates(marketId);
  if (updates.length < 14) return null;

  const prices = updates.map((u) => u.price);

  const ma20 = calculateMovingAverage(prices, 20);
  const rsi14 = calculateRSI(prices, 14);

  const currentPrice = prices[prices.length - 1];
  const currentRSI = rsi14[rsi14.length - 1];
  const currentMA = ma20[ma20.length - 1];

  return {
    price: currentPrice,
    rsi: currentRSI,
    movingAverage: currentMA,
    aboveMA: currentPrice > currentMA,
    isOverbought: currentRSI > 70,
    isOversold: currentRSI < 30,
  };
}
```

## Configuration Example

```typescript
import { RealtimeDataManager } from './services/RealtimeDataManager';

// High-frequency trading setup
const hftManager = new RealtimeDataManager({
  wsUrl: 'wss://api.example.com/markets',
  wsEnabled: true,
  pollingEnabled: false,
  maxReconnectAttempts: 20,
  heartbeatInterval: 5000, // 5 second heartbeat
});

// Conservative setup with fallback
const reliableManager = new RealtimeDataManager({
  wsUrl: 'ws://localhost:8080/markets',
  wsEnabled: true,
  pollingEnabled: true,
  pollingInterval: 10000, // 10 second polling
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000, // 30 second heartbeat
});

// Polling-only (no WebSocket)
const pollOnlyManager = new RealtimeDataManager({
  wsEnabled: false,
  pollingEnabled: true,
  pollingInterval: 5000,
});
```

## Event Monitoring Example

```typescript
function setupEventMonitoring(manager) {
  let messageCount = 0;
  let errorCount = 0;
  let lastMessage = Date.now();

  manager.on('market:update', () => {
    messageCount++;
    lastMessage = Date.now();
  });

  manager.on('connection:error', () => {
    errorCount++;
  });

  setInterval(() => {
    const messageRate = messageCount / 10; // per second
    const timeSinceLastUpdate = Date.now() - lastMessage;

    console.log(`Messages/sec: ${messageRate}, Last update: ${timeSinceLastUpdate}ms ago, Errors: ${errorCount}`);

    messageCount = 0;
  }, 10000);
}
```

## Load Testing Example

```typescript
async function loadTest(numberOfMarkets = 100) {
  const manager = new RealtimeDataManager({
    wsUrl: 'ws://localhost:8080/markets',
    wsEnabled: true,
    pollingEnabled: false,
  });

  await manager.start();

  // Subscribe to many markets
  const marketIds = Array.from({ length: numberOfMarkets }, (_, i) => `MARKET${i}`);
  marketIds.forEach((id) => manager.subscribeToMarket(id));

  let updateCount = 0;
  const startTime = Date.now();

  manager.on('market:update', () => {
    updateCount++;
  });

  // Monitor for 60 seconds
  await new Promise((resolve) => setTimeout(resolve, 60000));

  const duration = (Date.now() - startTime) / 1000;
  const rate = updateCount / duration;

  console.log(`Updates received: ${updateCount}`);
  console.log(`Duration: ${duration}s`);
  console.log(`Rate: ${rate.toFixed(2)} updates/sec`);
  console.log(`Subscribed markets: ${marketIds.length}`);

  await manager.stop();
}
```
