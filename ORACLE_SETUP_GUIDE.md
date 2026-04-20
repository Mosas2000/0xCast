# Oracle Network Setup Guide

## Installation & Setup

### Step 1: Initialize Oracle Network

Add to your application's main entry point (e.g., App.tsx or main.ts):

```typescript
import { OracleNetworkService } from '@/oracle';

async function setupOracle() {
  try {
    await OracleNetworkService.initialize();
    console. Oracle network initialized successfully');log('
  } catch (error) {
    console. Failed to initialize oracle network:', error);error('
  }
}

setupOracle();
```

### Step 2: Configure Oracle (Optional)

For custom configuration:

```typescript
import { OracleConfigBuilder } from '@/oracle';
import { OracleNetworkService } from '@/oracle';

const config = new OracleConfigBuilder()
  .setConsensusThreshold(0.75)
  .setConsensusMinProviders(3)
  .enableFallback()
  .setFallbackMaxAge(3600000)
  .enableMonitoring()
  .setMonitoringRefreshInterval(5000)
  .enableCache()
  .setCacheTTL(60000)
  .setRateLimit(100, 60000)
  .build();

await OracleNetworkService.initialize(config);
```

## Component Integration

### Basic Price Display

```typescript
import { PriceAggregationCard } from '@/oracle';

function MarketView() {
  return (
    <PriceAggregationCard
      marketId="STX/USD"
      refreshInterval={5000}
      showSources={true}
    />
  );
}
```

### Dashboard Setup

```typescript
import {
  OracleNetworkStatus,
  OracleHealthDashboard,
  ProviderComparisonView,
} from '@/oracle';

function OracleDashboard() {
  return (
    <div className="space-y-6">
      <OracleNetworkStatus refreshInterval={10000} />
      <OracleHealthDashboard refreshInterval={5000} />
      <ProviderComparisonView refreshInterval={10000} />
    </div>
  );
}
```

## React Hooks Integration

### Simple Price Monitoring

```typescript
import { useOraclePriceAggregation } from '@/oracle';

function PriceMonitor({ marketId }) {
  const { aggregatedPrice, loading, error } = useOraclePriceAggregation(marketId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>Price: {aggregatedPrice?.value}</div>;
}
```

### Advanced Analysis

```typescript
import {
  usePriceHistory,
  usePriceTrend,
  usePriceVolatility,
  usePricePrediction,
} from '@/oracle';

function AdvancedAnalysis({ marketId }) {
  const { history, analysis } = usePriceHistory(marketId);
  const trend = usePriceTrend(history);
  const volatility = usePriceVolatility(history);
  const prediction = usePricePrediction(history);

  return (
    <div>
      <div>Trend: {trend?.direction}</div>
      <div>Volatility: {volatility?.level}</div>
      <div>Predicted: {prediction?.predicted}</div>
      <div>Analysis: {analysis?.trend}</div>
    </div>
  );
}
```

## Testing Setup

### Unit Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { OracleNetworkService } from '@/oracle';
import { PriceFormatter } from '@/oracle';

describe('Oracle Network', () => {
  beforeEach(async () => {
    await OracleNetworkService.initialize();
  });

  it('should fetch prices', async () => {
    const price = await OracleNetworkService.fetchPrice('STX/USD');
    expect(price).toBeDefined();
    expect(price?.value).toBeGreaterThan(0);
  });

  it('should format prices correctly', () => {
    const formatted = PriceFormatter.formatPrice(123.456789, 8);
    expect(formatted).toBe('123.45678912');
  });
});
```

### Integration Tests

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { PriceAggregationCard } from '@/oracle';

describe('PriceAggregationCard', () => {
  it('should display price', async () => {
    render(<PriceAggregationCard marketId="STX/USD" />);
    
    await waitFor(() => {
      expect(screen.getByText(/STX/)).toBeInTheDocument();
    });
  });
});
```

## Troubleshooting

### Oracle Not Initializing

1. Check network connectivity
2. Verify provider endpoints are accessible
3. Check browser console for errors
4. Verify no firewall/proxy blocking requests

