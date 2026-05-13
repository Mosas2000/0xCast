# Contributing to Error Handling Utilities

Thank you for your interest in contributing to the error handling utilities!

## Getting Started

1. Read the [README](README.md) for usage information
2. Review [Best Practices](../../../docs/ERROR_HANDLING_BEST_PRACTICES.md)
3. Check existing utilities before creating new ones

## Adding New Utilities

### 1. Create the Utility

Create a new file in `frontend/src/utils/errorHandling/`:

```typescript
export class MyErrorHandler {
  // Implementation
}
```

### 2. Add Tests

Create tests in `__tests__/`:

```typescript
import { describe, it, expect } from 'vitest';
import { MyErrorHandler } from '../MyErrorHandler';

describe('MyErrorHandler', () => {
  it('should handle errors', () => {
    // Test implementation
  });
});
```

### 3. Update Index

Add exports to `index.ts`:

```typescript
export { MyErrorHandler } from './MyErrorHandler';
```

### 4. Update Documentation

Update relevant documentation files:
- README.md
- CHANGELOG.md
- Quick reference guide

## Code Style

- Use TypeScript
- Follow existing patterns
- Add JSDoc comments
- Include error context
- Handle edge cases
- Write comprehensive tests

## Testing

Run tests before submitting:

```bash
npm test errorHandling
```

## Pull Request Process

1. Create a feature branch
2. Make your changes
3. Add tests
4. Update documentation
5. Run tests
6. Submit PR with clear description

## Questions?

Refer to existing utilities for examples or ask in the PR discussion.
