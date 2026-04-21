# WebSocket API Reference

## Type Definitions

### MarketUpdate

```typescript
interface MarketUpdate {
  sequence: number;
  marketId: string;
  price: number;
  bid?: number;
  ask?: number;
  volume: number;
  change: number;
  changePercent: number;
  timestamp: number;
}
```

Market price and trading data update.

**Fields:**
- `sequence`: Update sequence number for ordering
- `marketId`: Market identifier (e.g., "BTC", "ETH")
- `price`: Current market price
- `bid`: Best bid price (optional)
- `ask`: Best ask price (optional)
- `volume`: 24-hour trading volume
- `change`: Price change since open
- `changePercent`: Percentage change since open
- `timestamp`: Update timestamp in milliseconds

### OrderBookUpdate

```typescript
interface OrderBookUpdate {
  sequence: number;
  marketId: string;
  bids: OrderLevel[];
  asks: OrderLevel[];
  timestamp: number;
}

interface OrderLevel {
  price: number;
  amount: number;
}
```

Order book snapshot with bid and ask levels.

**Fields:**
- `sequence`: Update sequence for ordering
- `marketId`: Market identifier
- `bids`: Array of bid price levels
- `asks`: Array of ask price levels
- `timestamp`: Update timestamp

### TradeUpdate

```typescript
interface TradeUpdate {
  sequence: number;
  marketId: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  timestamp: number;
}
```

Individual trade execution.

**Fields:**
- `sequence`: Trade sequence number
- `marketId`: Market identifier
- `price`: Trade price
- `amount`: Trade amount
- `side`: Trade side (buy or sell)
- `timestamp`: Trade timestamp

### WebSocketMessage

```typescript
type WebSocketMessage = 
  | MarketUpdate 
  | OrderBookUpdate 
  | TradeUpdate
  | { type: 'ping'; timestamp: number }
  | { type: 'pong'; timestamp: number }
  | { type: 'subscribe'; channels: string[] }
  | { type: 'unsubscribe'; channels: string[] };
```

All possible WebSocket message types.

## Services

### RealtimeMarketClient

Client-side WebSocket connection manager.

#### Constructor

```typescript
new RealtimeMarketClient(config: {
  url: string;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  autoSubscribe?: string[];
});
```

**Options:**
- `url`: WebSocket server URL
- `maxReconnectAttempts`: Maximum reconnection attempts (default: 10)
- `heartbeatInterval`: Ping interval in ms (default: 30000)
- `autoSubscribe`: Channels to subscribe after connect

#### Methods

##### connect()

```typescript
async connect(): Promise<void>
```

Connect to WebSocket server.

##### disconnect()

```typescript
disconnect(): void
```

Close WebSocket connection.

##### subscribe(channels: string[])

```typescript
subscribe(channels: string[]): void
```

Subscribe to one or more channels.

**Examples:**
```typescript
client.subscribe(['market:BTC', 'orderbook:BTC']);
client.subscribe(['trade:ETH']);
```

##### unsubscribe(channels: string[])

```typescript
unsubscribe(channels: string[]): void
```

Unsubscribe from channels.

##### on(event, handler)

```typescript
on<K extends keyof WebSocketEventMap>(
  event: K,
  handler: WebSocketEventHandler<WebSocketEventMap[K]>
): void
```

Register event handler.

**Events:**
- `market:update` - Market price update
- `orderbook:update` - Order book change
- `trade:update` - New trade
- `connection:open` - Connection established
- `connection:close` - Connection closed
- `connection:error` - Connection error

##### off(event, handler)

```typescript
off<K extends keyof WebSocketEventMap>(
  event: K,
  handler: WebSocketEventHandler<WebSocketEventMap[K]>
): void
```

Unregister event handler.

##### getMarketData(marketId)

```typescript
getMarketData(marketId: string): MarketUpdate | undefined
```

Get latest market data for market.

##### isConnected()

```typescript
isConnected(): boolean
```

Check if connected to server.

### RealtimeMarketServer

Server-side WebSocket handler.

#### Constructor

```typescript
new RealtimeMarketServer(config: {
  port: number;
  batchInterval?: number;
  maxConnections?: number;
});
```

**Options:**
- `port`: WebSocket server port
- `batchInterval`: Batch update interval in ms (default: 100)
- `maxConnections`: Maximum concurrent connections (default: 1000)

