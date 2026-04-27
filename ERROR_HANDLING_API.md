# Error Handling API Reference

## Table of Contents

1. [Error Classes](#error-classes)
2. [Utilities](#utilities)
3. [Services](#services)
4. [Hooks](#hooks)
5. [Components](#components)

## Error Classes

### ApiError

Base error class for all API-related errors.

```typescript
class ApiError extends Error {
  code: ErrorCode;
  details?: Record<string, any>;
  
  constructor(
    message: string,
    code: ErrorCode,
    details?: Record<string, any>
  );
}
```

**Parameters:**
- `message` (string): Error message
- `code` (ErrorCode): Error code from ErrorCode enum
- `details` (object, optional): Additional error details

**Example:**
```typescript
throw new ApiError('Network request failed', ErrorCode.NETWORK_ERROR, {
  statusCode: 500,
  endpoint: '/api/markets'
});
```

---

### ContractError

Specialized error for smart contract interactions.

```typescript
class ContractError extends ApiError {
  contractName: string;
  functionName: string;
  txId?: string;
  errorCode?: number;
  
  constructor(
    message: string,
    contractName: string,
    functionName: string,
    txId?: string,
    errorCode?: number
  );
  
  static fromClarityError(
    errorCode: number,
    contractName: string,
    functionName: string
  ): ContractError;
}
```

**Parameters:**
- `message` (string): Error message
- `contractName` (string): Name of the contract
- `functionName` (string): Name of the function
- `txId` (string, optional): Transaction ID
- `errorCode` (number, optional): Clarity error code

**Static Methods:**
- `fromClarityError(errorCode, contractName, functionName)`: Creates ContractError from Clarity error code

**Example:**
```typescript
const error = ContractError.fromClarityError(100, 'market-core', 'create-market');
// Returns: ContractError with user-friendly message for error code 100
```

---

### ValidationError

Error for input validation failures.

```typescript
class ValidationError extends ApiError {
  field: string;
  value: any;
  
  constructor(
    message: string,
    field: string,
    value: any
  );
}
```

**Parameters:**
- `message` (string): Error message
- `field` (string): Field that failed validation
- `value` (any): Invalid value

**Example:**
```typescript
throw new ValidationError(
  'Amount must be positive',
  'amount',
  -5
);
```

---

## Utilities

### contractErrorHandler

Utilities for handling contract errors.

#### handleContractCall

Wraps a contract call with error handling.

```typescript
function handleContractCall<T>(
  contractName: string,
  functionName: string,
  operation: () => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: ContractError) => void;
    logErrors?: boolean;
  }
): Promise<ContractCallResult<T>>;
```

**Parameters:**
- `contractName` (string): Name of the contract
- `functionName` (string): Name of the function
- `operation` (function): Async function to execute
- `options` (object, optional):
  - `onSuccess`: Callback on success
  - `onError`: Callback on error
  - `logErrors`: Whether to log errors (default: true)

**Returns:** Promise<ContractCallResult<T>>

**Example:**
```typescript
const result = await handleContractCall(
  'market-core',
  'create-market',
  async () => await createMarket(question, duration),
  {
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.error('Error:', error),
  }
);

if (result.success) {
  console.log('Data:', result.data);
} else {
  console.error('Error:', result.error);
}
```

---

#### parseContractError

Parses contract errors into ContractError instances.

```typescript
function parseContractError(
  error: unknown,
  contractName: string,
  functionName: string
): ContractError;
```

**Parameters:**
- `error` (unknown): Error to parse
- `contractName` (string): Name of the contract
- `functionName` (string): Name of the function

**Returns:** ContractError

**Example:**
```typescript
try {
  await contractCall();
} catch (error) {
  const contractError = parseContractError(error, 'market-core', 'create-market');
  console.log(contractError.message); // User-friendly message
}
```

---

#### getUserFriendlyContractError

Gets user-friendly error message from ContractError.

```typescript
function getUserFriendlyContractError(error: ContractError): string;
```

**Parameters:**
- `error` (ContractError): Contract error

**Returns:** string - User-friendly error message

**Example:**
```typescript
const friendlyMessage = getUserFriendlyContractError(contractError);
toast.error(friendlyMessage);
```

---

#### isTransactionRejection

Checks if error is a transaction rejection.

```typescript
function isTransactionRejection(error: unknown): boolean;
```

**Parameters:**
- `error` (unknown): Error to check

**Returns:** boolean

**Example:**
```typescript
if (isTransactionRejection(error)) {
  console.log('User cancelled the transaction');
}
```

---

#### isInsufficientFunds

Checks if error is due to insufficient funds.

```typescript
function isInsufficientFunds(error: unknown): boolean;
```

**Parameters:**
- `error` (unknown): Error to check

**Returns:** boolean

**Example:**
```typescript
if (isInsufficientFunds(error)) {
  toast.error('Insufficient funds for this transaction');
}
```

---

#### extractTxId

Extracts transaction ID from error.

```typescript
function extractTxId(error: unknown): string | undefined;
```

**Parameters:**
- `error` (unknown): Error to extract from

**Returns:** string | undefined - Transaction ID if found

**Example:**
```typescript
const txId = extractTxId(error);
if (txId) {
  console.log('Transaction ID:', txId);
}
```

---

### retry

Retry utilities with exponential backoff.

#### retryWithBackoff

Retries an operation with exponential backoff.

```typescript
function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config?: RetryConfig
): Promise<T>;

interface RetryConfig {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  shouldRetry?: (error: Error) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}
```

**Parameters:**
- `fn` (function): Async function to retry
- `config` (RetryConfig, optional):
  - `maxRetries`: Maximum retry attempts (default: 3)
  - `initialDelay`: Initial delay in ms (default: 1000)
  - `maxDelay`: Maximum delay in ms (default: 30000)
  - `backoffMultiplier`: Backoff multiplier (default: 2)
  - `jitter`: Add random jitter (default: true)
  - `shouldRetry`: Custom retry logic
  - `onRetry`: Callback on retry

**Returns:** Promise<T>

**Example:**
```typescript
const data = await retryWithBackoff(
  async () => await fetchMarketData(marketId),
  {
    maxRetries: 3,
    initialDelay: 1000,
    onRetry: (error, attempt) => {
      console.log(`Retry attempt ${attempt}:`, error.message);
    },
  }
);
```

---

## Services

### ErrorLoggingService

Centralized error logging service.

```typescript
class ErrorLoggingService {
  constructor(maxLogSize?: number);
  
  logError(
    error: Error,
    context?: ErrorContext,
    severity?: ErrorSeverity
  ): void;
  
  getErrorLogs(): ErrorLog[];
  clearLogs(): void;
  getStatistics(): ErrorStatistics;
  getErrorsByTimeRange(startTime: number, endTime: number): ErrorLog[];
  getErrorsByComponent(component: string): ErrorLog[];
  getErrorsBySeverity(severity: ErrorSeverity): ErrorLog[];
}

interface ErrorContext {
  component?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

interface ErrorLog {
  id: string;
  message: string;
  code?: string;
  severity: ErrorSeverity;
  timestamp: number;
  stack?: string;
  context?: ErrorContext;
}

interface ErrorStatistics {
  totalErrors: number;
  errorsByCode: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  errorsByComponent: Record<string, number>;
  mostRecentError: ErrorLog | null;
}
```

**Example:**
```typescript
import { errorLoggingService } from './services/ErrorLoggingService';

// Log an error
errorLoggingService.logError(
  new Error('Failed to fetch data'),
  {
    component: 'MarketList',
    action: 'fetchMarkets',
    additionalData: { page: 1 },
  },
  'error'
);

// Get statistics
const stats = errorLoggingService.getStatistics();
console.log('Total errors:', stats.totalErrors);

// Get recent errors
const recentErrors = errorLoggingService.getErrorLogs();
```

---

### ApiClient

HTTP client with automatic error handling and retry.

```typescript
class ApiClient {
  constructor(config: ApiClientConfig);
  
  get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>;
  delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
  
  addRequestInterceptor(interceptor: RequestInterceptor): void;
  addResponseInterceptor(interceptor: ResponseInterceptor): void;
}

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  retryConfig?: RetryConfig;
}
```

**Example:**
```typescript
const apiClient = new ApiClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  retryConfig: {
    maxRetries: 3,
    initialDelay: 1000,
  },
});

const response = await apiClient.get('/markets');
console.log(response.data);
```

---

## Hooks

### useApiCall

React hook for API calls with error handling and retry.

```typescript
function useApiCall<T, Args extends any[]>(
  apiFunction: (...args: Args) => Promise<T>,
  options?: UseApiCallOptions<T>
): UseApiCallReturn<T, Args>;

interface UseApiCallOptions<T> {
  maxRetries?: number;
  retryDelay?: number;
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiCallReturn<T, Args extends any[]> {
  execute: (...args: Args) => Promise<void>;
  loading: boolean;
  error: Error | null;
  data: T | null;
  reset: () => void;
}
```

**Example:**
```typescript
function MarketList() {
  const { execute, loading, error, data, reset } = useApiCall(
    async (page: number) => await fetchMarkets(page),
    {
      maxRetries: 3,
      onSuccess: (data) => console.log('Loaded:', data),
      onError: (error) => console.error('Failed:', error),
    }
  );

  return (
    <div>
      <button onClick={() => execute(1)} disabled={loading}>
        Load Markets
      </button>
      {error && <ErrorDisplay error={error} onDismiss={reset} />}
      {data && <MarketGrid markets={data} />}
    </div>
  );
}
```

---

## Components

### ErrorBoundary

React error boundary component.

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps>;
```

**Example:**
```typescript
<ErrorBoundary
  fallback={<div>Something went wrong</div>}
  onError={(error, errorInfo) => {
    console.error('Error caught:', error, errorInfo);
  }}
>
  <App />
</ErrorBoundary>
```

---

### ErrorDisplay

User-friendly error display component.

```typescript
interface ErrorDisplayProps {
  error: Error | string;
  onDismiss?: () => void;
  onRetry?: () => void;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

function ErrorDisplay(props: ErrorDisplayProps): JSX.Element;
```

**Example:**
```typescript
<ErrorDisplay
  error={error}
  onDismiss={() => setError(null)}
  onRetry={() => retryOperation()}
  severity="error"
/>
```

---

### ErrorMonitoringDashboard

Real-time error monitoring dashboard.

```typescript
function ErrorMonitoringDashboard(): JSX.Element;
```

**Example:**
```typescript
function AdminPanel() {
  return (
    <div>
      <h1>Admin Panel</h1>
      <ErrorMonitoringDashboard />
    </div>
  );
}
```

---

## Error Codes

```typescript
enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
```

## Clarity Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| 100 | ERR_UNAUTHORIZED | Caller is not authorized |
| 101 | ERR_NOT_FOUND | Resource not found |
| 102 | ERR_ALREADY_RESOLVED | Market already resolved |
| 103 | ERR_MIN_STAKE_REQUIRED | Stake below minimum |
| 104 | ERR_NO_STAKE_FOUND | No stake found |
| 105 | ERR_NOT_RESOLVED | Market not resolved |
| 106 | ERR_WRONG_SIDE | Staked on losing side |
| 107 | ERR_INSUFFICIENT_BALANCE | Insufficient balance |
| 108 | ERR_CONTRACT_PAUSED | Contract is paused |
| 109 | ERR_RATE_LIMIT | Rate limit exceeded |
