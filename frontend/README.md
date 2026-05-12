# 0xCast Frontend

React-based frontend for the 0xCast prediction markets platform.

## Quick Start

```bash
npm install
npm run dev
```

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

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.
