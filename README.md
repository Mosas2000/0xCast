# 0xCast

**0xCast is a decentralized prediction market platform built on Stacks, allowing users to create and trade on binary outcome markets using STX.**

## Overview

0xCast leverages the power of the Stacks blockchain and Clarity smart contracts to create a trustless, transparent prediction market protocol. Users can create markets on any binary outcome event, purchase shares representing their predictions, and claim winnings when markets resolve.

## Features

- **Decentralized Market Creation**: Anyone can create prediction markets for binary outcome events
- **Multi-Outcome Markets**: Support for markets with 3-10 possible outcomes, not just binary
- **STX-Based Trading**: All trades are conducted using STX tokens
- **Dynamic Odds Calculation**: Real-time odds based on pool distribution
- **Transparent Resolution**: Market outcomes are resolved on-chain with full transparency
- **Automated Payouts**: Winners automatically claim their rewards through smart contracts
- **Liquidity Pools**: AMM-based liquidity provision with LP rewards
- **Governance System**: On-chain governance with proposals and voting
- **Oracle Integration**: External data feeds for automated market resolution
- **Built on Stacks**: Leverages Bitcoin's security through Stacks' Proof of Transfer consensus
- **Progressive Web App**: Install on mobile and desktop with offline support
- **Mobile Optimized**: Touch-friendly interface with pull-to-refresh and bottom navigation

## Progressive Web App (PWA)

0xCast is a fully-featured PWA that works offline and can be installed on your device.

### PWA Features
- Install on mobile and desktop
- Offline support with cached data
- Background sync for pending transactions
- Push notifications (coming soon)
- Pull-to-refresh on mobile
- Touch-optimized interface

### Installation

**Desktop:**
1. Look for the install icon in your browser's address bar
2. Click "Install" to add 0xCast to your applications

**Mobile:**
1. Open in your mobile browser
2. Tap the menu or share icon
3. Select "Add to Home Screen" or "Install App"

### Offline Mode

When offline, you can:
- View cached markets
- Browse your positions
- Queue transactions (will sync when online)

Pending transactions will automatically sync when you reconnect.

## Multi-Outcome Markets

0xCast now supports markets with 3-10 possible outcomes!

### Creating Multi-Outcome Markets
- Choose 3-10 unique outcomes
- Each outcome tracked separately
- Proportional payout based on winning outcome

### Example Markets
- "Who will win the championship?" (Multiple teams)
- "What price range will BTC be?" (Multiple ranges)
- "Which project will launch first?" (Multiple projects)

### Technical Details
- Contract: `market-multi.clar`
- Maximum outcomes: 10
- Minimum outcomes: 3
- Payout calculation: Proportional to total pool

## Project Structure

```
0xCast/
├── contracts/          # Clarity smart contracts
├── tests/             # Contract test files
├── settings/          # Network configuration files
│   ├── Devnet.toml   # Local development network
│   ├── Testnet.toml  # Stacks testnet configuration
│   └── Mainnet.toml  # Stacks mainnet configuration
├── Clarinet.toml      # Clarinet project configuration
└── README.md          # This file
```

## Getting Started

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) - Clarity development environment
- Node.js and npm (for testing)

### Installation

1. Clone the repository:
```bash
cd /Users/macosbigsur/Documents/Code/Stacks-project/0xCast
```

2. Verify Clarinet installation:
```bash
clarinet --version
```

### Development

Create a new contract:
```bash
clarinet contract new <contract-name>
```

Check contract syntax:
```bash
clarinet check
```

Run tests:
```bash
clarinet test
```

Start local console:
```bash
clarinet console
```

## Economic Transactions

0xCast includes comprehensive scripts for generating economic activity across all platform features.

### Available Scripts

```bash
# Market Operations (Binary)
npm run bulk-markets      # Create multiple markets
npm run auto-trade        # Automated trading
npm run lifecycle         # Full market lifecycle
npm run stress-test       # Performance testing
npm run analytics         # Analytics reports

# Liquidity Pool Operations
npm run liquidity         # Create/manage liquidity pools

# Governance Operations
npm run governance        # Create proposals, vote, execute

# Multi-Outcome Markets
npm run multi-market      # Create and trade on multi-outcome markets

# Oracle Operations
npm run oracle            # Submit price feeds and event data
```

### Quick Start

```bash
# Create 5 markets across different categories
npm run bulk-markets

# Add liquidity to markets
npm run liquidity

# Run automated trading
npm run auto-trade

# View analytics
npm run analytics
```

For detailed usage instructions, see [Economic Transaction Guide](docs/ECONOMIC_TRANSACTIONS.md).

## Deployment

### Testnet Deployment

1. Update your mnemonic in `settings/Testnet.toml`
2. Deploy to testnet:
```bash
clarinet deployments generate --testnet
clarinet deployments apply --testnet
```

### Mainnet Deployment

1. Update your mnemonic in `settings/Mainnet.toml`
2. Deploy to mainnet:
```bash
clarinet deployments generate --mainnet
clarinet deployments apply --mainnet
```

> ⚠️ **Warning**: Ensure you have sufficient STX for deployment fees and thoroughly test on testnet before mainnet deployment.

## Technology Stack

- **Blockchain**: Stacks
- **Smart Contract Language**: Clarity
- **Development Framework**: Clarinet
- **Testing**: Vitest

## Roadmap

- [ ] Core prediction market contract
- [ ] Market creation and management
- [ ] Share trading mechanism
- [ ] Market resolution system
- [ ] Frontend dApp interface
- [ ] Oracle integration
- [ ] Governance features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Resources

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Reference](https://docs.stacks.co/clarity/overview)
- [Clarinet Documentation](https://docs.hiro.so/clarinet)
- [Stacks Explorer](https://explorer.stacks.co/)

## Contact

For questions and support, please open an issue in the repository.
