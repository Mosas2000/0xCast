# React Hooks

This directory contains custom React hooks used throughout the 0xCast application.

## Contract Interaction Hooks

### useContract

Main hook for interacting with Stacks smart contracts.

**Location:** `useContract.ts`

**Features:**
- Market creation
- Prediction placement
- Winnings claiming
- Token staking/unstaking
- Token transfers
- BigInt amount handling
- Automatic error handling and logging

**Exports:**
```typescript
// Hook
export function useContract(): {
  createMarket: (question: string, durationBlocks: number) => Promise<void>;
  predict: (marketId: number, outcome: 'yes' | 'no', amountMicroStx: bigint) => Promise<void>;
  claimWinnings: (marketId: number) => Promise<void>;
  stakeTokens: (amountMicroOxc: bigint) => Promise<void>;
  unstakeTokens: (amountMicroOxc: bigint) => Promise<void>;
  transferTokens: (recipient: string, amountMicroOxc: bigint, memo?: string) => Promise<void>;
  isConnected: boolean;
  address: string | undefined;
  contractAddress: string;
}

// Utility Functions
export const safeBigIntToNumber: (value: bigint, paramName?: string) => number;
export const isSafeBigInt: (value: bigint) => boolean;
export const formatMicroAmount: (microAmount: bigint) => string;
export const parseToMicroAmount: (amount: string) => bigint;
export const validateTransactionAmount: (microAmount: bigint) => { isValid: boolean; error?: string };
export const buildMemoCV: (memo?: string) => OptionalClarityValue;
export const isValidMemo: (memo?: string) => boolean;
export const getMemoRemainingBytes: (memo: string) => number;

// Read-only Functions
export async function getMarket(marketId: number): Promise<any>;
export async function getMarketCount(): Promise<number>;
export async function getStake(stakerAddress: string): Promise<any>;
export async function getTotalStaked(): Promise<bigint>;

// Constants
export const MAX_SAFE_INTEGER: number;
export const MAX_SAFE_OXC_AMOUNT: number;
export const MAX_MEMO_LENGTH: number; // 34 bytes per SIP-010
```

**Example Usage:**

```typescript
import { useContract, parseToMicroAmount, formatMicroAmount } from '@/hooks/useContract';
import { validatePredictionAmount } from '@/utils/marketValidation';

function PredictionForm({ marketId }: { marketId: number }) {
  const { predict, isConnected } = useContract();
  const [amount, setAmount] = useState('');
  const [outcome, setOutcome] = useState<'yes' | 'no'>('yes');

  const handlePredict = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    // Parse user input to BigInt micro-amount
    const amountMicroStx = parseToMicroAmount(amount);

    // Validate amount
    const validation = validatePredictionAmount(amountMicroStx);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      await predict(marketId, outcome, amountMicroStx);
      toast.success('Prediction placed successfully!');
    } catch (error) {
      // Error is already logged by useContract
      toast.error('Failed to place prediction');
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handlePredict(); }}>
      <input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in STX"
      />
      <select value={outcome} onChange={(e) => setOutcome(e.target.value as 'yes' | 'no')}>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
      <button type="submit">Place Prediction</button>
    </form>
  );
}
```

**BigInt Handling:**

The hook uses BigInt for all token amounts to preserve precision:

```typescript
// Converting user input to BigInt
const userInput = '10.5'; // 10.5 STX
const microAmount = parseToMicroAmount(userInput); // 10_500_000n

// Formatting BigInt for display
const displayAmount = formatMicroAmount(10_500_000n); // "10.5"

// Validating amounts before transactions
const validation = validateTransactionAmount(microAmount);
if (!validation.isValid) {
  console.error(validation.error);
}

// Safe conversion to Number (for uintCV)
try {
  const numberValue = safeBigIntToNumber(microAmount, 'amount');
  // Use numberValue in contract call
} catch (error) {
  console.error('Amount too large for safe conversion');
}
```

**Memo Handling:**

Token transfers support optional memos (max 34 bytes per SIP-010):

```typescript
const { transferTokens } = useContract();

// Check memo validity
if (!isValidMemo(memo)) {
  toast.error('Memo too long');
  return;
}

// Check remaining bytes
const remaining = getMemoRemainingBytes(memo);
console.log(`${remaining} bytes remaining`);

// Transfer with memo
await transferTokens(
  'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  10_000_000n,
  'Payment for services'
);
```

## State Management Hooks

### useMarketFiltering

Hook for filtering and sorting markets.

**Location:** `useMarketFiltering.ts`

**Features:**
- Search by title/description
- Filter by category
- Filter by status
- Filter by time range
- Filter by volume range
- Sort by multiple criteria
- URL state synchronization

## Network Hooks

### useNetwork

Hook for managing network state (mainnet/testnet).

**Location:** Available through NetworkContext

## Wallet Hooks

### useWallet

Hook for wallet connection and state.

**Location:** Available through WalletProvider

## Best Practices

### Error Handling

1. **Let useContract handle errors:**
   ```typescript
   // Good - useContract logs errors automatically
   try {
     await predict(marketId, outcome, amount);
     toast.success('Success!');
   } catch (error) {
     toast.error('Failed');
   }
   
   // Bad - don't log errors manually
   try {
     await predict(marketId, outcome, amount);
   } catch (error) {
     console.error(error); // Already logged by useContract
   }
   ```

2. **Check wallet connection:**
   ```typescript
   if (!isConnected) {
     toast.error('Please connect your wallet');
     return;
   }
   ```

3. **Validate inputs before contract calls:**
   ```typescript
   const validation = validatePredictionAmount(amount);
   if (!validation.isValid) {
     toast.error(validation.error);
     return;
   }
   ```

### BigInt Usage

1. **Always use BigInt for amounts:**
   ```typescript
   // Good
   const amount: bigint = 10_000_000n;
   
   // Bad
   const amount: number = 10000000;
   ```

2. **Parse user input to BigInt:**
   ```typescript
   const userInput = '10.5';
   const amount = parseToMicroAmount(userInput);
   ```

3. **Format BigInt for display:**
   ```typescript
   const display = formatMicroAmount(amount);
   ```

4. **Validate before conversion:**
   ```typescript
   if (isSafeBigInt(amount)) {
     const numberValue = safeBigIntToNumber(amount);
   }
   ```

### Performance

1. **Memoize expensive operations:**
   ```typescript
   const formattedAmount = useMemo(
     () => formatMicroAmount(amount),
     [amount]
   );
   ```

2. **Debounce user input:**
   ```typescript
   const debouncedSearch = useMemo(
     () => debounce(handleSearch, 300),
     []
   );
   ```

## Testing

All hooks should have corresponding unit tests in the `__tests__` directory.

**Example test structure:**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useContract } from '../useContract';

describe('useContract', () => {
  it('should format micro amounts correctly', () => {
    const formatted = formatMicroAmount(10_500_000n);
    expect(formatted).toBe('10.5');
  });

  it('should parse amounts correctly', () => {
    const amount = parseToMicroAmount('10.5');
    expect(amount).toBe(10_500_000n);
  });
});
```

## Contributing

When adding new hooks:

1. Add comprehensive JSDoc documentation
2. Include usage examples in comments
3. Write unit tests
4. Update this README
5. Follow existing naming conventions
6. Handle errors appropriately
7. Consider performance implications

## Related Documentation

- [Contract Integration Guide](../../docs/integration-guide.md)
- [Error Handling Guide](../../docs/error-handling.md)
- [API Reference](../../docs/api-reference.md)
- [Utils Documentation](../utils/README.md)
