# Economic Transaction Guide

## Overview

This guide covers the new economic transaction capabilities for the 0xCast prediction market platform. These scripts enable interaction with liquidity pools, governance, multi-outcome markets, and oracle data feeds.

## New Scripts

### 1. Liquidity Pool Operations

**Command:** `npm run liquidity`

**Features:**
- Create liquidity pools for markets
- Add liquidity to existing pools
- Remove liquidity and claim LP tokens
- Batch operations across multiple pools
- View pool analytics

**Modes:**

#### Create Pool
Initialize a new liquidity pool for a market:
```bash
npm run liquidity
# Select: Create Pool
# Enter market ID and initial liquidity amount
```

#### Add Liquidity
Deposit STX to an existing pool:
```bash
npm run liquidity
# Select: Add Liquidity
# Enter market ID and amount to add
```

#### Batch Create Pools
Create multiple pools at once:
```bash
npm run liquidity
# Select: Batch Create Pools
# Enter comma-separated market IDs (e.g., 0,1,2,3)
# Set initial liquidity per pool
# Configure delay between transactions
```

#### Pool Analytics
View statistics for existing pools:
```bash
npm run liquidity
# Select: Pool Analytics
# Enter market IDs to analyze
# No private key required
```

**Example Workflow:**
```bash
# 1. Create pools for markets 0-4
npm run liquidity
> Batch Create Pools
> Market IDs: 0,1,2,3,4
> Initial liquidity: 10 STX
> Delay: 3 seconds

# 2. Add more liquidity to pool 0
npm run liquidity
> Add Liquidity
> Market ID: 0
> Amount: 5 STX
```

---

### 2. Governance Operations

**Command:** `npm run governance`

**Features:**
- Create governance proposals
- Vote on active proposals
- Execute passed proposals
- Delegate voting power
- Use predefined proposal templates

**Modes:**

#### Create Proposal
Submit a custom governance proposal:
```bash
npm run governance
# Select: Create Proposal
# Enter title, description, type, and voting period
```

#### Create from Template
Use predefined proposal templates:
```bash
npm run governance
# Select: Create from Template
# Choose from:
#   - Reduce Platform Fees
#   - Increase Governance Timelock
#   - Treasury Grant
#   - Oracle Upgrade
#   - Emergency Pause
```

#### Vote on Proposal
Cast your vote on a proposal:
```bash
npm run governance
# Select: Vote on Proposal
# Enter proposal ID
# Select YES or NO
```

#### Batch Vote
Vote on multiple proposals at once:
```bash
npm run governance
# Select: Batch Vote
# Enter comma-separated proposal IDs
# Choose strategy: All YES, All NO, or Alternating
```

#### Delegate Voting Power
Delegate your votes to another address:
```bash
npm run governance
# Select: Delegate Voting Power
# Enter delegate address (principal)
```

**Example Workflow:**
```bash
# 1. Create a proposal to reduce fees
npm run governance
> Create from Template
> Template: Reduce Platform Fees
> Voting period: 7 days

# 2. Vote YES on proposals 0-2
npm run governance
> Batch Vote
> Proposal IDs: 0,1,2
> Strategy: All YES
```

---

### 3. Multi-Outcome Market Trading

**Command:** `npm run multi-market`

**Features:**
- Create markets with 3-10 outcomes
- Place stakes on specific outcomes
- Automated trading across all outcomes
- Use market templates for common scenarios

**Modes:**

#### Create Multi-Outcome Market
Create a custom market:
```bash
npm run multi-market
# Select: Create Multi-Outcome Market
# Enter question and number of outcomes
# Name each outcome
# Set market timeline
```

#### Create from Template
Use predefined market templates:
```bash
npm run multi-market
# Select: Create from Template
# Choose from:
#   - Sports - 4 Teams
#   - BTC Price Ranges
#   - Project Rankings
#   - Election - 5 Candidates
#   - Quarterly Revenue
```

#### Place Single Stake
Bet on a specific outcome:
```bash
npm run multi-market
# Select: Place Single Stake
# Enter market ID and outcome index
# Enter stake amount
```

#### Automated Trading
Execute multiple trades across outcomes:
```bash
npm run multi-market
# Select: Automated Trading
# Enter market ID and number of outcomes
# Set trades per outcome
# Choose strategy:
#   - Uniform: Equal stakes
#   - Weighted: Higher on lower indices
#   - Favorites: Higher on first 2 outcomes
#   - Random: Random distribution
```

**Example Workflow:**
```bash
# 1. Create a sports market
npm run multi-market
> Create from Template
> Template: Sports - 4 Teams
> Days until close: 7
> Days until resolution: 10

# 2. Run automated trading
npm run multi-market
> Automated Trading
> Market ID: 0
> Outcomes: 4
> Trades per outcome: 3
> Strategy: Favorites
> Min stake: 0.5 STX
> Max stake: 2 STX
```

