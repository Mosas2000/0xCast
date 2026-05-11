# Oracle Network API Reference

## OracleNetworkCoordinator

Main coordinator for oracle network operations.

### Constructor

```typescript
new OracleNetworkCoordinator(config?: Partial<CoordinatorConfig>)
```

**Parameters:**
- `config.enableAutoFailover` (boolean): Enable automatic provider failover
- `config.enableHealthMonitoring` (boolean): Enable health monitoring
- `config.healthCheckInterval` (number): Health check interval in ms
- `config.providerRotationInterval` (number): Provider rotation interval in ms
- `config.consensusValidation` (boolean): Enable consensus validation
- `config.fallbackEnabled` (boolean): Enable fallback strategies

### Methods

#### initialize

```typescript
async initialize(providers: OracleProvider[], oracleConfig: OracleConfig): Promise<void>
```

Initialize the coordinator with providers and configuration.

#### fetchAggregatedPrice

```typescript
async fetchAggregatedPrice(marketId: string): Promise<AggregatedPrice>
```

Fetch aggregated price from all healthy providers with consensus validation.

**Returns:** AggregatedPrice with value, confidence, and consensus status

#### fetchWithStrategy

```typescript
async fetchWithStrategy(
  marketId: string,
  strategy: 'fast' | 'reliable' | 'consensus'
): Promise<AggregatedPrice>
```

Fetch price using specific strategy:
- `fast`: Single best provider
- `reliable`: Top 3 providers
- `consensus`: All providers with validation

#### addProvider

```typescript
addProvider(provider: OracleProvider): void
```

Add new oracle provider to the network.

#### removeProvider

```typescript
removeProvider(providerId: string): void
```

Remove oracle provider from the network.

#### getNetworkStatus

```typescript
getNetworkStatus(): NetworkStatus
```

Get current network status including health metrics and resilience.

**Returns:**
```typescript
{
  totalProviders: number;
  activeProviders: number;
  healthyProviders: number;
  averageHealth: number;
  networkReliability: number;
  resilience: {
    score: number;
    redundancy: number;
    diversification: number;
    reliability: number;
  };
  activeAlerts: number;
}
```

#### getProviderStatus

```typescript
getProviderStatus(providerId: string): ProviderStatus
```

Get detailed status for specific provider.

#### testProvider

```typescript
async testProvider(providerId: string, marketId: string): Promise<TestResult>
```

Test provider connectivity and response time.

#### updateConfig

```typescript
updateConfig(config: Partial<CoordinatorConfig>): void
```

Update coordinator configuration.

#### shutdown

```typescript
shutdown(): void
```

Cleanup resources and stop monitoring.

---

## OracleNetworkService

Static service for oracle network operations.

### Methods

#### initializeProviders

```typescript
static initializeProviders(providers: OracleProvider[]): void
```

Initialize oracle providers.

#### fetchPrice

```typescript
static async fetchPrice(providerId: string, marketId: string): Promise<OraclePrice | null>
```

Fetch price from specific provider.

#### fetchPricesFromAllProviders

```typescript
static async fetchPricesFromAllProviders(marketId: string): Promise<OraclePrice[]>
```

Fetch prices from all active providers in parallel.

#### aggregatePrices

```typescript
static async aggregatePrices(marketId: string, prices: OraclePrice[]): Promise<AggregatedPrice>
```

Aggregate multiple prices using configured method.

#### calculateConsensus

```typescript
static calculateConsensus(prices: OraclePrice[]): ConsensusResult
```

Calculate consensus from multiple prices.

#### calculateWeightedConsensus

```typescript
static calculateWeightedConsensus(prices: OraclePrice[]): ConsensusResult
```

Calculate weighted consensus based on confidence.

#### getNetworkState

```typescript
static getNetworkState(): OracleNetworkState
```

Get current network state.

#### getFallbackPriceWithStrategy

