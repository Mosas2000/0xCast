# Frontend Unit Testing Guide

## Overview

This project uses Vitest as the test runner with React Testing Library for component tests.

## Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI/CD)
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with interactive UI
npm run test:ui
```

## Test Structure

Tests are organized in `__tests__` directories alongside the code they test:

```
src/
├── components/
│   ├── __tests__/
│   │   ├── Loading.test.tsx
│   │   ├── StatsCard.test.tsx
│   │   └── ErrorMessage.test.tsx
│   ├── Loading.tsx
│   └── ...
├── hooks/
│   ├── __tests__/
│   │   ├── useErrorHandler.test.ts
│   │   └── useMarketFiltering.test.ts
│   └── ...
└── utils/
    ├── __tests__/
    │   ├── helpers.test.ts
    │   ├── validation.test.ts
    │   ├── networkUtils.test.ts
    │   ├── stakingHelpers.test.ts
    │   └── marketCategories.test.ts
    └── ...
```

## Writing Tests

### Utility Function Tests

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myUtils';

describe('myFunction', () => {
  it('returns expected value for valid input', () => {
    expect(myFunction('input')).toBe('expected');
  });

  it('handles edge cases', () => {
    expect(myFunction('')).toBe('default');
  });
});
```

### Hook Tests

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe(null);
  });

  it('updates state correctly', () => {
    const { result } = renderHook(() => useMyHook());
    
    act(() => {
      result.current.setValue('new value');
    });
    
    expect(result.current.value).toBe('new value');
  });
});
```

### Component Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Mocking

### Mocking Modules

```typescript
vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));
```

### Mocking localStorage

```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

## Coverage Thresholds

The project has minimum coverage thresholds configured:

- Statements: 60%
- Branches: 60%
- Functions: 60%
- Lines: 60%

## Test Categories

### Unit Tests (Current)
- Utility functions (helpers, validation, formatting)
- Custom hooks (error handling, state management)
- Component rendering and interactions

### Future Integration Tests
- API mocking with MSW
- Full user flow testing
- Contract interaction mocking

## Best Practices

1. **Test behavior, not implementation** - Focus on what the user sees
2. **Use meaningful test descriptions** - Describe expected behavior
3. **One assertion per test** - Keep tests focused
4. **Mock external dependencies** - Isolate unit under test
5. **Test edge cases** - Empty inputs, nulls, errors
6. **Keep tests fast** - Avoid unnecessary setup
