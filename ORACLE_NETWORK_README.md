# Oracle Network System

A decentralized oracle network with fallback mechanisms for the 0xCast prediction market platform.

## Overview

The Oracle Network System provides a robust, resilient, and secure mechanism for obtaining price data from multiple oracle providers. It includes consensus validation, automatic failover, health monitoring, and multiple fallback strategies.

## Key Features

- **Multiple Oracle Providers**: Support for unlimited oracle providers with priority-based selection
- **Consensus Mechanism**: Validates agreement among providers before accepting prices
- **Fallback Strategies**: Four different fallback mechanisms for high availability
- **Price Aggregation**: Ten different algorithms for combining prices
- **Health Monitoring**: Real-time tracking of provider health and performance
- **Automatic Failover**: Unhealthy providers are automatically disabled
- **Price Manipulation Detection**: Statistical analysis to detect anomalies
- **Network Resilience**: Metrics for redundancy, diversification, and reliability

## Quick Start

### Installation

```bash
npm install
```

### Basic Usage

```typescript
import { OracleNetworkCoordinator } from '@/services/OracleNetworkCoordinator';

const coordinator = new OracleNetworkCoordinator({
  enableAutoFailover: true,
  enableHealthMonitoring: true,
  consensusValidation: true,
  fallbackEnabled: true,
});

const providers = [
  {
    id: 'chainlink-btc',
    name: 'Chainlink BTC/USD',
    url: 'https://api.chainlink.com/btc-usd',
    enabled: true,
    priority: 100,
    healthScore: 100,
    errorCount: 0,
    successCount: 0,
  },
];

const config = {
  consensusThreshold: 0.66,
  minimumActiveProviders: 2,
  aggregationMethod: 'median',
  updateInterval: 60000,
  fallbackStrategy: {
    enabled: true,
    type: 'cross_provider',
    maxAge: 3600000,
    minimumConfidence: 0.5,
  },
  timeout: 5000,
  maxRetries: 3,
};

await coordinator.initialize(providers, config);

const price = await coordinator.fetchAggregatedPrice('market-123');
console.log(`Price: $${price.value}`);
```

## Architecture

### Services

- **OracleNetworkCoordinator**: Main coordinator for all operations
- **OracleNetworkService**: Core oracle network functionality
- **OracleProviderManager**: Provider registration and health tracking
- **OracleConsensusValidator**: Consensus validation and anomaly detection
- **OracleMonitoringService**: Health monitoring and alerting
- **PriceAggregationAlgorithms**: Multiple aggregation methods

### Smart Contracts

- **oracle-integration.clar**: Enhanced with multi-provider support and consensus

### UI Components

- **OracleNetworkDashboard**: Real-time network monitoring
- **OracleProviderConfig**: Provider configuration interface

## Consensus Mechanism

The system validates consensus through:

1. **Price Collection**: Fetch prices from all healthy providers
2. **Outlier Detection**: Identify and flag statistical outliers
3. **Agreement Calculation**: Determine percentage of agreeing providers
4. **Threshold Validation**: Check if agreement meets threshold
5. **Confidence Scoring**: Calculate overall confidence level

Consensus levels:
- **Strong**: ≥66% agreement (default threshold)
- **Moderate**: ≥50% agreement
- **Weak**: >0% agreement
- **None**: No agreement

## Fallback Strategies

When consensus fails, the system tries fallback strategies in order:

1. **Cross Provider**: Consensus from historical data across providers
2. **Weighted History**: Weighted average of recent historical prices
3. **Median History**: Median of recent historical prices
4. **Last Known**: Most recent reliable price

Each strategy has configurable:
- Maximum age of historical data
- Minimum confidence threshold

## Price Aggregation

Ten algorithms are available:

1. **Median**: Resistant to outliers, good for general use
2. **Weighted Average**: Uses confidence scores, good when confidence varies
3. **Trimmed Mean**: Removes extremes, good for noisy data
4. **Volume Weighted**: Considers trading volume
5. **Exponential Moving Average**: Time-decayed average
6. **Outlier Resistant**: Filters statistical outliers
7. **Time Weighted**: Recent prices weighted higher
8. **Adaptive**: Automatically selects best method
9. **Consensus**: Only uses agreeing providers
10. **Auto Select**: Analyzes data and chooses optimal method

## Health Monitoring

Each provider is monitored for:

