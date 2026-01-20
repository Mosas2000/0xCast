# 0xCast

**0xCast is a decentralized prediction market platform built on Stacks, allowing users to create and trade on binary outcome markets using STX.**

## Overview

0xCast leverages the power of the Stacks blockchain and Clarity smart contracts to create a trustless, transparent prediction market protocol. Users can create markets on any binary outcome event, purchase shares representing their predictions, and claim winnings when markets resolve.

## Features

- **Decentralized Market Creation**: Anyone can create prediction markets for binary outcome events
- **STX-Based Trading**: All trades are conducted using STX tokens
- **Transparent Resolution**: Market outcomes are resolved on-chain with full transparency
- **Automated Payouts**: Winners automatically claim their rewards through smart contracts
- **Built on Stacks**: Leverages Bitcoin's security through Stacks' Proof of Transfer consensus

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
