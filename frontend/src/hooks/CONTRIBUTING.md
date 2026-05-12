# Contributing to Hooks

Thank you for contributing to the 0xCast hooks library!

## Guidelines

### Creating New Hooks

1. **Naming Convention**
   - Use camelCase starting with "use" (e.g., `useMarketData`)
   - Name should clearly describe the hook's purpose

2. **File Structure**
   ```
   hooks/
   ├── useMyHook.ts          # Hook implementation
   ├── __tests__/
   │   └── useMyHook.test.ts # Unit tests
   └── __docs__/
       └── useMyHook.md      # Detailed documentation
   ```

3. **Documentation Requirements**
   - Add comprehensive JSDoc comments
   - Include usage examples
   - Document all parameters and return values
   - Add inline comments for complex logic

4. **Testing Requirements**
   - Write unit tests for all functionality
   - Test edge cases and error conditions
   - Aim for >80% code coverage
   - Use `@testing-library/react` for hook testing

5. **Code Quality**
   - Follow TypeScript strict mode
   - No `any` types (use `unknown` with type guards)
   - Handle all error cases
   - Clean up effects and subscriptions

### Example Hook Template

```typescript
/**
 * Brief description of what the hook does
 * 
 * @param param1 - Description of parameter
 * @returns Description of return value
 * 
 * @example
 * ```tsx
 * const { data, loading } = useMyHook(param);
 * ```
 */
export function useMyHook(param: string) {
  const [state, setState] = useState<Type>(initialValue);
  
  useEffect(() => {
    // Effect logic
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  return { state, setState };
}
```

### Pull Request Process

1. Create a feature branch with descriptive name
2. Write comprehensive commit messages
3. Ensure all tests pass
4. Update documentation
5. Request review from maintainers

### Code Review Checklist

- [ ] Hook follows naming conventions
- [ ] Comprehensive JSDoc documentation
- [ ] Unit tests with good coverage
- [ ] No TypeScript errors or warnings
- [ ] ESLint passes without errors
- [ ] README updated if needed
- [ ] CHANGELOG updated

## Questions?

Open an issue or reach out to the maintainers.
