# WebSocket Troubleshooting Guide

## Connection Issues

### WebSocket Connection Fails Immediately

**Symptoms:**
- `WebSocketError: connect ECONNREFUSED`
- Connection timeout errors
- Never transitions to `connected` state

**Causes:**
1. Server not running
2. Wrong URL or port
3. Network/firewall blocking
4. Server on different machine but not accepting external connections

**Solutions:**

```typescript
// Verify server is running
curl -i http://localhost:8080/health

// Check network connectivity
ping server-hostname

// Enable debug logging
const manager = new RealtimeDataManager({
  debug: true, // Log all messages
  wsUrl: 'ws://localhost:8080/markets',
});

// Test with explicit error handling
const client = new RealtimeMarketClient({
  url: 'ws://localhost:8080/markets',
});

client.on('connection:error', (error) => {
  console.error('Connection failed:', error.message);
  console.error('Error code:', error.code);
});

try {
  await client.connect();
} catch (error) {
  console.error('Failed to connect:', error);
}
```

### Connection Drops After 30 Seconds

**Symptoms:**
- Connects successfully
- Disconnects after ~30 seconds
- No error message

**Causes:**
1. Heartbeat/ping-pong not working
2. Network timeout
3. Server closing idle connections
4. Firewall dropping long-lived connections

**Solutions:**

```typescript
// Increase heartbeat frequency
const client = new RealtimeMarketClient({
  url: 'ws://localhost:8080/markets',
  heartbeatInterval: 10000, // 10 seconds instead of 30
});

// Check server heartbeat implementation
// Should send ping every heartbeatInterval
// Should disconnect if no pong received

// Monitor heartbeat
client.on('heartbeat:ping', () => {
  console.log('Sent ping at', new Date().toLocaleTimeString());
});

client.on('heartbeat:pong', () => {
  console.log('Received pong at', new Date().toLocaleTimeString());
});
```

### Reconnection Loop

**Symptoms:**
- Rapidly connecting and disconnecting
- `maxReconnectAttempts` exceeded
- High CPU usage from continuous reconnections

**Causes:**
1. Server rejecting connections
2. Subscription errors
3. Message parsing errors
4. Max reconnect attempts too low

**Solutions:**

```typescript
// Increase reconnect attempts
const manager = new RealtimeDataManager({
  maxReconnectAttempts: 20, // Increase from default 10
  wsUrl: 'ws://localhost:8080/markets',
});

// Add logging to identify issue
manager.on('connection:error', (error) => {
  console.error('Reconnection attempt failed:', error);
  console.error('Current attempt:', manager.getReconnectAttempts?.());
});

// Check for subscription errors
manager.on('subscribe:error', (error) => {
  console.error('Subscription failed:', error);
  // Remove problematic subscription
});

// Implement exponential backoff on client side
async function connectWithBackoff() {
  let delay = 1000;
  for (let i = 0; i < 10; i++) {
    try {
      await manager.start();
      return;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed, waiting ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 30000); // Max 30 seconds
    }
  }
}
```

## Data Issues

### Not Receiving Updates

**Symptoms:**
- Connected to server
- No market updates received
- `marketData` is always null

**Causes:**
1. Not subscribed to correct channels
2. Server not broadcasting updates
3. Channel names wrong (case-sensitive)
4. Filtering issue in server

**Solutions:**

```typescript
// Verify subscription format
manager.subscribeToMarket('BTC');
// Should subscribe to 'market:BTC' and 'orderbook:BTC' internally

// Check subscriptions are registered
console.log('Subscribed to:', manager.getSubscribedMarkets());

// Add logging for updates
manager.on('market:update', (update) => {
  console.log('Received update:', update);
});

// Verify correct market ID format
// Some systems use 'BTC', others use 'btc', 'BTC_USD', etc.
manager.subscribeToMarket('BTC');
manager.subscribeToMarket('BTC_USD');
manager.subscribeToMarket('BTCUSD');
```

### Stale/Delayed Data

**Symptoms:**
- Receiving updates but they're old
- Timestamp lags current time significantly
- Order book doesn't reflect recent trades

**Causes:**
1. Server batching too aggressively
2. Network latency
3. Polling interval too high
4. Message queue backlog

**Solutions:**

```typescript
// Reduce server batch interval
const server = new RealtimeMarketServer({
  port: 8080,
  batchInterval: 50, // From default 100ms
});

// Monitor update freshness
manager.on('market:update', (update) => {
  const latency = Date.now() - update.timestamp;
  if (latency > 1000) {
    console.warn(`Stale update: ${latency}ms old`);
  }
});

// Reduce polling interval
manager.setPollingInterval(3000); // From default 5000ms

// Check network latency
const startTime = Date.now();
manager.on('market:update', (update) => {
  const roundTrip = Date.now() - startTime;
  console.log(`Update received in ${roundTrip}ms`);
});
```

