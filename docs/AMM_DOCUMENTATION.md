## AMM System Documentation

### Overview

The Automated Market Maker (AMM) system provides multiple pricing models and liquidity mechanisms for the 0xCast platform. It supports constant product (x*y=k), stable swap, concentrated liquidity, flash swaps, and multi-hop routing.

### Architecture

#### Core Components

1. **AMMPool Type** - Represents a liquidity pool with two tokens
   - Reserves for both tokens
   - Fee structure (basis points)
   - Total liquidity tracking
   - Model type identifier

2. **Pricing Models**
   - `ConstantProductAMM` - Classical x*y=k bonding curve
   - `StableSwapAMM` - Curve Finance-style for correlated assets
   - `ConcentratedLiquidityAMM` - Uniswap v3-style tick-based liquidity

3. **Advanced Features**
   - `FlashSwapService` - Flash loans with callback validation
   - `AMMRouter` - Multi-pool and multi-hop swap routing
   - `SlippageOptimizer` - Slippage tracking and optimization
   - `OracleIntegration` - Price oracle aggregation

### Usage Guide

#### Basic Swap

```typescript
import { ConstantProductAMM } from '@/services/ConstantProductAMM';

const pool: AMMPool = {
  id: 'stx-usda',
  tokenA: 'STX',
  tokenB: 'USDA',
  reserveA: 1000000000000n,
  reserveB: 1000000000000n,
  fee: 3000,
  totalLiquidity: 1000000000000n,
  model: 'CONSTANT_PRODUCT',
};

const amm = new ConstantProductAMM(pool);
const quote = amm.quoteSwapAtoB(1000000000n);
console.log(`Amount out: ${quote.amountOut}`);
console.log(`Price impact: ${quote.priceImpact * 100}%`);

const amountOut = amm.executeSwapAtoB(1000000000n);
```

#### Add Liquidity

```typescript
const amountA = 100000000000n;
const amountB = 100000000000n;

amm.addLiquidity(amountA, amountB);
const stats = amm.getStats();
console.log(`Liquidity added: ${stats.liquidityUtilization}%`);
```

#### Remove Liquidity

```typescript
const liquidityToRemove = 50000000000n;
amm.removeLiquidity(liquidityToRemove);
```

#### Concentrated Liquidity

```typescript
const clAMM = new ConcentratedLiquidityAMM(pool, 1);

// Create a position in a tick range
const position = clAMM.createPosition(
  'position1',
  'user-address',
  -10000,  // lower tick
  10000,   // upper tick
  100000000000n  // liquidity amount
);

// Claim fees
const fees = clAMM.claimFees('position1');
```

#### Flash Swaps

```typescript
const flashSwap = new FlashSwapService(pool, 0.05);

const callback = {
  borrower: 'user-address',
  deadline: Date.now() + 60000,
  onFlashSwap: (id, token, amount, fee) => {
    // Custom logic here
    return { amountToReturn: amount + fee };
  },
};

flashSwap.initiateFlashSwap('flash1', 'A', 1000000000n, callback);
const result = flashSwap.executeFlashSwap('flash1', callback);
```

#### Multi-Hop Swaps

```typescript
const router = new AMMRouter();

// Add pools
router.addPool(pool1, 'constant-product');
router.addPool(pool2, 'stable-swap');
router.addPool(pool3, 'concentrated-liquidity');

// Execute multi-hop swap
const result = router.multiHopSwap(
  ['pool1', 'pool2', 'pool3'],
  1000000000n,
  900000000n
);
```

### React Integration

#### Using Hooks

```typescript
import {
  useAMMPool,
  useSwapQuote,
  useAddLiquidity,
  useAMMRouter,
} from '@/hooks/useAMM';

function MyAMMComponent() {
  const { pool } = useAMMPool('stx-usda');
  const { quote } = useSwapQuote(pool, 1000000000n, true);
  const { addLiquidity, loading } = useAddLiquidity(pool);

  return (
    <div>
      <p>Quote: {quote?.amountOut.toString()}</p>
      <button onClick={() => addLiquidity(100n, 100n)}>
        {loading ? 'Adding...' : 'Add Liquidity'}
      </button>
    </div>
  );
}
```

#### Using Components

```typescript
import { SwapInterface, LiquidityManagement } from '@/components/AMMComponents';

function AMM() {
  return (
    <div>
      <SwapInterface
        pool={myPool}
        onSwap={async (amountIn, amountOut) => {
          console.log(`Swapped ${amountIn} for ${amountOut}`);
        }}
      />

      <LiquidityManagement
        pool={myPool}
        onAddLiquidity={async (a, b) => {
          console.log(`Added ${a} and ${b}`);
        }}
        onRemoveLiquidity={async (liq) => {
          console.log(`Removed ${liq}`);
        }}
      />
    </div>
  );
}
```

