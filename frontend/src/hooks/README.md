# React Hooks

This directory contains custom React hooks used throughout the 0xCast application.

## Available Hooks

### useMarketFiltering
Comprehensive market filtering, sorting, and categorization hook with URL synchronization support.

**Features:**
- Category-based filtering
- Status filtering (Active/Resolved)
- Text search with debouncing
- Time and volume range filtering
- Watchlist integration
- Multiple sort options
- URL parameter synchronization
- Recent search history

**Usage:**
```tsx
import { useMarketFiltering } from './hooks/useMarketFiltering';

function MarketsPage() {
  const { filteredMarkets, setCategory, setSearchQuery } = useMarketFiltering({
    markets: allMarkets,
    syncWithUrl: true
  });
  
  return (
    <div>
      <input onChange={(e) => setSearchQuery(e.target.value)} />
      {filteredMarkets.map(market => (
        <MarketCard key={market.id} market={market} />
      ))}
    </div>
  );
}
```

### useContract
Contract interaction hook for Stacks smart contracts.

### useWallet
Wallet connection and state management.

### useMarkets
Market data fetching and caching.

## Testing

All hooks have corresponding test files in the `__tests__` directory.

Run tests with:
```bash
npm test
```

## Contributing

When adding new hooks:
1. Add comprehensive JSDoc documentation
2. Create corresponding test file
3. Update this README
4. Follow existing naming conventions
