# Configuration Guide

## Path Aliases

### Vite Configuration
The project uses Vite's `resolve.alias` to map `@` to the `src` directory.

**File:** `vite.config.ts`
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### TypeScript Configuration
TypeScript path mapping enables IDE intellisense for aliased imports.

**File:** `tsconfig.app.json`
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Testing Configuration

Vitest is configured in the main `vite.config.ts`:
```typescript
test: {
  globals: true,
  environment: 'jsdom',
}
```

## Build Configuration

### Code Splitting
Vendor chunks are split for optimal caching:
- `stacks-vendor` - Stacks SDK packages
- `react-vendor` - React core packages

### Chunk Size Limit
Warning threshold set to 1000KB to monitor bundle size.

## Development

### Hot Module Replacement
Vite provides fast HMR out of the box. No additional configuration needed.

### Environment Variables
Create `.env.local` for local environment variables:
```
VITE_API_URL=http://localhost:3000
VITE_NETWORK=testnet
```

## IDE Setup

### VS Code
Recommended extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

### WebStorm/IntelliJ
Path aliases are automatically recognized from `tsconfig.json`.
