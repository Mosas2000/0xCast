# Oracle Network API Integration Guide

## Quick Start

### Import Oracle Module

```typescript
import {
  OracleNetworkService,
  useOraclePriceAggregation,
  PriceAggregationCard,
  PriceFormatter,
} from '@/oracle';
```

### Initialize Oracle Network

```typescript
import { OracleNetworkService } from '@/oracle';

async function initializeOracle() {
  try {
    await OracleNetworkService.initialize();
    console.log('Oracle network ready');
  } catch (error) {
    console.error('Failed to initialize oracle:', error);
  }
}

initializeOracle();
```

## Basic Usage

### Get Aggregated Price

```typescript
const price = await OracleNetworkService.fetchPrice('STX/USD');

if (price) {
  console.log(`Price: ${price.value}`);
  console.log(`Consensus: ${price.consensusReached}`);
  console.log(`Confidence: ${price.confidence}`);
}
```

### React Component Usage

```typescript
function PriceDisplay() {
  const { aggregatedPrice, loading, error } = useOraclePriceAggregation('STX/USD');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!aggregatedPrice) return <div>No price data</div>;

  return (
    <div>
      <h2>{PriceFormatter.formatPriceWithSymbol(aggregatedPrice.value)}</h2>
      <p>Status: {aggregatedPrice.consensusReached ? 'Consensus' : 'No Consensus'}</p>
    </div>
  );
}
```

## Advanced Features

### Price Aggregation with Custom Weights

```typescript
const prices = [
  { value: 100, timestamp: Date.now(), source: 'provider1', confidence: 0.95 },
  { value: 101, timestamp: Date.now(), source: 'provider2', confidence: 0.90 },
  { value: 99.5, timestamp: Date.now(), source: 'provider3', confidence: 0.85 },
];

const weights = [1.0, 0.8, 0.7];
const aggregated = await OracleNetworkService.aggregatePrices('STX/USD', prices, weights);
```

### Consensus Validation

```typescript
const { isConsensus, agreementPercentage, agreedPrices } = 
  ConsensusMechanismService.validateConsensus(prices, 0.66);

if (isConsensus) {
  console.log(`${agreementPercentage * 100}% of providers agree`);
} else {
  console.log('Consensus failed, switching to fallback');
}
```

### Fallback Resolution

```typescript
const fallbackPrice = FallbackResolutionService.resolveFallback(
  'STX/USD',
  'weighted_history'
);

if (fallbackPrice) {
  console.log(`Using fallback price: ${fallbackPrice}`);
}
```

### Provider Health Monitoring

```typescript
const health = await OracleNetworkService.getProviderStats();

health.forEach(provider => {
  console.log(`${provider.id}:`);
  console.log(`  - Success Rate: ${provider.successRate * 100}%`);
  console.log(`  - Uptime: ${provider.uptime * 100}%`);
  console.log(`  - Health Score: ${provider.healthScore}`);
});
```

### Price History Analysis

```typescript
const history = priceHistory; // Array of OraclePrice[]

const analysis = PriceHistoryAnalyzer.generateAnalysis(history);
console.log(`Current: ${analysis.current}`);
console.log(`High: ${analysis.high}`);
console.log(`Low: ${analysis.low}`);
console.log(`Volatility: ${analysis.volatility}`);
console.log(`Trend: ${analysis.trend}`);
```

### Technical Indicators

```typescript
const rsi = PriceHistoryAnalyzer.calculateRSI(prices, 14);
const macd = PriceHistoryAnalyzer.calculateMACD(prices);
const bands = PriceHistoryAnalyzer.calculateBollingerBands(prices, 20, 2);

console.log(`RSI: ${rsi}`);
console.log(`MACD: ${macd.macd}`);
console.log(`Bollinger Bands: ${bands.lower} - ${bands.upper}`);
```

### Price Prediction

```typescript
const prediction = PriceHistoryAnalyzer.predictNextPrice(prices);

console.log(`Predicted next price: ${prediction.predicted}`);
console.log(`Confidence: ${prediction.confidence}`);
console.log(`Method: ${prediction.method}`);
```

## Error Handling

```typescript
import { ErrorHandler, TimeoutError, NetworkError } from '@/oracle';

try {
  const price = await OracleNetworkService.fetchPrice('STX/USD');
} catch (error) {
  const handled = ErrorHandler.handle(error);
  
  if (handled instanceof TimeoutError) {
    console.log('Request timed out, retrying...');
  } else if (handled instanceof NetworkError) {
    console.log('Network error, using fallback');
  } else {
    console.log('Unknown error:', handled.message);
  }
}
```

## Configuration

```typescript
import { OracleConfigBuilder } from '@/oracle';

const config = new OracleConfigBuilder()
  .setConsensusThreshold(0.75)
  .setConsensusMinProviders(3)
  .enableFallback()
  .setFallbackMaxAge(3600000)
  .setMonitoringRefreshInterval(5000)
  .setCacheTTL(60000)
  .setRateLimit(100, 60000)
  .build();

// Use custom config when initializing
await OracleNetworkService.initialize(config);
```

## UI Components

### Display Aggregated Price

```typescript
import { PriceAggregationCard } from '@/oracle';

<PriceAggregationCard
  marketId="STX/USD"
  refreshInterval={5000}
  showSources={true}
  onPriceUpdate={(price) => console.log('Price updated:', price)}
/>
```

### Show Network Status

```typescript
import { OracleNetworkStatus } from '@/oracle';

<OracleNetworkStatus refreshInterval={10000} />
```

### Display Health Dashboard

```typescript
import { OracleHealthDashboard } from '@/oracle';

<OracleHealthDashboard
  refreshInterval={5000}
  showChart={true}
  onHealthChange={(health) => console.log('Health updated:', health)}
/>
```

