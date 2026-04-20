# Portfolio Recommendations Best Practices Guide

Professional guidelines for using the portfolio rebalancing recommendation system effectively.

## Architecture Best Practices

### Service Organization
- Keep services stateless for better testability
- Use composition instead of inheritance
- Separate concerns: analysis, recommendations, performance
- Export stable APIs from services

```typescript
// Good: Stateless service with clear methods
class PortfolioAnalysisService {
  static analyzePortfolio(portfolio: Portfolio): PortfolioAnalysis {}
  static calculateRiskMetrics(portfolio: Portfolio): RiskMetrics {}
}

// Avoid: Stateful services with instance methods
class PortfolioAnalyzer {
  portfolio: Portfolio;
  analyze() {}
}
```

### Hook Design
- Use custom hooks for component state management
- Handle loading/error states properly
- Memoize callbacks to prevent unnecessary renders
- Return consistent object structure

```typescript
const {
  metrics,           // Data
  loading,           // Loading state
  error,             // Error state
  analyzePortfolio,  // Action
  updateMetrics,     // Action
} = usePortfolioAnalysis(userId);
```

## Performance Best Practices

### Analysis Optimization
- Cache analysis results when portfolio hasn't changed
- Use pagination for portfolios with 100+ positions
- Debounce frequent analysis requests
- Consider analysis frequency (hourly, daily, etc.)

```typescript
const cachedAnalysis = useMemo(() => {
  if (prevPortfolio === portfolio) return prevAnalysis;
  return analyzePortfolio(portfolio);
}, [portfolio, prevPortfolio, prevAnalysis]);
```

### Memory Management
- Clear old historical data regularly
- Limit recommendation history to 90 days
- Remove completed recommendations after review
- Use pagination for large datasets

### Network Efficiency
- Batch multiple requests when possible
- Use conditional requests (skip if unchanged)
- Implement request deduplication
- Cache frequently accessed data

```typescript
// Good: Batch requests
Promise.all([
  analyzePortfolio(portfolio),
  generateRecommendations(portfolio),
  compareWithBenchmark(portfolio, 'SP500'),
])

// Avoid: Sequential requests
await analyzePortfolio(portfolio);
await generateRecommendations(portfolio);
await compareWithBenchmark(portfolio, 'SP500');
```

## Data Validation Best Practices

### Input Validation
Always validate portfolio data before analysis:

```typescript
import { PortfolioValidator } from '@/utils/portfolioValidators';

const result = PortfolioValidator.validatePortfolio(portfolio);
if (!result.valid) {
  console.error(result.errors);
  return null;
}

const analysis = PortfolioAnalysisService.analyzePortfolio(portfolio);
```

### Error Handling
- Validate inputs at service entry points
- Provide meaningful error messages
- Use error boundaries for UI
- Log errors for debugging

```typescript
try {
  const metrics = PortfolioAnalysisService.calculateRiskMetrics(portfolio);
} catch (error) {
  console.error('Risk calculation failed:', error);
  return {
    metrics: null,
    error: PortfolioFormatters.formatErrorMessage(error),
  };
}
```

## Type Safety Best Practices

### Use Strict Types
- Always annotate portfolio data structures
- Use union types for exclusive states
- Leverage discriminated unions for recommendations
- Avoid `any` type

```typescript
// Good: Specific types
function analyzePortfolio(portfolio: Portfolio): PortfolioAnalysis {}

// Avoid: Generic/any types
function analyzePortfolio(data: any): any {}
```

### Interface Segregation
- Keep interfaces focused on single responsibility
- Extend common base types
- Use composition of types

```typescript
// Good: Focused interfaces
interface PortfolioPosition {
  // Position data only
}

interface RiskMetrics {
  // Risk metrics only
}

// Avoid: God object interface
interface PortfolioData {
  // Position, metrics, history, everything...
}
```

## Testing Best Practices

### Unit Test Coverage
- Test all recommendation types
- Verify metrics calculations
- Test edge cases (zero positions, negative values, etc.)
- Test error scenarios

```typescript
describe('RecommendationEngineService', () => {
  it('generates rebalancing recommendations for unbalanced portfolio', () => {
    const portfolio = createMockPortfolioUnbalanced();
    const recommendations = RecommendationEngineService.generateRebalancingRecommendations(portfolio);
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it('handles empty portfolio gracefully', () => {
    const portfolio = createMockPortfolio({ positions: [] });
    const recommendations = RecommendationEngineService.generateRecommendations(portfolio);
    expect(recommendations).toBeDefined();
  });
});
```

### Integration Testing
- Test hook + service integration
- Test recommendation acceptance workflow
- Test optimization application
- Test error recovery

### Mock Data
- Use `portfolioTestFixtures.ts` for consistent test data
- Create fixtures for different scenarios
- Keep mocks realistic and representative

```typescript
import { createMockPortfolio, createMockRecommendation } from '@/utils/portfolioTestFixtures';

const portfolio = createMockPortfolio();
const recommendation = createMockRecommendation();
```

