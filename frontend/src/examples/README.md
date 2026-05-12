# Example Components

This directory contains reference implementations demonstrating best practices for using the 0xCast platform features.

## Purpose

These examples serve as:
- **Learning Resources** - Show how to properly use hooks, utilities, and types
- **Reference Implementations** - Demonstrate best practices and patterns
- **Starting Points** - Can be copied and adapted for actual features
- **Documentation** - Provide working code examples alongside written docs

## Available Examples

### MarketCreationExample.tsx

Complete example of creating a prediction market with:
- Form validation using `validateMarketCreation()`
- Character count tracking
- Duration calculation and display
- Wallet connection checking
- Error handling and user feedback
- Accessibility features (ARIA labels, error announcements)
- Loading states

**Key Features Demonstrated:**
```typescript
import { useContract } from '../hooks/useContract';
import { validateMarketCreation } from '../utils/marketValidation';

// Validate before submission
const result = validateMarketCreation({
  title,
  description,
  durationBlocks
});

if (result.isValid) {
  await createMarket(title, durationBlocks);
}
```

**Usage:**
```typescript
import { MarketCreationExample } from './examples/MarketCreationExample';

function App() {
  return <MarketCreationExample />;
}
```

### PredictionExample.tsx

Complete example of placing predictions with:
- BigInt amount handling
- Amount parsing and formatting
- Outcome selection (YES/NO)
- Real-time validation
- Prediction summary calculation
- Type-safe enum usage

**Key Features Demonstrated:**
```typescript
import {
  useContract,
  parseToMicroAmount,
  formatMicroAmount,
  validateTransactionAmount
} from '../hooks/useContract';
import { MarketOutcome } from '../types/market';

// Parse user input to BigInt
const amountMicroStx = parseToMicroAmount(amountInput);

// Validate amount
const validation = validateTransactionAmount(amountMicroStx);

// Place prediction with type-safe outcome
await predict(marketId, 'yes', amountMicroStx);
```

**Usage:**
```typescript
import { PredictionExample } from './examples/PredictionExample';

function MarketDetail({ market }: { market: Market }) {
  return (
    <PredictionExample 
      market={market}
      onSuccess={() => console.log('Prediction placed!')}
    />
  );
}
```

## Common Patterns

### 1. Form Validation

All examples demonstrate proper form validation:

```typescript
// Validate individual fields
const titleResult = validateMarketTitle(title);
if (!titleResult.isValid) {
  setError(titleResult.error);
  return;
}

// Validate complete data
const result = validateMarketCreation(data);
if (!result.isValid) {
  setErrors({ [result.field!]: result.error });
  return;
}
```

### 2. BigInt Handling

Examples show proper BigInt usage for token amounts:

```typescript
// Parse user input
const amount = parseToMicroAmount('10.5'); // 10_500_000n

// Validate amount
const validation = validateTransactionAmount(amount);

// Format for display
const display = formatMicroAmount(amount); // "10.5"

// Use in contract call
await predict(marketId, outcome, amount);
```

### 3. Error Handling

Consistent error handling pattern:

```typescript
try {
  await contractCall();
  // Success feedback
  toast.success('Operation successful!');
} catch (error) {
  // Error is logged by useContract
  // Show user-friendly message
  toast.error('Operation failed. Please try again.');
}
```

### 4. Wallet Connection

Check wallet connection before operations:

```typescript
if (!isConnected || !address) {
  setError('Please connect your wallet');
  return;
}
```

### 5. Loading States

Manage loading states during async operations:

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    await operation();
  } finally {
    setIsSubmitting(false);
  }
};

// Disable button during submission
<button disabled={isSubmitting}>
  {isSubmitting ? 'Processing...' : 'Submit'}
</button>
```

### 6. Type Safety

Use type-safe enums and type guards:

```typescript
import { MarketStatus, MarketOutcome, isMarket } from '../types/market';

// Use enums instead of magic numbers
if (market.status === MarketStatus.ACTIVE) { }

// Validate runtime data
const data = await fetchMarket(id);
if (isMarket(data)) {
  // TypeScript knows data is Market type
}
```

## Best Practices Demonstrated

### Accessibility

- Proper ARIA labels and descriptions
- Error announcements with `role="alert"`
- Keyboard navigation support
- Form field associations
- Disabled state handling

```typescript
<input
  aria-invalid={!!error}
  aria-describedby={error ? 'field-error' : undefined}
/>
{error && (
  <span id="field-error" role="alert">
    {error}
  </span>
)}
```

### User Experience

- Real-time validation feedback
- Character count displays
- Loading indicators
- Success/error messages
- Helpful hints and guidelines

### Code Organization

- Separate concerns (validation, formatting, contract calls)
- Reusable utility functions
- Type-safe implementations
- Comprehensive comments
- Example CSS included

### Performance

- Memoized calculations
- Debounced inputs (where appropriate)
- Efficient re-renders
- Optimized validation

## Using These Examples

### As Learning Resources

1. Read through the code and comments
2. Understand the patterns and practices
3. Note how utilities and hooks are used
4. See how errors are handled

### As Starting Points

1. Copy the example file
2. Rename and adapt to your needs
3. Modify the UI and styling
4. Add additional features

### As Reference

1. Refer to examples when implementing similar features
2. Copy specific patterns (validation, error handling, etc.)
3. Use as a checklist for best practices

## Testing Examples

While these are example components, they demonstrate testable patterns:

```typescript
// Test validation logic
describe('Form validation', () => {
  it('should validate market creation data', () => {
    const result = validateMarketCreation({
      title: 'Valid title here',
      description: 'Valid description here',
      durationBlocks: 144
    });
    expect(result.isValid).toBe(true);
  });
});

// Test amount parsing
describe('Amount handling', () => {
  it('should parse amounts correctly', () => {
    const amount = parseToMicroAmount('10.5');
    expect(amount).toBe(10_500_000n);
  });
});
```

## Contributing

When adding new examples:

1. **Follow Existing Patterns**
   - Use the same structure and style
   - Include comprehensive comments
   - Add example CSS

2. **Demonstrate Best Practices**
   - Proper validation
   - Error handling
   - Type safety
   - Accessibility

3. **Include Documentation**
   - Explain what the example demonstrates
   - List key features
   - Provide usage examples
   - Update this README

4. **Make It Complete**
   - Full working implementation
   - All edge cases handled
   - User feedback included
   - Loading states managed

## Related Documentation

- [Hooks Documentation](../hooks/README.md)
- [Utils Documentation](../utils/README.md)
- [Types Documentation](../types/README.md)
- [Integration Guide](../../docs/integration-guide.md)
- [API Reference](../../docs/api-reference.md)

## Notes

- These examples are for reference and learning
- They may not be production-ready without additional features
- Adapt styling to match your design system
- Add additional validation as needed for your use case
- Consider adding more sophisticated error handling for production