#### Methods

##### start()

```typescript
start(): void
```

Start the WebSocket server.

##### stop()

```typescript
stop(): void
```

Stop the WebSocket server.

##### broadcastUpdate(update)

```typescript
broadcastUpdate(update: MarketUpdate | OrderBookUpdate | TradeUpdate): void
```

Broadcast update to all connected clients.

##### broadcastUpdates(updates)

```typescript
broadcastUpdates(updates: (MarketUpdate | OrderBookUpdate | TradeUpdate)[]): void
```

Broadcast multiple updates.

##### onConnection(handler)

```typescript
onConnection(handler: (clientId: string, subscriptions: string[]) => void): void
```

Register connection handler.

##### onDisconnection(handler)

```typescript
onDisconnection(handler: (clientId: string) => void): void
```

Register disconnection handler.

##### onSubscribe(handler)

```typescript
onSubscribe(handler: (clientId: string, channels: string[]) => void): void
```

Register subscription handler.

##### cleanupInactiveConnections()

```typescript
cleanupInactiveConnections(): void
```

Remove inactive clients (no pong response).

### MarketPollingService

HTTP polling fallback service.

#### Constructor

```typescript
new MarketPollingService(config: {
  interval: number;
  marketIds?: string[];
  enabled: boolean;
});
```

**Options:**
- `interval`: Polling interval in ms (default: 5000)
- `marketIds`: Markets to poll
- `enabled`: Start polling immediately

#### Methods

##### start()

```typescript
start(): void
```

Start polling.

##### stop()

```typescript
stop(): void
```

Stop polling.

##### addMarket(marketId)

```typescript
addMarket(marketId: string): void
```

Add market to polling list.

##### removeMarket(marketId)

```typescript
removeMarket(marketId: string): void
```

Remove market from polling list.

##### setInterval(interval)

```typescript
setInterval(interval: number): void
```

Update polling interval.

##### onUpdate(event, handler)

```typescript
onUpdate(event: string, handler: (data: any) => void): void
```

Register update handler.

##### isRunning_()

```typescript
isRunning_(): boolean
```

Check if currently polling.

### RealtimeDataManager

Unified interface for WebSocket and polling.

#### Constructor

```typescript
new RealtimeDataManager(config?: Partial<RealtimeDataManagerConfig>);
```

**Default Config:**
```typescript
{
  wsUrl: 'ws://localhost:8080/markets',
  wsEnabled: true,
  pollingEnabled: true,
  pollingInterval: 5000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000,
}
```

#### Methods

##### start()

```typescript
async start(): Promise<void>
```

Start WebSocket or polling.

##### stop()

```typescript
async stop(): Promise<void>
```

Stop all connections.

##### subscribeToMarket(marketId)

```typescript
subscribeToMarket(marketId: string): void
```

Subscribe to market updates.

##### unsubscribeFromMarket(marketId)

```typescript
unsubscribeFromMarket(marketId: string): void
```

Unsubscribe from market.

##### on(event, handler)

```typescript
on<K extends keyof WebSocketEventMap>(
  event: K,
  handler: WebSocketEventHandler<WebSocketEventMap[K]>
): void
```

Register event handler.

##### off(event, handler)

```typescript
off<K extends keyof WebSocketEventMap>(
  event: K,
  handler: WebSocketEventHandler<WebSocketEventMap[K]>
): void
```

Unregister event handler.

##### getMarketData(marketId)

```typescript
getMarketData(marketId: string): MarketUpdate | undefined
```

Get latest market data.

##### isConnected()

```typescript
isConnected(): boolean
```

Check if connected.

##### isUsingWebSocket()

```typescript
isUsingWebSocket(): boolean
```

Check if using WebSocket (false = polling).

##### getSubscribedMarkets()

```typescript
getSubscribedMarkets(): string[]
```

Get list of subscribed markets.

##### setPollingInterval(interval)

```typescript
setPollingInterval(interval: number): void
```

Update polling interval.

##### getConfiguration()

```typescript
getConfiguration(): RealtimeDataManagerConfig
```

Get current configuration.

##### updateConfiguration(config)

```typescript
updateConfiguration(config: Partial<RealtimeDataManagerConfig>): void
```