### Duplicate Updates

**Symptoms:**
- Receiving same sequence number twice
- Duplicate trades in buffer
- Order book levels duplicated

**Causes:**
1. Server sending duplicates
2. Client not tracking sequence numbers
3. Fallback to polling still active (double updates)

**Solutions:**

```typescript
// Use MarketDataBuffer which handles sequences
const buffer = new MarketDataBuffer(1000);

const seenSequences = new Set();

manager.on('market:update', (update) => {
  if (seenSequences.has(update.sequence)) {
    console.warn('Duplicate update detected:', update.sequence);
    return;
  }
  seenSequences.add(update.sequence);
  buffer.addUpdate(update.marketId, update);
});

// Ensure only WebSocket is active
if (manager.isUsingWebSocket()) {
  console.log('Using WebSocket (no polling)');
} else {
  console.log('Using polling (WebSocket failed)');
}

// Clear duplicates from buffer
const updates = buffer.getUpdates('BTC');
const uniqueUpdates = updates.filter((update, index, self) => {
  return index === self.findIndex((u) => u.sequence === update.sequence);
});
```

### Order Book Out of Sync

**Symptoms:**
- Order book total size doesn't match orders
- Bids and asks unbalanced
- Updates skip sequence numbers

**Causes:**
1. Missed sequence number
2. Merge error (applying deltas wrong)
3. Stale snapshot

**Solutions:**

```typescript
// Track sequence numbers
let expectedSequence = 0;
let missedSequences = [];

manager.on('orderbook:update', (update) => {
  if (update.sequence !== expectedSequence + 1) {
    missedSequences.push({
      expected: expectedSequence + 1,
      received: update.sequence,
      gap: update.sequence - expectedSequence - 1,
    });
    console.warn('Sequence gap detected:', update.sequence - expectedSequence);
  }
  expectedSequence = update.sequence;
});

// Request full refresh if gap detected
async function refreshOrderBook(marketId) {
  const response = await fetch(`/api/markets/${marketId}/orderbook`);
  const freshOrderBook = await response.json();
  buffer.addOrderBook(marketId, freshOrderBook);
}

// Validate order book integrity
function validateOrderBook(orderBook) {
  // Bids should be descending
  for (let i = 1; i < orderBook.bids.length; i++) {
    if (orderBook.bids[i].price >= orderBook.bids[i - 1].price) {
      return false; // Invalid: not descending
    }
  }

  // Asks should be ascending
  for (let i = 1; i < orderBook.asks.length; i++) {
    if (orderBook.asks[i].price <= orderBook.asks[i - 1].price) {
      return false; // Invalid: not ascending
    }
  }

  // Best bid should be < best ask
  if (orderBook.bids[0]?.price >= orderBook.asks[0]?.price) {
    return false; // Invalid: bid >= ask
  }

  return true;
}
```

## Performance Issues

### High CPU Usage

**Symptoms:**
- CPU constantly at 50-100%
- Event loop blocked
- React re-renders stuttering

**Causes:**
1. Too many subscriptions
2. Event handlers doing heavy processing
3. Buffers growing unbhecked
4. Update event firing too frequently

**Solutions:**

```typescript
// Limit subscriptions
const maxSubscriptions = 50;
if (manager.getSubscribedMarkets().length > maxSubscriptions) {
  console.warn('Too many subscriptions, unsubscribing from old ones');
}

// Move heavy processing to Web Worker
const worker = new Worker('marketAnalysis.worker.ts');

manager.on('market:update', (update) => {
  worker.postMessage(update);
});

worker.onmessage = (event) => {
  const analysis = event.data;
  // Use lightweight result
};

// Batch processing updates
const updateQueue: MarketUpdate[] = [];
const batchSize = 10;

manager.on('market:update', (update) => {
  updateQueue.push(update);
  if (updateQueue.length >= batchSize) {
    processBatch(updateQueue.splice(0, batchSize));
  }
});

// Monitor buffer growth
setInterval(() => {
  const size = buffer.getSize();
  if (size > 10000) {
    console.warn('Buffer too large:', size);
    // Clear old data
    buffer.clearAll();
  }
}, 10000);
```

### High Memory Usage

**Symptoms:**
- Memory continuously growing
- Process eventually crashes with OOM
- Garbage collection pauses

**Causes:**
1. Buffers growing unbounded
2. Event listeners leaking
3. Unsubscribed markets still in memory
4. Too many simultaneous subscriptions

**Solutions:**

