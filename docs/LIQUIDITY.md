# Liquidity & AMM System Documentation

## Overview

The 0xCast liquidity system provides the depth and pricing for all prediction markets. Using an Automated Market Maker (AMM) with a Constant Product Market Maker (CPMM) formula, it ensures that users can always trade on their preferred outcomes with fair market pricing.

## Components

### 1. Liquidity Pool (`liquidity-pool.clar`)

The core AMM contract managing market reserves and pricing.

**Key Features:**
- **Constant Product AMM:** Implements the $x \times y = k$ formula for outcome pricing.
- **Liquidity Shares:** Providers receive shares representing their portion of the pool.
- **Dynamic Reserves:** Pulls and pushes STX/Tokens based on trade volume.
- **Fee Split:** Trades include a platform fee and an LP fee.

**Fees:**
- **Platform Fee:** 0.30%
- **LP Fee:** 0.20%

### 2. Liquidity Rewards (`liquidity-rewards.clar`)

An incentive system designed to attract and maintain high liquidity depth.

**Mechanics:**
- **Yield Farming:** LPs earn governance tokens proportionally to their share and time in the pool.
- **Reward Multipliers:** Specific markets can have boosted rewards to encourage depth.
- **Accrual Based:** Rewards accrue per block and can be claimed anytime.

## Provider Workflow

### 1. Providing Liquidity
LPs deposit STX into a market's pool to receive LP shares.
```clarity
(contract-call? .liquidity-pool add-liquidity u1 u100000000) ;; 100 STX
```

### 2. Earning Fees
As users trade on the market, 0.2% of every trade is added to the reserves, increasing the value of each LP share.

### 3. Claiming Incentives
LPs can claim their governance token rewards periodically.
```clarity
(contract-call? .liquidity-rewards claim-rewards u1)
```

### 4. Withdrawing Liquidity
LPs burn their shares to receive their portion of the reserves (Initial + Fees).
```clarity
(contract-call? .liquidity-pool remove-liquidity u1 u50000000)
```

## Pricing Examples

The price of an outcome is determined by its ratio in the pool:
- If YES has 1000 tokens and NO has 1000 tokens, price is ~0.50 STX.
- If YES has 500 tokens and NO has 1500 tokens, YES price is ~0.75 STX.

## Security & Best Practices
- **Impermanent Loss:** LPs should be aware that significant price swings can lead to IL.
- **Slippage Protection:** Traders can set maximum slippage to avoid front-running.
- **Reserve Monitoring:** Large trades in shallow pools will experience high price impact.

## Testing
Run the liquidity test suite:
```bash
npm test tests/liquidity.test.ts
```
