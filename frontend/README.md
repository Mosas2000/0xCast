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
// Instead of: import { Service } from '../../../services/Service'
import { Service } from '@/services/Service'
```

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