```typescript
static async getFallbackPriceWithStrategy(
  marketId: string,
  strategy: 'last_known' | 'median_history' | 'weighted_history' | 'cross_provider'
): Promise<AggregatedPrice | null>
```

Get fallback price using specific strategy.

#### rotateProviders

```typescript
static rotateProviders(): void
```

Rotate providers based on health scores.

#### selectBestProvider

```typescript
static selectBestProvider(): OracleProvider | null
```

Select best provider based on health and priority.

---

## OracleProviderManager

Manages oracle provider registration and health.

### Methods

#### registerProvider

```typescript
registerProvider(provider: OracleProvider): void
```

Register new provider.

#### unregisterProvider

```typescript
unregisterProvider(providerId: string): boolean
```

Unregister provider.

#### getHealthyProviders

```typescript
getHealthyProviders(minHealthScore?: number): OracleProvider[]
```

Get providers with health score above threshold.

#### recordSuccess

```typescript
recordSuccess(providerId: string, latency: number): void
```

Record successful provider response.

#### recordFailure

```typescript
recordFailure(providerId: string, error: string): void
```

Record provider failure.

#### getHealthMetrics

```typescript
getHealthMetrics(providerId: string): ProviderHealthMetrics | undefined
```

Get health metrics for provider.

#### getPerformanceStats

```typescript
getPerformanceStats(providerId: string): ProviderPerformanceStats | null
```

Get performance statistics for provider.

#### selectBestProviders

```typescript
selectBestProviders(count: number): OracleProvider[]
```

Select top N providers by health and priority.

#### getNetworkHealth

```typescript
getNetworkHealth(): NetworkHealthSummary
```

Get overall network health summary.

---

## OracleConsensusValidator

Validates consensus and detects anomalies.

### Methods

#### validateConsensus

```typescript
validateConsensus(prices: OraclePrice[], threshold?: number): ConsensusValidationResult
```

Validate consensus among prices.

**Returns:**
```typescript
{
  isValid: boolean;
  confidence: number;
  reason: string;
  outliers: string[];
  recommendation: 'accept' | 'reject' | 'retry';
}
```

#### analyzePriceDeviation

```typescript
analyzePriceDeviation(prices: OraclePrice[]): PriceDeviationAnalysis
```

Analyze statistical deviation in prices.

#### detectPriceManipulation

```typescript
detectPriceManipulation(prices: OraclePrice[]): ManipulationDetection
```

Detect potential price manipulation.

#### validatePriceMovement

```typescript
validatePriceMovement(
  currentPrice: number,
  previousPrice: number,
  maxMovement?: number
): MovementValidation
```

Validate price movement against threshold.

#### filterReliablePrices

```typescript
filterReliablePrices(prices: OraclePrice[], minConfidence?: number): OraclePrice[]
```

Filter prices by confidence and outlier status.

#### compareAggregationMethods

```typescript
compareAggregationMethods(prices: OraclePrice[]): MethodComparison
```

Compare different aggregation methods.

#### shouldUseFallback

```typescript
shouldUseFallback(
  prices: OraclePrice[],
  minProviders?: number,
  minConfidence?: number
): boolean
```

Determine if fallback should be used.

---

## PriceAggregationAlgorithms

Multiple price aggregation algorithms.

### Methods

#### median

```typescript
static median(prices: OraclePrice[]): AggregationResult
```

Calculate median price.

#### weightedAverage

```typescript
static weightedAverage(prices: OraclePrice[]): AggregationResult
```

Calculate confidence-weighted average.

#### trimmedMean

```typescript
static trimmedMean(prices: OraclePrice[], trimPercentage?: number): AggregationResult
```

Calculate mean after trimming extremes.

#### volumeWeighted

```typescript
static volumeWeighted(prices: OraclePrice[], volumes: number[]): AggregationResult
```

Calculate volume-weighted price.

#### exponentialMovingAverage