- **Health Score**: 0-100 based on success rate and latency
- **Success Rate**: Percentage of successful requests
- **Error Rate**: Percentage of failed requests
- **Average Latency**: Mean response time
- **Uptime**: Overall availability percentage
- **Consecutive Failures**: Count of sequential failures

Providers are automatically disabled after 5 consecutive failures.

## Network Resilience

The system calculates resilience based on:

- **Redundancy**: Percentage of active providers
- **Diversification**: Number of unique provider endpoints
- **Reliability**: Average provider success rate

Overall resilience score combines these metrics.

## Configuration

### Coordinator Config

```typescript
{
  enableAutoFailover: boolean;      // Auto-disable unhealthy providers
  enableHealthMonitoring: boolean;  // Track provider health
  healthCheckInterval: number;      // Health check frequency (ms)
  providerRotationInterval: number; // Rotation frequency (ms)
  consensusValidation: boolean;     // Validate consensus
  fallbackEnabled: boolean;         // Enable fallback strategies
}
```

### Oracle Config

```typescript
{
  consensusThreshold: number;       // Agreement threshold (0-1)
  minimumActiveProviders: number;   // Minimum healthy providers
  aggregationMethod: string;        // Default aggregation method
  updateInterval: number;           // Update frequency (ms)
  fallbackStrategy: {
    enabled: boolean;
    type: string;                   // Fallback strategy type
    maxAge: number;                 // Max age of historical data (ms)
    minimumConfidence: number;      // Min confidence threshold (0-1)
  };
  timeout: number;                  // Request timeout (ms)
  maxRetries: number;               // Max retry attempts
}
```

## Testing

Run the test suite:

```bash
npm test OracleNetworkCoordinator
npm test OracleConsensusValidator
npm test PriceAggregationAlgorithms
```

## Documentation

- [Implementation Guide](./ORACLE_NETWORK_IMPLEMENTATION.md)
- [API Reference](./ORACLE_NETWORK_API.md)
- [Changelog](./ORACLE_NETWORK_CHANGELOG.md)
- [Usage Examples](./frontend/src/examples/oracleNetworkExample.ts)
- [Contract Examples](./contracts/examples/oracle-network-usage.clar)

## Security

The system includes multiple security features:

- **Price Manipulation Detection**: Statistical analysis of price deviations
- **Outlier Filtering**: Automatic removal of suspicious prices
- **Consensus Validation**: Requires agreement among providers
- **Provider Diversity**: Encourages multiple independent sources
- **Historical Validation**: Checks price movements against history
- **Confidence Scoring**: Each price includes reliability metric

## Performance

- Parallel fetching from multiple providers
- Configurable timeouts and retries
- Efficient health score calculation
- Automatic cleanup of stale data
- Minimal memory footprint

## Monitoring

The system generates alerts for:

- Low provider health scores
- High error rates
- Consensus failures
- Fallback activations
- Provider failovers
- Network resilience issues

Access alerts:

```typescript
import { OracleMonitoringService } from '@/services/OracleMonitoringService';

const alerts = OracleMonitoringService.getActiveAlerts();
```

## UI Integration

### Dashboard

```typescript
import { OracleNetworkDashboard } from '@/components/OracleNetworkDashboard';

<OracleNetworkDashboard coordinator={coordinator} />
```

### Provider Config

```typescript
import { OracleProviderConfig } from '@/components/OracleProviderConfig';

<OracleProviderConfig
  providers={providers}
  onAddProvider={handleAdd}
  onUpdateProvider={handleUpdate}
  onRemoveProvider={handleRemove}
/>
```

## Contract Integration

### Register Providers

```clarity
(contract-call? .oracle-integration register-oracle-provider
  oracle-principal
  "Provider Name"
  "https://api.example.com"
  u100)
```

### Submit Prices

```clarity
(contract-call? .oracle-integration submit-price-for-consensus
  market-id
  price)
```

### Check Consensus

```clarity
(contract-call? .oracle-integration get-consensus-state market-id)
```

## Troubleshooting

### No Providers Available

Ensure at least 2 providers are registered and enabled.

### Consensus Not Reached

Check if providers are returning similar prices. Adjust consensus threshold if needed.

### High Latency

Increase timeout or disable slow providers.

### Frequent Failovers

Check provider health and network connectivity.

## Contributing

Contributions are welcome. Please ensure:

- All tests pass
- Code follows project style
- Documentation is updated
- Commits are descriptive

## License

See project LICENSE file.

## Support

For issues or questions, please open a GitHub issue.
