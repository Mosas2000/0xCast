# Type Definitions

This directory contains TypeScript type definitions and interfaces used throughout the 0xCast application.

## Core Types

### market.ts

Defines types for prediction markets and related entities.

**Enums:**

- **`MarketStatus`** - Current state of a market
  - `ACTIVE = 1` - Market is accepting predictions
  - `RESOLVED = 2` - Market has been resolved with outcome
  - `DISPUTED = 3` - Market outcome is being disputed
  - `REFUNDED = 4` - Market has been refunded

- **`MarketOutcome`** - Final outcome of a resolved market
  - `NONE = 0` - No outcome yet (not resolved)
  - `YES = 1` - YES outcome won
  - `NO = 2` - NO outcome won

**Interfaces:**

- **`Market`** - Core market data structure
  ```typescript
  interface Market {
    id: string;
    title: string;
    description: string;
    creator: string;
    endTime: number;
    resolved: boolean;
    outcome?: number;
    totalVolume: number;
    currentPrice: number;
    category?: string;
  }
  ```

- **`Prediction`** - User prediction on a market
  ```typescript
  interface Prediction {
    id: string;
    marketId: string;
    userId: string;
    outcome: number;
    amount: number;
    timestamp: number;
    shares: number;
  }
  ```

- **`MarketStatistics`** - Market analytics data
  ```typescript
  interface MarketStatistics {
    poolId: string;
    reserveA: number;
    reserveB: number;
    totalLiquidity: number;
    volume24h: number;
    fees24h: number;
    apy: number;
    priceImpact: number;
  }
  ```

- **`Pool`** - Liquidity pool data
  ```typescript
  interface Pool {
    id: string;
    model: 'CONSTANT_PRODUCT' | 'STABLE_SWAP' | 'WEIGHTED';
    tokenA: string;
    tokenB: string;
    reserveA: number;
    reserveB: number;
    totalShares: number;
    fee: number;
  }
  ```

**Example Usage:**
```typescript
import { Market, MarketStatus, MarketOutcome } from '@/types/market';

const market: Market = {
  id: '1',
  title: 'Will BTC reach $100k in 2026?',
  description: 'Market resolves YES if Bitcoin reaches $100,000',
  creator: 'SP2...',
  endTime: 1735689600,
  resolved: false,
  totalVolume: 50000,
  currentPrice: 0.65,
  category: 'crypto'
};

// Check market status
if (market.resolved && market.outcome === MarketOutcome.YES) {
  console.log('Market resolved: YES won');
}
```

## User Types

### user.ts

Defines user-related types and interfaces.

**Key Types:**
- User profiles
- Authentication state
- User preferences
- Wallet connections

## Transaction Types

### transaction.ts

Defines transaction-related types.

**Key Types:**
- Transaction status
- Transaction history
- Pending transactions
- Transaction receipts

## API Types

### api.ts

Defines API request and response types.

**Key Types:**
- API endpoints
- Request payloads
- Response formats
- Error responses

## Best Practices

### Type Safety

1. **Always use defined types:**
   ```typescript
   // Good
   const status: MarketStatus = MarketStatus.ACTIVE;
   
   // Bad
   const status = 1;
   ```

2. **Use enums for fixed values:**
   ```typescript
   // Good
   if (market.outcome === MarketOutcome.YES) { }
   
   // Bad
   if (market.outcome === 1) { }
   ```

3. **Avoid `any` type:**
   ```typescript
   // Good
   const market: Market = fetchMarket();
   
   // Bad
   const market: any = fetchMarket();
   ```

### Type Guards

Create type guards for runtime type checking:

```typescript
export function isMarket(value: unknown): value is Market {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'creator' in value
  );
}

// Usage
if (isMarket(data)) {
  console.log(data.title); // TypeScript knows data is Market
}
```

### Discriminated Unions

Use discriminated unions for variant types:

```typescript
type MarketEvent =
  | { type: 'created'; market: Market }
  | { type: 'resolved'; marketId: string; outcome: MarketOutcome }
  | { type: 'disputed'; marketId: string; reason: string };

function handleEvent(event: MarketEvent) {
  switch (event.type) {
    case 'created':
      console.log('New market:', event.market.title);
      break;
    case 'resolved':
      console.log('Market resolved:', event.outcome);
      break;
    case 'disputed':
      console.log('Market disputed:', event.reason);
      break;
  }
}
```

### Generic Types

Use generics for reusable type patterns:

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Usage
const response: ApiResponse<Market> = await fetchMarket(id);
if (response.success && response.data) {
  console.log(response.data.title);
}
```

## Enum Usage Guidelines

### When to Use Enums

Use enums when:
- Values are fixed and known at compile time
- Values have semantic meaning (not just numbers)
- You need type safety and autocomplete
- Values map to contract constants

**Example:**
```typescript
// Good - semantic meaning
enum MarketStatus {
  ACTIVE = 1,
  RESOLVED = 2,
  DISPUTED = 3,
  REFUNDED = 4
}

// Bad - use union type instead
enum Colors {
  RED = 'red',
  BLUE = 'blue'
}
// Better as: type Color = 'red' | 'blue';
```

### Enum Best Practices

1. **Use numeric enums for contract values:**
   ```typescript
   // Matches Clarity contract constants
   enum MarketStatus {
     ACTIVE = 1,
     RESOLVED = 2
   }
   ```

2. **Use string enums for display values:**
   ```typescript
   enum ErrorCode {
     NETWORK_ERROR = 'NETWORK_ERROR',
     TIMEOUT = 'TIMEOUT'
   }
   ```

3. **Document enum values:**
   ```typescript
   /**
    * Market outcome values
    * These match the Clarity contract constants
    */
   enum MarketOutcome {
     /** No outcome determined yet */
     NONE = 0,
     /** YES outcome won */
     YES = 1,
     /** NO outcome won */
     NO = 2
   }
   ```

## Type Composition

### Extending Types

Use intersection types to compose types:

```typescript
type Timestamped = {
  createdAt: number;
  updatedAt: number;
};

type MarketWithTimestamps = Market & Timestamped;
```

### Partial Types

Use utility types for flexibility:

```typescript
// For updates where not all fields are required
type MarketUpdate = Partial<Market> & { id: string };

// For creating new markets (omit generated fields)
type NewMarket = Omit<Market, 'id' | 'createdAt'>;
```

## Testing Types

Write tests to ensure type correctness:

```typescript
import { Market, MarketStatus } from '@/types/market';

describe('Market types', () => {
  it('should create valid market object', () => {
    const market: Market = {
      id: '1',
      title: 'Test Market',
      description: 'Test',
      creator: 'SP2...',
      endTime: Date.now(),
      resolved: false,
      totalVolume: 0,
      currentPrice: 0.5
    };
    
    expect(market.id).toBe('1');
  });
});
```

## Contributing

When adding new types:

1. Add comprehensive JSDoc documentation
2. Include usage examples
3. Use semantic naming
4. Group related types together
5. Export from appropriate module
6. Update this README

## Related Documentation

- [TypeScript Strict Mode Guide](../../docs/TYPESCRIPT_STRICT_MODE.md)
- [API Reference](../../docs/api-reference.md)
- [Contract Integration](../../docs/integration-guide.md)