## State Management Best Practices

### Hook State Management
- Use hooks for local component state
- Lift state up when needed across components
- Consider Redux/Zustand for complex state
- Use context for global portfolio settings

### Recommendation Workflow
- Separate pending, accepted, rejected states
- Track recommendation history
- Implement snooze functionality
- Clean up expired recommendations

```typescript
const [recommendations, setRecommendations] = useState<PortfolioRecommendation[]>([]);
const [accepted, setAccepted] = useState<Set<string>>(new Set());
const [rejected, setRejected] = useState<Set<string>>(new Set());
```

## UI/UX Best Practices

### User Feedback
- Show loading states during analysis
- Display clear success/error messages
- Provide explanations for recommendations
- Show confidence scores visibly

### Presentation
- Format numbers consistently (currency, percentages)
- Use color coding for risk levels
- Show visual indicators (charts, bars, gauges)
- Make recommendations actionable

```typescript
<RecommendationCard
  recommendation={rec}
  onAccept={handleAccept}
  onReject={handleReject}
  showConfidence={true}
  showExpiry={true}
/>
```

### Accessibility
- Use semantic HTML
- Add ARIA labels for charts
- Ensure color isn't the only indicator
- Support keyboard navigation

## Configuration Best Practices

### Constants Management
- Store all thresholds in `portfolioConstants.ts`
- Make configuration environment-specific
- Don't hardcode business rules
- Document why thresholds exist

```typescript
// Good: Configured
const CONCENTRATION_THRESHOLD = PORTFOLIO_CONSTANTS.CONCENTRATION_RISK_THRESHOLD;

// Avoid: Hardcoded
const CONCENTRATION_THRESHOLD = 0.6;
```

### Customization
- Allow users to customize risk preferences
- Support different allocation models
- Enable threshold adjustments
- Respect user preferences over time

## Documentation Best Practices

### Code Documentation
- Document complex algorithms
- Add examples for public functions
- Explain assumptions and limitations
- Document calculation methodologies

```typescript
/**
 * Calculate portfolio's Sharpe ratio
 * Formula: (mean_return - risk_free_rate) / volatility
 * Annualized with 252 trading days
 * 
 * @param positions - Portfolio positions
 * @param riskFreeRate - Risk-free rate (default 2%)
 * @returns Sharpe ratio value
 */
static calculateSharpeRatio(
  positions: PortfolioPosition[],
  riskFreeRate = 0.02
): number {}
```

### Integration Documentation
- Provide usage examples
- Show common patterns
- Document limitations
- Include troubleshooting guide

## Security Best Practices

### Data Protection
- Validate all user inputs
- Sanitize portfolio data
- Protect sensitive calculations
- Use secure data transmission

### Error Messages
- Don't leak implementation details
- Provide helpful user messages
- Log errors securely
- Avoid exposing sensitive data

```typescript
// Good: Safe error message
throw new Error('Portfolio analysis failed');

// Avoid: Leaking details
throw new Error('Database connection to portfolio_service failed at 192.168.1.1');
```

## Performance Monitoring Best Practices

### Metrics to Track
- Analysis execution time
- Recommendation generation time
- Hook render count
- Cache hit rate
- Error frequency

```typescript
performance.mark('portfolio-analysis-start');
const metrics = analyzePortfolio(portfolio);
performance.mark('portfolio-analysis-end');
performance.measure('portfolio-analysis', 'portfolio-analysis-start', 'portfolio-analysis-end');
```

### Optimization Strategies
- Profile before optimizing
- Use React DevTools Profiler
- Monitor bundle size
- Track memory usage

## Maintenance Best Practices

### Code Quality
- Keep services DRY (Don't Repeat Yourself)
- Use utility functions for common operations
- Refactor complex methods
- Keep methods focused

### Versioning
- Follow semantic versioning
- Document breaking changes
- Provide migration guides
- Maintain backward compatibility

### Deprecation
- Mark deprecated methods with warnings
- Provide replacement guidance
- Support deprecated features for 2+ versions
- Clear deprecation timeline

---

## Common Pitfalls to Avoid

1. **Hardcoding business logic**
   - Store rules in constants/config
   - Make thresholds configurable

2. **Ignoring edge cases**
   - Handle zero/negative positions
   - Test with single position portfolios
   - Validate empty recommendations

3. **Poor error handling**
   - Always handle promise rejections
   - Provide recovery mechanisms
   - Log errors appropriately

4. **Inefficient calculations**
   - Cache expensive computations
   - Debounce frequent requests
   - Use pagination for large data

5. **Type unsafety**
   - Avoid `any` type
   - Use strict TypeScript
   - Validate runtime data

6. **Stale recommendations**
   - Expire old recommendations
   - Refresh when portfolio changes
   - Remove completed recommendations

---

**Version**: 1.0.0  
**Status**: Production Ready