```typescript
static exponentialMovingAverage(prices: OraclePrice[], alpha?: number): AggregationResult
```

Calculate exponential moving average.

#### outlierResistant

```typescript
static outlierResistant(prices: OraclePrice[], threshold?: number): AggregationResult
```

Calculate mean after removing outliers.

#### timeWeighted

```typescript
static timeWeighted(prices: OraclePrice[], decayFactor?: number): AggregationResult
```

Calculate time-weighted average with decay.

#### adaptive

```typescript
static adaptive(prices: OraclePrice[]): AggregationResult
```

Automatically select best method based on data characteristics.

#### consensus

```typescript
static consensus(prices: OraclePrice[], tolerance?: number): AggregationResult
```

Calculate price from agreeing providers only.

#### selectBestMethod

```typescript
static selectBestMethod(prices: OraclePrice[]): AggregationResult
```

Automatically select and apply best aggregation method.

---

## OracleMonitoringService

Monitors oracle network health and generates alerts.

### Methods

#### recordUpdate

```typescript
static recordUpdate(
  providerId: string,
  success: boolean,
  latency: number,
  error?: string
): void
```

Record provider update result.

#### getMetrics

```typescript
static getMetrics(providerId: string): OracleMetrics | null
```

Get metrics for provider.

#### checkHealthThresholds

```typescript
static checkHealthThresholds(provider: OracleProvider): void
```

Check provider against health thresholds.

#### getActiveAlerts

```typescript
static getActiveAlerts(): MonitoringAlert[]
```

Get all active alerts.

#### trackConsensusFailure

```typescript
static trackConsensusFailure(marketId: string, reason: string): void
```

Track consensus failure event.

#### trackFallbackActivation

```typescript
static trackFallbackActivation(marketId: string, strategy: string): void
```

Track fallback activation event.

#### getNetworkResilience

```typescript
static getNetworkResilience(providers: OracleProvider[]): ResilienceMetrics
```

Calculate network resilience metrics.

#### generateReport

```typescript
static generateReport(providers: OracleProvider[]): NetworkReport
```

Generate comprehensive network report.

---

## Types

### OracleProvider

```typescript
interface OracleProvider {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  priority: number;
  healthScore: number;
  errorCount: number;
  successCount: number;
  lastUpdate?: number;
  lastError?: string;
}
```

### OraclePrice

```typescript
interface OraclePrice {
  value: number;
  timestamp: number;
  source: string;
  confidence: number;
}
```

### AggregatedPrice

```typescript
interface AggregatedPrice {
  value: number;
  timestamp: number;
  sources: OraclePrice[];
  confidence: number;
  consensusReached: boolean;
  method: string;
}
```

### ConsensusResult

```typescript
interface ConsensusResult {
  price: number;
  confidence: number;
  agreeingProviders: string[];
  dissagreeingProviders: string[];
  consensusLevel: 'strong' | 'moderate' | 'weak' | 'none';
}
```

### OracleConfig

```typescript
interface OracleConfig {
  consensusThreshold: number;
  minimumActiveProviders: number;
  aggregationMethod: 'median' | 'weighted_average';
  updateInterval: number;
  fallbackStrategy: FallbackStrategy;
  timeout: number;
  maxRetries: number;
}
```

### FallbackStrategy

```typescript
interface FallbackStrategy {
  enabled: boolean;
  type: 'last_known' | 'median_history' | 'weighted_history';
  maxAge: number;
  minimumConfidence: number;
}
```

---

## Error Handling

All async methods may throw errors. Wrap calls in try-catch blocks:

```typescript
try {
  const price = await coordinator.fetchAggregatedPrice('market-123');
} catch (error) {
  console.error('Failed to fetch price:', error);
}
```

## Events

The monitoring service supports event callbacks:

```typescript
const unsubscribe = OracleMonitoringService.onAlert((alert) => {
  console.log('Alert:', alert);
});

unsubscribe();
```
