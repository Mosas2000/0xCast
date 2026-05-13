# 0xCast Frontend

Modern React frontend for the 0xCast decentralized prediction market platform.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Stacks SDK** for blockchain interaction
  - @stacks/connect - Wallet connection
  - @stacks/transactions - Contract calls
  - @stacks/network - Network configuration

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── constants/      # App constants (contract address, etc.)
├── App.tsx         # Main app component
└── main.tsx        # Entry point
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Code Quality

### Linting

The project uses ESLint with performance optimizations for the large codebase.

```bash
npm run lint              # Run with caching (recommended)
npm run lint:fix          # Auto-fix issues
npm run lint:changed      # Lint only changed files
npm run lint:profile      # Profile ESLint performance
npm run lint:benchmark    # Run performance benchmarks
```

See [ESLint Performance Guide](docs/ESLINT_PERFORMANCE.md) for detailed information.

### Testing

```bash
npm run test              # Run tests in watch mode
npm run test:run          # Run tests once
npm run test:coverage     # Generate coverage report
```

## Contract Integration

The frontend connects to the deployed market-core contract on Stacks mainnet:

**Contract Identifier**: `SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T.market-core`

Contract address is configured in `src/constants/contract.ts`

## Features

- 🌙 Dark theme UI
- 💼 Wallet connection with Stacks Connect
- 📊 Market statistics dashboard
- 🎯 Create and trade on prediction markets
- 💰 Claim winnings from resolved markets
- 📱 Responsive design

## Development Roadmap

- [x] Project setup
- [x] Basic UI layout
- [ ] Wallet connection integration
- [ ] Market creation form
- [ ] Market listing and details
- [ ] Staking interface
- [ ] Market resolution (creator only)
- [ ] Winnings claim interface

## License

MIT
