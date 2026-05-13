# Oracle Validators

Consolidated validation system for oracle data with shared base classes and common utilities.

## Architecture

### BaseValidator

Abstract base class providing common validation patterns:

- Field validation with custom validators
- Error collection and aggregation
- Standard interface for all validators

### CommonValidators

Utility class with reusable validation functions:

- Number validation (positive, ratio, finite)
- String validation (length, format)
- Timestamp validation
- Array validation
- Object validation
- Sanitization utilities

## Validators

### PriceDataValidator

Validates oracle price data:

- Price value (positive number)
- Timestamp (valid time)
- Source (non-empty string)
- Confidence (0-1 ratio)

### AggregationDataValidator

Validates aggregated price data:

- All price data fields
- Sources array (non-empty)
- Consensus flag (boolean)
- Aggregation method (string)

### ProviderHealthValidator

Validates provider health metrics:

- Provider ID
- Success rate (0-1)
- Uptime (0-1)
- Average latency
- Response and error counts
- Health score (0-1)
- Includes warnings for low performance

### ConfigurationValidator

Validates oracle configuration:

- Market ID format
- Provider ID format
- Threshold values
- Timeframe values

## Usage

```typescript
import { PriceDataValidator } from '@/utils/validators';

const validator = new PriceDataValidator();

const isValid = validator.isValid(priceData);

const result = validator.validate(priceData);
if (!result.valid) {
  console.error(result.errors);
}

const sanitized = validator.sanitize(priceData);
```

## Benefits

- Reduced code duplication
- Consistent validation patterns
- Easier to maintain and extend
- Type-safe validation
- Reusable validation logic