### Pricing Models

#### Constant Product (x*y=k)
- Formula: `reserveA * reserveB = constant`
- Best for: General trading pairs
- Features:
  - Proportional price slippage
  - Fair pricing across all ranges
  - Simple invariant preservation

#### Stable Swap
- Formula: `amp * n * sum + product = constant`
- Best for: Correlated assets (stablecoins, wrapped tokens)
- Features:
  - Lower slippage for similar-value tokens
  - Amplification factor for customization
  - Iterative reserve calculation

#### Concentrated Liquidity
- Structure: Tick-based position ranges
- Best for: Capital-efficient trading
- Features:
  - Position-specific liquidity
  - Fee accrual per position
  - Capital efficiency metrics
  - Tick-based price ranges

### Slippage Management

#### Slippage Tracking

```typescript
const optimizer = new SlippageOptimizer(1.0);

optimizer.recordSlippage(0.5);
optimizer.recordSlippage(0.75);

const stats = optimizer.getSlippageStatistics();
console.log(`Average slippage: ${stats.average}%`);
console.log(`Max slippage: ${stats.max}%`);
```

#### Slippage Optimization

```typescript
const result = optimizer.optimizeSlippageForPool(
  pool,
  1000000000n,
  0.5  // target 0.5% slippage
);

console.log(`Optimal amount: ${result.optimalAmount}`);
console.log(`Expected slippage: ${result.expectedSlippage}%`);
```

### Oracle Integration

#### Adding Oracle Prices

```typescript
const oracle = new OracleIntegration();

oracle.addOraclePrice('STX-USDA', {
  price: 1.5,
  timestamp: Date.now(),
  source: 'oracle-1',
  confidence: 0.95,
});

oracle.addOraclePrice('STX-USDA', {
  price: 1.49,
  timestamp: Date.now(),
  source: 'oracle-2',
  confidence: 0.92,
});
```

#### Consensus Pricing

```typescript
const consensusPrice = oracle.getConsensusPrice('STX-USDA');
console.log(`Consensus: ${consensusPrice}`);

const consistency = oracle.validatePriceConsistency('STX-USDA');
console.log(`Consistent: ${consistency.consistent}`);
console.log(`Divergence: ${consistency.divergence.toFixed(2)}%`);
```

### Validation

#### Swap Parameter Validation

```typescript
const validator = new SwapParameterValidator();

const valid = validator.validateSwapQuote(quote, 1.0);
if (!valid) {
  console.log('Quote exceeds max slippage');
}
```

#### Pool Validation

```typescript
const poolValidator = new AMMPoolValidator();

const result = poolValidator.validatePoolCreation(pool);
if (!result.valid) {
  console.log('Pool errors:', result.errors);
}

const consistency = poolValidator.validatePoolConsistency(pool);
if (!consistency.valid) {
  console.log('Warnings:', consistency.warnings);
}
```

#### Liquidity Validation

```typescript
const liquidity = new LiquidityValidator();

const valid = liquidity.validateLiquidityParameters(
  reserveA,
  reserveB,
  amountADesired,
  amountBDesired
);

if (!valid.valid) {
  console.log('Issues:', valid.issues);
}
```

### Performance Considerations

1. **Slippage**: Record and track to optimize future swaps
2. **Capital Efficiency**: Use concentrated liquidity for better returns
3. **Multi-Hop**: Router finds optimal path automatically
4. **Price Feeds**: Oracle consensus reduces manipulation risk
5. **Flash Loans**: Zero capital flash swaps for arbitrage

### Gas/Cost Optimization

- Batch operations when possible
- Use multi-hop routing for better pricing
- Concentrate liquidity for capital efficiency
- Cache quotes when appropriate
- Validate parameters before execution

### Security Notes

1. Flash swaps validate callback execution
2. Oracle prices have confidence metrics
3. Slippage limits prevent sandwich attacks
4. Pool invariants are preserved
5. Input validation on all operations

### Testing

Run comprehensive test suite:

```bash
npm run test tests/amm.test.ts
```

Tests cover:
- Swap quoting and execution
- Liquidity operations
- Price impact calculations
- Flash swap mechanics
- Multi-hop routing
- Slippage tracking
- Oracle integration
- Validation utilities

### Future Enhancements

1. Advanced oracle implementations
2. MEV protection mechanisms
3. Cross-protocol routing
4. More AMM models (Uniswap v4)
5. Risk management framework
6. Advanced analytics dashboard
