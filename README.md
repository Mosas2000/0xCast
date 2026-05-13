# 0xCast

<div align="center">
  <img src="frontend/public/logo.svg" alt="0xCast Logo" width="80" height="80">
  
  **Decentralized Prediction Markets on Bitcoin**
  
  [![Built on Stacks](https://img.shields.io/badge/Built%20on-Stacks-5546FF)](https://www.stacks.co/)
  [![Secured by Bitcoin](https://img.shields.io/badge/Secured%20by-Bitcoin-F7931A)](https://bitcoin.org/)
</div>

## Overview

0xCast is a decentralized prediction market platform built on Stacks, enabling users to create and trade on binary outcome markets using STX. Leveraging the security of Bitcoin through Stacks' Proof of Transfer consensus, 0xCast provides a trustless, transparent environment for speculation on crypto and financial events.

## Features

### Core Platform
- **Binary Prediction Markets** - Create Yes/No markets on any outcome
- **STX-Based Trading** - All trades conducted using native STX tokens
- **Dynamic Odds** - Real-time odds calculated based on pool distribution
- **Transparent Resolution** - All outcomes resolved on-chain with full transparency
- **Automated Payouts** - Winners claim rewards through smart contracts

### Advanced Features
- **Liquidity Pools** - AMM-based liquidity provision with LP rewards
- **Governance System** - On-chain governance with proposals and voting
- **Oracle Integration** - External data feeds for automated market resolution
- **Access Control** - Role-based permissions for oracles and administrators
- **Dispute Resolution** - Community-driven dispute mechanism for contested outcomes

## Tech Stack

### Smart Contracts (Clarity)
| Contract | Description |
|----------|-------------|
| `market-core` | Core prediction market logic |
| `access-control` | Role-based permissions |
| `market-fees` | Fee collection and distribution |
| `governance-token` | SIP-010 governance token (CAST) |
| `governance-core` | Proposal and voting system |
| `oracle-integration` | Price feeds and resolution |
| `liquidity-pool` | AMM for market liquidity |
| `liquidity-rewards` | LP incentive distribution |
| `oracle-reputation` | Oracle performance tracking |

### Frontend
- **React 19** + TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **@stacks/connect** for wallet integration
- **React Router** for navigation

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Clarinet](https://github.com/hirosystems/clarinet) for contract development
- [Stacks Wallet](https://www.hiro.so/wallet) for testing

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/0xCast.git
cd 0xCast

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

### Contract Development

```bash
# Check contract syntax
clarinet check

# Run tests
clarinet test

# Start local console
clarinet console
```

### Building for Production

```bash
cd frontend
npm run build
```

## Deployment

### Frontend (Vercel)

The frontend is configured for seamless Vercel deployment:

```bash
cd frontend
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Contracts (Stacks)

```bash
# Deploy to testnet
clarinet deployments generate --testnet
clarinet deployments apply --testnet

# Deploy to mainnet
clarinet deployments generate --mainnet
clarinet deployments apply --mainnet
```

## Project Structure

```
0xCast/
├── contracts/          # Clarity smart contracts
├── tests/              # Contract test files
├── frontend/           # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── utils/      # Helper functions
│   │   └── types/      # TypeScript types
│   └── public/         # Static assets
├── scripts/            # Utility scripts
├── settings/           # Network configurations
└── docs/               # Documentation
```

## Contract Addresses

| Network | Contract | Address |
|---------|----------|---------|
| Mainnet | market-core | `SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T` |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Resources

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Reference](https://docs.stacks.co/clarity/overview)
- [Stacks Explorer](https://explorer.stacks.co/)

## Documentation

- [Docs index](docs/README.md)
- [Contract API: market-core](docs/contracts/market-core.md)
- [Contract API: oxcast](docs/contracts/oxcast.md)
- [Contract API: governance-core](docs/contracts/governance.md)
- [Frontend hooks reference](docs/frontend/hooks.md)
- [Frontend components integration](docs/frontend/components.md)
- [Integration guide](docs/integration-guide.md)
- [API reference](docs/api-reference.md)

## Scripts

The project includes comprehensive TypeScript scripts for interacting with deployed contracts:

- [Scripts README](scripts/README.md) - Complete scripts documentation
- [Block Height Guide](scripts/docs/BLOCK_HEIGHT_GUIDE.md) - Dynamic block height management
- [Quick Reference](scripts/docs/QUICK_REFERENCE.md) - Common tasks and examples

### Available Scripts

```bash
npm run interact        # Interactive contract operations
npm run bulk-markets    # Create multiple markets
npm run auto-trade      # Automated trading
npm run lifecycle       # Market lifecycle simulation
npm run analytics       # Generate analytics reports
npm run validate-blocks # Validate block height usage
```

All scripts use dynamic block height calculation, ensuring they remain functional regardless of when they're run. See [Issue #64 Resolution](ISSUE_64_RESOLUTION.md) for details.