---

### 4. Oracle Operations

**Command:** `npm run oracle`

**Features:**
- Submit price feeds
- Submit event outcomes
- Verify oracle data
- Batch submit multiple data points
- Mock data generator for testing

**Modes:**

#### Submit Price Feed
Submit a single price data point:
```bash
npm run oracle
# Select: Submit Price Feed
# Enter symbol (e.g., BTC, ETH, STX)
# Enter price in USD
```

#### Submit Event Outcome
Report the outcome of an event:
```bash
npm run oracle
# Select: Submit Event Outcome
# Enter event ID
# Select TRUE or FALSE
```

#### Batch Submit Prices
Submit multiple price feeds:
```bash
npm run oracle
# Select: Batch Submit Prices
# Select symbols (BTC, ETH, STX, etc.)
# Set delay between submissions
```

#### Batch Submit Events
Submit multiple event outcomes:
```bash
npm run oracle
# Select: Batch Submit Events
# Select events to submit
# Set delay between submissions
```

#### Mock Data Generator
View mock data without submitting:
```bash
npm run oracle
# Select: Mock Data Generator
# View current mock prices and event outcomes
```

**Example Workflow:**
```bash
# 1. Submit current crypto prices
npm run oracle
> Batch Submit Prices
> Symbols: BTC, ETH, STX
> Delay: 3 seconds

# 2. Submit event outcomes
npm run oracle
> Batch Submit Events
> Events: BTC above $50k, ETH above $3k
> Delay: 3 seconds
```

---

## Best Practices

### Transaction Safety
- Always test on testnet first before mainnet
- Start with small amounts to verify functionality
- Use appropriate delays to avoid nonce conflicts
- Monitor transactions on Stacks Explorer

### Gas Optimization
- Use batch operations when possible to reduce overhead
- Adjust delays based on network congestion
- Consider transaction costs before executing large batches

### Workflow Planning
1. **Planning Phase**: Use analytics and mock data to plan operations
2. **Execution Phase**: Run scripts with appropriate configurations
3. **Verification Phase**: Check transaction logs and Explorer links
4. **Analysis Phase**: Review generated JSON reports

### Error Handling
All scripts include:
- Automatic retry logic for failed broadcasts
- Detailed error messages
- Continuation on individual failures in batch operations
- Transaction logs for debugging

---

## Output Files

All scripts generate timestamped JSON files:

- `liquidity-pools-[timestamp].json` - Pool creation records
- `add-liquidity-[timestamp].json` - Liquidity addition records
- `governance-votes-[timestamp].json` - Voting records
- `multi-outcome-trades-[timestamp].json` - Multi-outcome trading records
- `oracle-prices-[timestamp].json` - Price feed submissions
- `oracle-events-[timestamp].json` - Event outcome submissions

---

## Troubleshooting

### Common Issues

**"Nonce conflict" errors**
- Increase delay between transactions
- Wait for pending transactions to confirm

**"Insufficient balance" errors**
- Check STX balance in wallet
- Reduce stake amounts or batch sizes

**"Contract not found" errors**
- Verify contract is deployed
- Check contract address in script

**"Invalid parameter" errors**
- Ensure values are within valid ranges
- Check data types match contract expectations

### Getting Help

1. Check transaction on Stacks Explorer for detailed error
2. Review generated JSON logs for transaction details
3. Consult contract documentation for function requirements
4. Test with smaller amounts first

---

## Advanced Usage

### Custom Workflows

Combine scripts for complex operations:

```bash
# 1. Create multi-outcome market
npm run multi-market

# 2. Create liquidity pool for the market
npm run liquidity

# 3. Run automated trading
npm run multi-market

# 4. Submit oracle data for resolution
npm run oracle
```

### Integration with Existing Scripts

New scripts work alongside existing ones:

```bash
# Create binary markets
npm run bulk-markets

# Create multi-outcome markets
npm run multi-market

# Trade on both types
npm run auto-trade        # Binary markets
npm run multi-market      # Multi-outcome markets

# Analyze all activity
npm run analytics
```

---

## Security Considerations

- **Private Keys**: Never share your private key or mnemonic
- **Transaction Review**: Always review transaction details before confirming
- **Amount Limits**: Set reasonable limits for automated operations
- **Testnet First**: Test all workflows on testnet before mainnet
- **Monitoring**: Regularly check transaction status and wallet balance

---

## Next Steps

1. **Test on Testnet**: Deploy contracts and test all scripts
2. **Small Mainnet Test**: Run with minimal amounts to verify
3. **Scale Up**: Gradually increase operation sizes
4. **Monitor**: Track performance and adjust parameters
5. **Optimize**: Fine-tune delays and batch sizes based on results
