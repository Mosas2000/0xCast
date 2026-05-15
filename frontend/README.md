# 0xCast Frontend

React-based frontend for the 0xCast prediction markets platform.

## Quick Start

```bash
npm install
npm run dev
```

## Performance Optimizations

This project implements React.memo optimization for list item components to prevent unnecessary re-renders:

- **92-98% reduction** in unnecessary re-renders for list items
- **60fps** scroll performance in large lists
- **Stable props pattern** with useCallback and useMemo

See [React.memo Guide](./docs/REACT_MEMO_GUIDE.md) for implementation details.

## Path Aliases

This project uses `@/` path aliases for cleaner imports:

```typescript
// ✅ Recommended: Use @ for cross-directory imports
import { Service } from '@/services/Service'
import { Type } from '@/types/Type'

// ✅ Also fine: Relative imports for nearby files
import { Component } from './Component'
import { helper } from '../utils/helper'
```

### When to Use @ Aliases
- Importing from services, types, hooks, contexts
- Cross-directory imports (e.g., pages → services)
- Deep nested imports (3+ levels)

### When to Use Relative Imports
- Same directory imports
- Parent/child component relationships
- Utility functions in same module

Configured in:
- `vite.config.ts` - Vite module resolution
- `tsconfig.app.json` - TypeScript path mapping

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Lint code

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # Business logic
├── types/          # TypeScript types
├── utils/          # Utility functions
└── contexts/       # React contexts
```

## Development

### Install Dependencies

```bash
npm install
```

### Development Server

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

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.

## License

MIT