```typescript
// Limit buffer sizes
const buffer = new MarketDataBuffer(100); // Smaller buffer
const tradeBuffer = new TradeBuffer(500); // Limit trades

// Clean up old subscriptions
function pruneInactiveSubscriptions() {
  const subscriptions = manager.getSubscribedMarkets();
  const inactive = subscriptions.filter((id) => {
    const data = manager.getMarketData(id);
    return !data; // No data = inactive
  });

  inactive.forEach((id) => {
    manager.unsubscribeFromMarket(id);
  });
}

setInterval(pruneInactiveSubscriptions, 60000);

// Remove unused listeners
manager.off('market:update', heavyProcessingHandler);

// Track memory usage
setInterval(() => {
  if (performance.memory) {
    const used = performance.memory.usedJSHeapSize / 1048576;
    const limit = performance.memory.jsHeapSizeLimit / 1048576;
    console.log(`Memory: ${used.toFixed(2)}MB / ${limit.toFixed(2)}MB`);
  }
}, 10000);

// Profile with DevTools
// Chrome DevTools → Memory → Take heap snapshot
// Look for detached DOM nodes and retained objects
```

### Network Bandwidth Issues

**Symptoms:**
- High data usage
- Slow update propagation
- Network saturation

**Causes:**
1. Server not batching updates efficiently
2. Sending full order books instead of deltas
3. Polling interval too short
4. Publishing updates too frequently

**Solutions:**

```typescript
// Increase polling interval
manager.setPollingInterval(10000); // 10 seconds

// Increase server batch interval
const server = new RealtimeMarketServer({
  batchInterval: 500, // 500ms instead of 100ms
});

// Disable unnecessary channels
manager.on('connection:open', () => {
  // Only subscribe to what you need
  manager.subscribeToMarket('BTC');
  // Don't subscribe to orderbook if only need price
});

// Monitor data transfer
let bytesReceived = 0;
const originalHandler = manager.on('market:update', (update) => {
  bytesReceived += JSON.stringify(update).length;
});

setInterval(() => {
  const kbPerSecond = (bytesReceived / 1024) / 60;
  console.log(`Data rate: ${kbPerSecond.toFixed(2)} KB/min`);
  bytesReceived = 0;
}, 60000);
```

## Browser-Specific Issues

### WebSocket Not Supported

**Symptoms:**
- `WebSocket is not defined` error
- Works on Chrome/Firefox, not on IE11
- Mobile browser issues

**Solutions:**

```typescript
// Check WebSocket support
if (!window.WebSocket) {
  console.warn('WebSocket not supported, using polling only');
  const manager = new RealtimeDataManager({
    wsEnabled: false,
    pollingEnabled: true,
  });
}

// Polyfill for older browsers
import 'core-js/features/typed-array';

// Use feature detection
const supportsWebSocket = () => {
  try {
    new WebSocket('ws://localhost:1'); // Dummy connection
    return true;
  } catch (e) {
    return false;
  }
};
```

### Mixed Content Error (HTTPS)

**Symptoms:**
- `Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure WebSocket connection`

**Solutions:**

```typescript
// Use secure WebSocket URL
const manager = new RealtimeDataManager({
  wsUrl: 'wss://api.example.com/markets', // wss:// not ws://
});

// Environment-specific configuration
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const manager = new RealtimeDataManager({
  wsUrl: `${protocol}//api.example.com/markets`,
});
```

## Debug Logging

### Enable Verbose Logging

```typescript
// Create logging wrapper
class LoggingManager extends RealtimeDataManager {
  start() {
    console.log('Manager starting...');
    return super.start();
  }

  subscribeToMarket(marketId: string) {
    console.log(`Subscribing to ${marketId}`);
    return super.subscribeToMarket(marketId);
  }

  on(event, handler) {
    const wrappedHandler = (...args) => {
      console.log(`Event: ${event}`, args);
      return handler(...args);
    };
    return super.on(event, wrappedHandler);
  }
}
```

### Network Inspection

```typescript
// Monitor WebSocket frames
const originalWS = window.WebSocket;
window.WebSocket = class extends originalWS {
  constructor(url) {
    super(url);
    console.log('WebSocket created:', url);

    const originalSend = this.send;
    this.send = function (data) {
      console.log('Sending:', data);
      return originalSend.call(this, data);
    };

    this.addEventListener('message', (event) => {
      console.log('Received:', event.data);
    });
  }
};
```

## Testing

### Local Testing Checklist

- [ ] WebSocket server running and accessible
- [ ] Correct WebSocket URL in client config
- [ ] Subscriptions are case-sensitive and correct
- [ ] Updates actually being broadcast by server
- [ ] Client event handlers registered before subscription
- [ ] Network bridge between client and server (same network)
- [ ] Firewall not blocking port 8080 (or configured port)
- [ ] No CORS issues if cross-origin

### Debugging Checklist

- [ ] Check browser console for errors
- [ ] Monitor network tab in DevTools
- [ ] Check WebSocket frames (Raw tab)
- [ ] Verify server logs
- [ ] Monitor CPU and memory usage
- [ ] Check sequence numbers for gaps
- [ ] Verify timestamps are recent
- [ ] Test with polling-only mode
- [ ] Test with WebSocket-only mode
- [ ] Test from different network/device
