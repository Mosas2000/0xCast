# WebSocket Real-time Market Data Integration Guide

## Overview

This guide covers the implementation of real-time market data updates using WebSocket with automatic fallback to polling. The system provides live market prices, order books, and trade data to connected clients.

## Architecture

### Components

1. **RealtimeMarketClient** - Client-side WebSocket connection management
2. **RealtimeMarketServer** - Server-side WebSocket handler
3. **MarketPollingService** - Fallback polling mechanism
4. **RealtimeDataManager** - Unified interface for both WebSocket and polling
5. **Data Buffers** - In-memory storage for market data

### Event Flow

```
Market Update
    ↓
RealtimeMarketServer
    ↓
    ├→ RealtimeMarketClient (WebSocket)
    │   ↓
    │   React Components
    │   React Hooks
    │
    └→ MarketPollingService (Fallback)
        ↓
        React Components
        React Hooks
```

## Server Setup

### Installation

```bash
npm install
```

### Starting the WebSocket Server

```typescript
import { RealtimeMarketServer } from './services/RealtimeMarketServer';

const server = new RealtimeMarketServer({
  port: 8080,
  batchInterval: 100,
  maxConnections: 1000,
});

server.start();

// Broadcasting market updates
const update = {
  sequence: 1,
  marketId: 'BTC',
  price: 50000,
  bid: 49999,
  ask: 50001,
  volume: 1000000,
  change: 500,
  changePercent: 1.0,
  timestamp: Date.now(),
};

server.broadcastUpdate(update);
```

## Client Integration

### Basic Setup

```typescript
import { RealtimeDataManager } from './services/RealtimeDataManager';

const manager = new RealtimeDataManager({
  wsUrl: 'ws://localhost:8080/markets',
  wsEnabled: true,
  pollingEnabled: true,
  pollingInterval: 5000,
});

await manager.start();
manager.subscribeToMarket('BTC');
```

### React Hooks

#### useRealtimeMarketData

Get live market data for a specific market:

```typescript
function MarketPrice({ marketId }) {
  const { marketData, isConnected, error } = useRealtimeMarketData(marketId);

  if (error) return <div>Connection error: {error.message}</div>;
  if (!marketData) return <div>Loading...</div>;

  return (
    <div>
      <span>Price: ${marketData.price}</span>
      <span className={marketData.change >= 0 ? 'up' : 'down'}>
        {marketData.changePercent.toFixed(2)}%
      </span>
      <span>{isConnected ? 'Live' : 'Offline'}</span>
    </div>
  );
}
```

#### useRealtimeOrderBook

Stream order book updates:

```typescript
function OrderBook({ marketId }) {
  const { orderBook, isLoading } = useRealtimeOrderBook(marketId);

  if (isLoading) return <div>Loading order book...</div>;
  if (!orderBook) return <div>No data</div>;

  return (
    <div>
      <h3>Bids</h3>
      {orderBook.bids.map((bid) => (
        <div key={bid.price}>
          {bid.price} x {bid.amount}
        </div>
      ))}
      <h3>Asks</h3>
      {orderBook.asks.map((ask) => (
        <div key={ask.price}>
          {ask.price} x {ask.amount}
        </div>
      ))}
    </div>
  );
}
```

#### useRealtimeTrades

Monitor live trades:

```typescript
function RecentTrades({ marketId }) {
  const { trades } = useRealtimeTrades(marketId);

  return (
    <div>
      <h3>Recent Trades</h3>
      {trades.map((trade) => (
        <div key={trade.sequence}>
          {trade.side} {trade.amount} @ ${trade.price}
        </div>
      ))}
    </div>
  );
}
```

#### useRealtimeConnection

Monitor connection status:

```typescript
function ConnectionStatus() {
  const { isConnected, useWebSocket, reconnectAttempts } = useRealtimeConnection();

  return (
    <div>
      <div className={isConnected ? 'connected' : 'disconnected'}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <div>Mode: {useWebSocket ? 'WebSocket' : 'Polling'}</div>
      <div>Reconnect attempts: {reconnectAttempts}</div>
    </div>
  );
}
```

#### useRealtimePrice

Track price movements:

```typescript
function PriceTicker({ marketId }) {
  const { price, change, changePercent } = useRealtimePrice(marketId);

  return (
    <div>
      <span className="price">${price.toFixed(2)}</span>
      <span className={change >= 0 ? 'positive' : 'negative'}>
        {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
      </span>
    </div>
  );
}
```

#### useRealtimeMarkets

Track multiple markets:

```typescript
function MarketDashboard() {
  const { marketsData } = useRealtimeMarkets(['BTC', 'ETH', 'DOGE']);

  return (
    <div>
      {Array.from(marketsData.entries()).map(([marketId, data]) => (
        <div key={marketId}>
          <h3>{marketId}</h3>
          <p>Price: ${data.price}</p>
          <p>Volume: {data.volume}</p>
        </div>
      ))}
    </div>
  );
}
```

### Components

#### RealtimeMarketCard

```typescript
<RealtimeMarketCard
  marketId="BTC"
  showTicker={true}
  showVolume={true}
  showSpread={true}
/>
```

#### OrderBookDisplay

```typescript
<OrderBookDisplay marketId="BTC" maxLevels={10} />
```

#### LiveTradeList