Update configuration.

## Hooks

### useRealtimeMarketData

```typescript
function useRealtimeMarketData(marketId: string): {
  marketData: MarketUpdate | null;
  isConnected: boolean;
  error: Error | null;
}
```

Subscribe to market updates.

### useRealtimeOrderBook

```typescript
function useRealtimeOrderBook(marketId: string): {
  orderBook: OrderBookUpdate | null;
  isLoading: boolean;
}
```

Subscribe to order book updates.

### useRealtimeTrades

```typescript
function useRealtimeTrades(marketId: string): {
  trades: TradeUpdate[];
}
```

Subscribe to trades.

### useRealtimeConnection

```typescript
function useRealtimeConnection(): {
  isConnected: boolean;
  useWebSocket: boolean;
  reconnectAttempts: number;
}
```

Monitor connection status.

### useRealtimeMarkets

```typescript
function useRealtimeMarkets(marketIds: string[]): {
  marketsData: Map<string, MarketUpdate>;
}
```

Subscribe to multiple markets.

### useRealtimePrice

```typescript
function useRealtimePrice(marketId: string): {
  price: number;
  change: number;
  changePercent: number;
}
```

Get price data.

### useRealtimeVolume

```typescript
function useRealtimeVolume(marketId: string): {
  volume: number;
  volumeUsd: number;
}
```

Get volume data.

## Utility Functions

### calculateSpread

```typescript
function calculateSpread(bid: number, ask: number): {
  spread: number;
  spreadPercent: number;
}
```

Calculate bid-ask spread.

### calculateMidPrice

```typescript
function calculateMidPrice(bid: number, ask: number): number
```

Calculate mid price.

### calculatePriceChange

```typescript
function calculatePriceChange(currentPrice: number, previousPrice: number): {
  change: number;
  changePercent: number;
}
```

Calculate price change.

### calculateMovingAverage

```typescript
function calculateMovingAverage(prices: number[], period: number): number[]
```

Calculate simple moving average.

### calculateRSI

```typescript
function calculateRSI(prices: number[], period?: number): number[]
```

Calculate relative strength index (default period: 14).

### MarketDataBuffer

```typescript
new MarketDataBuffer(maxSize?: number)
```

In-memory buffer for market data.

**Methods:**
- `addUpdate(marketId, update)`
- `getUpdates(marketId, from)`
- `getLatestUpdate(marketId)`
- `getSnapshot(marketId)`
- `clearBuffer(marketId)`
- `clearAll()`

### OrderBookBuffer

```typescript
new OrderBookBuffer(maxSize?: number)
```

Buffer for order book snapshots.

**Methods:**
- `addOrderBook(marketId, orderBook)`
- `getOrderBook(marketId)`
- `getOrderBookHistory(marketId, limit)`
- `clearBuffer(marketId)`
- `clearAll()`

### TradeBuffer

```typescript
new TradeBuffer(maxSize?: number)
```

Buffer for trades.

**Methods:**
- `addTrade(marketId, trade)`
- `getTrades(marketId, limit)`
- `getRecentTrades(marketId, sinceTimestamp)`
- `calculateVWAP(marketId, limit)`
- `clearBuffer(marketId)`
- `clearAll()`

## Channel Names

### Subscription Channels

- `market:{marketId}` - Market price updates
- `orderbook:{marketId}` - Order book changes
- `trade:{marketId}` - Trade updates
- `market:*` - All market updates (server only)

**Example:**
```typescript
client.subscribe([
  'market:BTC',
  'orderbook:BTC',
  'trade:BTC'
]);
```

## Error Codes

```typescript
enum ErrorCode {
  CONNECTION_FAILED = 'WS_CONN_ERR',
  INVALID_MESSAGE = 'WS_MSG_ERR',
  SUBSCRIPTION_ERROR = 'WS_SUB_ERR',
  SEQUENCE_MISMATCH = 'WS_SEQ_ERR',
  POLL_FAILED = 'POLL_ERR',
}
```

## Performance Metrics

Monitor performance with:

```typescript
manager.on('metric', (metric: {
  type: 'message_latency' | 'connection_time' | 'message_count';
  value: number;
  timestamp: number;
}) => {
  console.log(`${metric.type}: ${metric.value}ms`);
});
```