```typescript
// Diagnose oracle initialization
async function diagnoseOracle() {
  try {
    const stats = await OracleNetworkService.getNetworkStats();
    console.log('Network health:', stats.networkHealth);

    const providers = await OracleNetworkService.getProviderStats();
    console.log('Providers:', providers.map(p => ({
      id: p.id,
      health: p.healthScore,
      success: p.successRate,
    })));
  } catch (error) {
    console.error('Diagnostic failed:', error);
  }
}
```

### Prices Not Updating

```typescript
// Check if prices are being updated
async function checkPriceUpdates() {
  const history: any[] = [];

  for (let i = 0; i < 5; i++) {
    const price = await OracleNetworkService.fetchPrice('STX/USD');
    history.push(price?.value);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('Price history:', history);
  console.log('Prices updating:', new Set(history).size > 1);
}
```

## Performance Optimization

### Reduce API Calls

```typescript
// Enable caching
const config = new OracleConfigBuilder()
  .enableCache()
  .setCacheTTL(120000) // 2 minutes
  .build();

await OracleNetworkService.initialize(config);
```

### Monitor Provider Performance

```typescript
// Monitor and disable slow providers
async function monitorProviders() {
  const providers = await OracleNetworkService.getProviderStats();

  providers.forEach(provider => {
    if (provider.averageLatency > 3000) {
      console.warn(`Provider ${provider.id} is slow: ${provider.averageLatency}ms`);
    }
    if (provider.successRate < 0.8) {
      console.warn(`Provider ${provider.id} has low success rate: ${provider.successRate}`);
    }
  });
}
```

## Deployment Checklist

- [ ] Oracle network initialized in app entry point
- [ ] Error handling implemented for price fetches
- [ ] Fallback prices configured
- [ ] Provider health monitoring enabled
- [ ] Cache TTL set appropriately
- [ ] Rate limiting configured
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Environment variables configured (if needed)
- [ ] Performance tested with expected load

## Configuration Examples

### Development

```typescript
const devConfig = new OracleConfigBuilder()
  .setConsensusThreshold(0.66)
  .setConsensusMinProviders(2)
  .enableFallback()
  .enableMonitoring()
  .setCacheTTL(30000)
  .setMonitoringRefreshInterval(10000)
  .build();
```

### Production

```typescript
const prodConfig = new OracleConfigBuilder()
  .setConsensusThreshold(0.75)
  .setConsensusMinProviders(4)
  .enableFallback()
  .enableMonitoring()
  .setCacheTTL(300000)
  .setMonitoringRefreshInterval(60000)
  .setRateLimit(50, 60000)
  .build();
```

## Health Check Script

Add to your monitoring/health check endpoint:

```typescript
async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  details: any;
}> {
  try {
    const stats = await OracleNetworkService.getNetworkStats();
    const providers = await OracleNetworkService.getProviderStats();

    const healthyProviders = providers.filter(p => p.healthScore >= 0.8).length;

    if (stats.networkHealth < 0.5) {
      return {
        status: 'unhealthy',
        message: 'Oracle network unhealthy',
        details: { networkHealth: stats.networkHealth },
      };
    }

    if (healthyProviders < providers.length / 2) {
      return {
        status: 'degraded',
        message: 'Multiple providers unhealthy',
        details: {
          healthyProviders,
          totalProviders: providers.length,
        },
      };
    }

    return {
      status: 'healthy',
      message: 'Oracle network operational',
      details: { networkHealth: stats.networkHealth, healthyProviders },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: 'Health check failed',
      details: { error: String(error) },
    };
  }
}
```

## Next Steps

1. Review [Oracle API Integration Guide](./ORACLE_API_INTEGRATION.md)
2. Check [Oracle Implementation Guide](./ORACLE_IMPLEMENTATION_GUIDE.md)
3. Run test suite: `npm run test:oracle`
4. Monitor health dashboard
5. Adjust configuration as needed

## Support

For issues or questions:
1. Check error logs
2. Review troubleshooting section
3. Consult documentation
4. Open GitHub issue with details