```typescript
<LiveTradeList marketId="BTC" maxTrades={20} />
```

#### WebSocketStatus

```typescript
<WebSocketStatus showDetails={true} />
```

#### RealtimeDashboard

```typescript
<RealtimeDashboard
  watchlistMarketIds={['BTC', 'ETH']}
  showOrderBook={true}
  showTrades={true}
/>
```

## Utilities

### MarketDataBuffer

```typescript
import { MarketDataBuffer } from './utils/websocketUtils';

const buffer = new MarketDataBuffer(1000);

buffer.addUpdate('BTC', marketUpdate);
const snapshot = buffer.getSnapshot('BTC');
const history = buffer.getUpdates('BTC');
buffer.clearBuffer('BTC');
```

### Price Calculations

```typescript
import {
  calculateSpread,
  calculateMidPrice,
  calculatePriceChange,
  calculateMovingAverage,
  calculateRSI,
} from './utils/websocketUtils';

// Calculate bid-ask spread
const { spread, spreadPercent } = calculateSpread(100, 101);

// Calculate mid price
const mid = calculateMidPrice(100, 102);

// Track price changes
const { change, changePercent } = calculatePriceChange(110, 100);

// Technical indicators
const ma = calculateMovingAverage(prices, 20);
const rsi = calculateRSI(prices, 14);
```

## Configuration

### Manager Configuration

```typescript
const manager = new RealtimeDataManager({
  wsUrl: 'ws://localhost:8080/markets',
  wsEnabled: true,
  pollingEnabled: true,
  pollingInterval: 5000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
});

// Update configuration at runtime
manager.updateConfiguration({ pollingInterval: 10000 });

// Get current configuration
const config = manager.getConfiguration();
```

## Performance Considerations

### Data Buffering

- Default market data buffer: 1000 updates per market
- Default order book buffer: 500 snapshots per market
- Default trade buffer: 5000 trades per market

Adjust buffer sizes based on memory constraints:

```typescript
const buffer = new MarketDataBuffer(500); // Smaller buffer
```

### Batch Processing

WebSocket server batches updates at 100ms intervals to reduce network overhead:

```typescript
const server = new RealtimeMarketServer({
  batchInterval: 50, // Increase responsiveness
  maxConnections: 2000,
});
```

### Polling Interval

Fallback polling defaults to 5 seconds. Adjust based on latency requirements:

```typescript
manager.setPollingInterval(3000); // 3 second polling
```

## Error Handling

### Connection Errors

The system automatically falls back to polling when WebSocket fails:

```typescript
manager.on('connection:error', (error) => {
  console.error('Connection error:', error);
  // System will automatically use polling
});
```

### Data Errors

Handle data processing errors:

```typescript
manager.on('data:error', (error) => {
  console.error('Data processing error:', error);
});
```

### Recovery

The WebSocket client implements automatic reconnection with exponential backoff:

- Initial delay: 1 second
- Maximum delay: 30 seconds
- Maximum attempts: 10

## Testing

### Unit Tests

```bash
npm run test -- websocket.test.ts
```

### Integration Tests

```bash
npm run test -- websocketIntegration.test.ts
```

### Load Testing

```typescript
const manager = new RealtimeDataManager();
const marketIds = Array.from({ length: 100 }, (_, i) => `MARKET${i}`);
marketIds.forEach((id) => manager.subscribeToMarket(id));
```

## Troubleshooting

### WebSocket Connection Fails

1. Check server is running: `ws://localhost:8080`
2. Check firewall rules allow WebSocket
3. Verify CORS headers if cross-origin
4. Check browser console for SSL/TLS errors

### Polling Fallback Not Working

1. Ensure `pollingEnabled: true` in configuration
2. Check network connectivity
3. Verify polling service endpoint is accessible
4. Check `pollingInterval` is reasonable (should be >1000ms)

### High Memory Usage

1. Reduce buffer sizes
2. Unsubscribe from unused markets
3. Clear buffers periodically
4. Monitor number of active subscriptions

### Stale Data

1. Check heartbeat is working (logs should show ping/pong)
2. Verify server is sending updates regularly
3. Increase polling interval if using polling mode
4. Check for message processing bottlenecks

## Best Practices

1. **Subscribe to specific markets** - Don't subscribe to all markets
2. **Unsubscribe when done** - Clean up subscriptions to save memory
3. **Use hooks for state management** - Let React handle updates
4. **Cache market data** - Use buffers for historical analysis
5. **Monitor connection status** - Display status indicator to users
6. **Handle errors gracefully** - Implement fallback UI for disconnections
7. **Batch requests** - Don't open multiple connections for same data
8. **Update configuration** - Tune polling interval based on latency requirements
9. **Use TypeScript** - Full type safety for all WebSocket operations
10. **Test thoroughly** - Test both WebSocket and polling modes

## API Reference

See `WEBSOCKET_API_REFERENCE.md` for complete API documentation.

## Examples

See `frontend/src/components/RealtimeMarketComponents.tsx` for component examples.

## Migration Guide

If migrating from HTTP polling:

1. Replace polling calls with hooks
2. Use `useRealtimeMarketData` instead of fetch
3. Update event handlers to use manager.on()
4. Remove manual refresh buttons if using live data
5. Test both WebSocket and polling modes
