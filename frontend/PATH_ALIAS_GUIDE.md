# Path Alias Configuration Guide

## Overview

This project uses `@/` path aliases to simplify imports and improve code maintainability.

## Configuration

### Vite Configuration (`vite.config.ts`)
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### TypeScript Configuration (`tsconfig.app.json`)
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

## Usage

### Before (Relative Imports)
```typescript
import { RateLimitService } from '../../../services/RateLimitService';
import { RateLimitAction } from '../../../types/rateLimit';
```

### After (Path Aliases)
```typescript
import { RateLimitService } from '@/services/RateLimitService';
import { RateLimitAction } from '@/types/rateLimit';
```

## Benefits

1. **Cleaner Imports** - No more `../../../` chains
2. **Easier Refactoring** - Moving files doesn't break imports
3. **Better Readability** - Clear indication of absolute paths
4. **IDE Support** - Full intellisense and auto-completion

## Supported Paths

- `@/components/*` - React components
- `@/hooks/*` - Custom React hooks
- `@/services/*` - Business logic services
- `@/types/*` - TypeScript type definitions
- `@/utils/*` - Utility functions
- `@/contexts/*` - React contexts
- `@/pages/*` - Page components

## Migration

When migrating existing code:
1. Replace relative imports with @ aliases
2. Verify TypeScript compilation
3. Test functionality
4. Update tests if needed

## Troubleshooting

**Issue:** IDE doesn't recognize @ imports
- **Solution:** Restart TypeScript server in your IDE

**Issue:** Build fails with module not found
- **Solution:** Verify paths in both vite.config.ts and tsconfig.app.json

**Issue:** Tests fail with @ imports
- **Solution:** Ensure test configuration includes path mapping
