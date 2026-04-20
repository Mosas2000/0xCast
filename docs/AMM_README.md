# Automated Market Maker (AMM) System

Professional implementation of a comprehensive AMM system for the 0xCast prediction market platform with multiple pricing models, advanced liquidity mechanisms, and comprehensive trading tools.

## Features

### Core AMM Models
- **Constant Product (x*y=k)** - Classical bonding curve with proportional slippage
- **Stable Swap** - Curve Finance-style pricing for correlated assets
- **Concentrated Liquidity** - Uniswap v3-style tick-based capital efficiency

### Advanced Features
- **Flash Swaps** - Zero-capital flash loans with callback validation
- **Multi-Pool Routing** - Automatic optimal path finding across pools
- **Slippage Optimization** - Tracking and minimization strategies
- **Oracle Integration** - Multi-source price aggregation with consensus
- **Swap Strategies** - DCA, TWAP, limit orders, volatility adjustment

### Trading & Analytics
- **Trading Analytics** - Complete trade history and performance metrics
- **Price Monitoring** - Real-time price tracking with alerts
- **Pool Management** - Factory and registry for pool lifecycle
- **Risk Metrics** - Concentration, liquidity, and volatility analysis

### Safety & Validation
- **Parameter Validation** - Comprehensive input checking
- **Pool Consistency** - Invariant preservation verification
- **Edge Case Handling** - Overflow, underflow, zero division handling
- **Error Recovery** - Retry logic, graceful degradation, circuit breaker
- **Rate Limiting** - Call throttling and protection

## Architecture

```
frontend/src/
├── types/
│   └── amm.ts                          # Type definitions
├── services/
│   ├── ConstantProductAMM.ts           # x*y=k implementation
│   ├── StableSwapAMM.ts                # Stable pricing
│   ├── ConcentratedLiquidityAMM.ts     # Tick-based liquidity
│   ├── FlashSwapService.ts             # Flash loans
│   ├── AMMRouter.ts                    # Multi-pool routing
│   ├── AMMPoolFactory.ts               # Pool lifecycle
│   ├── OracleIntegration.ts            # Price aggregation
│   ├── SwapStrategies.ts               # Trading strategies
│   ├── PriceMonitor.ts                 # Price tracking
│   └── TradingAnalytics.ts             # Trade analysis
├── hooks/
│   └── useAMM.ts                       # React hooks
├── components/
│   ├── AMMComponents.tsx               # Swap/liquidity UI
│   └── AnalyticsDashboard.tsx          # Analytics UI
├── utils/
│   ├── slippageOptimization.ts         # Slippage management
│   ├── ammValidation.ts                # Input validation
│   ├── ammCalculations.ts              # Math utilities
│   └── errorRecovery.ts                # Error handling
└── docs/
    └── AMM_DOCUMENTATION.md            # Full documentation
```

## Usage Examples

### Basic Swap

```typescript
import { ConstantProductAMM } from '@/services/ConstantProductAMM';

const pool = createPool(...);
const amm = new ConstantProductAMM(pool);

const quote = amm.quoteSwapAtoB(1000n);
const output = amm.executeSwapAtoB(1000n);
```

### Multi-Hop Swap

```typescript
const router = new AMMRouter();
router.addPool(pool1, 'constant-product');
router.addPool(pool2, 'stable-swap');

const result = router.multiHopSwap(
  ['pool1', 'pool2'],
  1000000000n,
  900000000n
);
```

### Flash Swap

```typescript
const flashSwap = new FlashSwapService(pool, 0.05);

flashSwap.initiateFlashSwap('flash1', 'A', 1000000000n, {
  borrower: 'user',
  deadline: Date.now() + 60000,
  onFlashSwap: (id, token, amount, fee) => {
    // Custom arbitrage logic
    return { amountToReturn: amount + fee };
  },
});
```

### Concentrated Liquidity

```typescript
const clAMM = new ConcentratedLiquidityAMM(pool);

const pos = clAMM.createPosition(
  'pos1',
  'user',
  -10000,  // lower tick
  10000,   // upper tick
  100000000000n
);

const fees = clAMM.claimFees('pos1');
```

### Trading Analytics

```typescript
const analytics = new TradingAnalytics();

analytics.recordTrade('user1', 'pool-stx-usda', quote);

const metrics = analytics.getUserMetrics('user1');
const roi = analytics.calculateROI('user1');
const pnl = analytics.calculatePnL('user1');
```