### Provider Comparison

```typescript
import { ProviderComparisonView } from '@/oracle';

<ProviderComparisonView
  refreshInterval={10000}
  sortBy="health"
/>
```

## Advanced Hooks

### Monitor Price Trends

```typescript
import { usePriceTrend, usePriceHistory } from '@/oracle';

function TrendMonitor({ marketId }) {
  const { history } = usePriceHistory(marketId);
  const trend = usePriceTrend(history);

  return (
    <div>
      <p>Trend: {trend?.direction}</p>
      <p>Strength: {trend?.strength}</p>
      <p>Confidence: {trend?.confidence}</p>
    </div>
  );
}
```

### Price Volatility Monitoring

```typescript
import { usePriceVolatility } from '@/oracle';

function VolatilityMonitor({ prices }) {
  const volatility = usePriceVolatility(prices, 20);

  const getLevel = () => {
    if (!volatility) return 'unknown';
    return volatility.level;
  };

  return <div>Volatility Level: {getLevel()}</div>;
}
```

### Health Alerts

```typescript
import { useOracleHealthAlert } from '@/oracle';

function HealthAlerts() {
  const alert = useOracleHealthAlert(0.7, 5000);

  if (!alert) return null;

  return (
    <div className={`alert alert-${alert.severity}`}>
      {alert.message}
    </div>
  );
}
```

## Performance Tips

1. **Minimize Refresh Intervals**: Balance real-time data with API rate limits
2. **Use Caching**: Enable price caching to reduce API calls
3. **Batch Requests**: Request multiple prices in a single call
4. **Lazy Load**: Only initialize oracle when price data is needed
5. **Monitor Health**: Regularly check provider health to avoid slow providers

```typescript
// Good: Cache prices for 1 minute
const config = new OracleConfigBuilder()
  .setCacheTTL(60000)
  .build();

// Good: Higher refresh interval to reduce load
<PriceAggregationCard marketId="STX/USD" refreshInterval={10000} />

// Bad: Very frequent refreshes
<PriceAggregationCard marketId="STX/USD" refreshInterval={1000} />
```

## Testing

```typescript
import { describe, it, expect } from 'vitest';
import { OracleNetworkService } from '@/oracle';

describe('Oracle API Integration', () => {
  it('should fetch prices', async () => {
    const price = await OracleNetworkService.fetchPrice('STX/USD');
    expect(price).toBeDefined();
    expect(price?.value).toBeGreaterThan(0);
  });

  it('should validate consensus', async () => {
    const prices = [
      { value: 100, timestamp: Date.now(), source: 'p1', confidence: 0.9 },
      { value: 101, timestamp: Date.now(), source: 'p2', confidence: 0.9 },
      { value: 100.5, timestamp: Date.now(), source: 'p3', confidence: 0.9 },
    ];

    const consensus = ConsensusMechanismService.validateConsensus(prices, 0.66);
    expect(consensus.isConsensus).toBe(true);
  });
});
```

## Common Patterns

### Market Price Widget

```typescript
function MarketPrice({ marketId }) {
  const { aggregatedPrice, loading } = useOraclePriceAggregation(marketId);

  if (loading) return <span>...</span>;

  return (
    <div className="market-price">
      <span className="price">{aggregatedPrice?.value}</span>
      <span className="status">
        {'}aggregatedPrice?.' : 'consensusReached ? '
      </span>
    </div>
  );
}
```

### Price Comparison

```typescript
function PriceComparison() {
  const stxPrice = useOraclePriceAggregation('STX/USD');
  const btcPrice = useOraclePriceAggregation('BTC/USD');
  const ethPrice = useOraclePriceAggregation('ETH/USD');

  return (
    <div className="comparison">
      <PriceRow name="STX" price={stxPrice.aggregatedPrice} />
      <PriceRow name="BTC" price={btcPrice.aggregatedPrice} />
      <PriceRow name="ETH" price={ethPrice.aggregatedPrice} />
    </div>
  );
}
```

### Real-time Dashboard

```typescript
function Dashboard() {
  return (
    <div className="dashboard">
      <OracleNetworkStatus />
      <OracleHealthDashboard />
      <ProviderComparisonView />
      <PriceAggregationCard marketId="STX/USD" />
    </div>
  );
}
```

## Troubleshooting

### Prices Not Updating

```typescript
// Check if oracle is initialized
const stats = await OracleNetworkService.getNetworkStats();
console.log('Network health:', stats.networkHealth);

// Verify provider status
const providers = await OracleNetworkService.getProviderStats();
console.log('Active providers:', providers.filter(p => p.successRate > 0).length);
```

### Consensus Not Reached

```typescript
// Check price agreement
const consensus = ConsensusMechanismService.validateConsensus(prices, 0.66);
console.log('Agreement percentage:', consensus.agreementPercentage);

// Use fallback
const fallback = FallbackResolutionService.resolveFallback('STX/USD', 'last_known');
console.log('Fallback price:', fallback);
```

### High Latency

```typescript
// Check provider latencies
const providers = await OracleNetworkService.getProviderStats();
providers.forEach(p => {
  console.log(`${p.id}: ${p.averageLatency}ms`);
});

// Increase timeout in config
const config = new OracleConfigBuilder()
  .build();
// Update provider timeout in config
```

## Migration from Old Oracle

If migrating from previous oracle implementation:

1. Replace `oracleHelpers` imports with `PriceFormatter`
2. Replace `oracleConstants` with `OracleConfigBuilder`
3. Update service calls to use new `OracleNetworkService`
4. Update React components to use new hooks
5. Test all affected features