### Price Monitoring

```typescript
const monitor = new PriceMonitor();

monitor.recordPrice('pool-id', pool);

const alert: PriceAlert = {
  id: 'alert1',
  poolId: 'pool-id',
  condition: 'above',
  targetPrice: 1.5,
  active: true,
  createdAt: Date.now(),
};

monitor.addAlert(alert);
```

## React Integration

### Using Hooks

```typescript
import { useSwapQuote, useAddLiquidity } from '@/hooks/useAMM';

function MyComponent() {
  const { quote, loading } = useSwapQuote(pool, 1000000000n, true);
  const { addLiquidity } = useAddLiquidity(pool);

  return (
    <div>
      <p>Amount out: {quote?.amountOut}</p>
      <button onClick={() => addLiquidity(100n, 100n)}>
        Add Liquidity
      </button>
    </div>
  );
}
```

### Using Components

```typescript
import { SwapInterface, AMMPoolCard } from '@/components/AMMComponents';

export default function App() {
  return (
    <div className="space-y-4">
      <AMMPoolCard poolId="pool-1" onSelect={handleSelect} />
      <SwapInterface pool={pool} onSwap={handleSwap} />
    </div>
  );
}
```

## Validation

### Pool Creation

```typescript
const validator = new AMMPoolValidator();
const result = validator.validatePoolCreation(pool);

if (!result.valid) {
  console.error('Pool errors:', result.errors);
}
```

### Swap Parameters

```typescript
const paramValidator = new SwapParameterValidator();

if (!paramValidator.validateSwapQuote(quote, 1.0)) {
  console.error('Quote exceeds max slippage');
}
```

### Liquidity Operations

```typescript
const liquidity = new LiquidityValidator();

const valid = liquidity.validateLiquidityParameters(
  reserveA, reserveB, amountADesired, amountBDesired
);
```

## Error Handling

### Edge Cases

```typescript
const handler = new EdgeCaseHandler();

const validated = handler.validateAmountIn(amount, maxAllowed);
if (!validated.valid) {
  console.error('Invalid amount');
}

const reserved = handler.validateReserves(reserveA, reserveB);
```

### Recovery

```typescript
const recovery = new ErrorRecovery();

// Retry with exponential backoff
const result = recovery.retryOperation(() => {
  return executeSwap(pool, amount);
}, 3, 100);

// Fallback value
const output = recovery.attemptSwapWithFallback(
  pool, amount, true, fallback
);
```

### Rate Limiting

```typescript
const limiter = new RateLimiter(100, 60000);

if (!limiter.allowCall()) {
  console.error('Rate limit exceeded');
}
```

### Circuit Breaker

```typescript
const breaker = new CircuitBreaker(5, 2, 60000);

if (!breaker.canAttempt()) {
  console.error('Circuit is open');
}

try {
  executeSwap();
  breaker.recordSuccess();
} catch (error) {
  breaker.recordFailure();
}
```

## Performance

- Constant Product: O(1) operations
- Stable Swap: O(n) iterations (default 10)
- Concentrated Liquidity: O(1) per position
- Multi-hop: O(m) where m = number of hops
- Analytics: O(n) for n trades

## Testing

Run the comprehensive test suite:

```bash
npm run test tests/amm.test.ts
```

Coverage includes:
- All AMM models
- Multi-hop routing
- Flash swaps
- Slippage calculations
- Oracle integration
- Validation utilities
- Edge case handling

## Security Considerations

1. **Flash Swap Safety** - Callbacks are validated before execution
2. **Oracle Consensus** - Multiple sources with confidence weighting
3. **Slippage Protection** - Configurable limits prevent sandwich attacks
4. **Input Validation** - All parameters checked before processing
5. **Invariant Preservation** - Pool K value maintained across operations
6. **Rate Limiting** - Protection against rapid-fire requests
7. **Circuit Breaking** - Automatic system shutdown on failures

## Gas/Cost Optimization

- Batch operations when possible
- Use multi-hop routing for better pricing
- Concentrate liquidity for capital efficiency
- Cache quotes when appropriate
- Validate parameters before execution

## Future Enhancements

- MEV protection mechanisms
- Cross-protocol routing
- Advanced oracle implementations
- Uniswap v4 support
- Risk management framework
- Advanced analytics dashboard
- Limit order book integration

## Documentation

See `docs/AMM_DOCUMENTATION.md` for complete API reference and examples.

## License

Part of 0xCast prediction market platform.
