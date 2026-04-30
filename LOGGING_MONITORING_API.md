# Logging and Monitoring API Reference

## Table of Contents

1. [Logger](#logger)
2. [MonitoringService](#monitoringservice)
3. [useLogger Hook](#uselogger-hook)
4. [Components](#components)
5. [Types](#types)

## Logger

### LogEntry Interface

```typescript
interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  requestId?: string;
  userId?: string;
  transactionId?: string;
  component?: string;
  action?: string;
  stack?: string;
}
```

### LoggerConfig Interface

```typescript
interface LoggerConfig {
  level?: LogLevel;
  includeTimestamp?: boolean;
  includeRequestId?: boolean;
  includeUserId?: boolean;
  includeComponent?: boolean;
  includeAction?: boolean;
  includeStack?: boolean;
  maxEntries?: number;
}
```

### Logger Methods

#### debug

```typescript
debug(message: string, context?: Record<string, any>): void;
```

Logs a debug message.

#### info

```typescript
info(message: string, context?: Record<string, any>): void;
```

Logs an info message.

#### warn

```typescript
warn(message: string, context?: Record<string, any>): void;
```

Logs a warning message.

#### error

```typescript
error(message: string, context?: Record<string, any>): void;
```

Logs an error message.

#### fatal

```typescript
fatal(message: string, context?: Record<string, any>): void;
```

Logs a fatal error message.

#### setRequestId

```typescript
setRequestId(id: string): void;
```

Sets the request ID.

#### setUserId

```typescript
setUserId(id: string): void;
```

Sets the user ID.

#### setTransactionId

```typescript
setTransactionId(id: string): void;
```

Sets the transaction ID.

#### clearRequestId

```typescript
clearRequestId(): void;
```

Clears the request ID.

#### clearUserId

```typescript
clearUserId(): void;
```

Clears the user ID.

#### clearTransactionId

```typescript
clearTransactionId(): void;
```

Clears the transaction ID.

#### getEntries

```typescript
getEntries(): LogEntry[];
```

Returns all log entries.

#### getEntriesByLevel

```typescript
getEntriesByLevel(level: LogLevel): LogEntry[];
```

Returns log entries filtered by level.

#### getEntriesByComponent

```typescript
getEntriesByComponent(component: string): LogEntry[];
```

Returns log entries filtered by component.

#### getEntriesByRequest

```typescript
getEntriesByRequest(requestId: string): LogEntry[];
```

Returns log entries filtered by request ID.

#### clearEntries

```typescript
clearEntries(): void;
```

Clears all log entries.

#### getStats

```typescript
getStats(): {
  total: number;
  byLevel: Record<string, number>;
};
```

Returns log statistics.

## MonitoringService

### PerformanceMetric Interface

```typescript
interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  context?: Record<string, any>;
}
```

### ErrorMetric Interface

```typescript
interface ErrorMetric {
  type: string;
  message: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  context?: Record<string, any>;
}
```

### MonitoringConfig Interface

```typescript
interface MonitoringConfig {
  enabled?: boolean;
  logErrors?: boolean;
  trackPerformance?: boolean;
  trackUserActions?: boolean;
  trackContractCalls?: boolean;
  maxMetrics?: number;
}
```

### MonitoringService Methods

#### trackPerformance

```typescript
trackPerformance(
  name: string,
  value: number,
  unit: 'ms' | 'bytes' | 'count' = 'ms',
  context?: Record<string, any>
): void;
```

Tracks a performance metric.

#### trackError

```typescript
trackError(
  type: string,
  message: string,
  context?: Record<string, any>
): void;
```

Tracks an error.

#### trackUserAction

```typescript
trackUserAction(
  action: string,
  context?: Record<string, any>
): void;
```

Tracks a user action.

#### trackContractCall

```typescript
trackContractCall(
  contract: string,
  function: string,
  duration: number,
  success: boolean,
  context?: Record<string, any>
): void;
```

Tracks a contract call.

#### trackPageView

```typescript
trackPageView(
  page: string,
  context?: Record<string, any>
): void;
```

Tracks a page view.

#### trackButtonClick

```typescript
trackButtonClick(
  button: string,
  context?: Record<string, any>
): void;
```

Tracks a button click.

#### trackTransaction

```typescript
trackTransaction(
  type: string,
  status: string,
  duration: number,
  context?: Record<string, any>
): void;
```

Tracks a transaction.

#### getPerformanceMetrics

```typescript
getPerformanceMetrics(): PerformanceMetric[];
```

Returns all performance metrics.

#### getPerformanceMetricsByName

```typescript
getPerformanceMetricsByName(name: string): PerformanceMetric[];
```

Returns performance metrics filtered by name.

#### getPerformanceStats

```typescript
getPerformanceStats(): {
  total: number;
  byName: Record<string, number>;
  avgByName: Record<string, number>;
};
```

Returns performance statistics.

#### getErrorMetrics

```typescript
getErrorMetrics(): ErrorMetric[];
```

Returns all error metrics.

#### getErrorMetricsByType

```typescript
getErrorMetricsByType(type: string): ErrorMetric[];
```

Returns error metrics filtered by type.

#### getErrorStats

```typescript
getErrorStats(): {
  total: number;
  byType: Record<string, number>;
  byMessage: Record<string, number>;
};
```

Returns error statistics.

#### getUserActions

```typescript
getUserActions(): Array<{ action: string; timestamp: number; context?: Record<string, any> }>;
```

Returns all user actions.

#### getUserActionsByType

```typescript
getUserActionsByType(action: string): Array<{ action: string; timestamp: number; context?: Record<string, any> }>;
```

Returns user actions filtered by type.

#### getRecentUserActions

```typescript
getRecentUserActions(count: number = 10): Array<{ action: string; timestamp: number; context?: Record<string, any> }>;
```

Returns recent user actions.

#### clearAllMetrics

```typescript
clearAllMetrics(): void;
```

Clears all metrics.

#### clearPerformanceMetrics

```typescript
clearPerformanceMetrics(): void;
```

Clears performance metrics.

#### clearErrorMetrics

```typescript
clearErrorMetrics(): void;
```

Clears error metrics.

#### clearUserActions

```typescript
clearUserActions(): void;
```

Clears user actions.

## useLogger Hook

### UseLoggerReturn Interface

```typescript
interface UseLoggerReturn {
  debug: (message: string, context?: Record<string, any>) => void;
  info: (message: string, context?: Record<string, any>) => void;
  warn: (message: string, context?: Record<string, any>) => void;
  error: (message: string, context?: Record<string, any>) => void;
  fatal: (message: string, context?: Record<string, any>) => void;
  setRequestId: (id: string) => void;
  setUserId: (id: string) => void;
  setTransactionId: (id: string) => void;
  clearRequestId: () => void;
  clearUserId: () => void;
  clearTransactionId: () => void;
  getEntries: () => LogEntry[];
  getEntriesByLevel: (level: LogLevel) => LogEntry[];
  getEntriesByComponent: (component: string) => LogEntry[];
  getEntriesByRequest: (requestId: string) => LogEntry[];
  getStats: () => { total: number; byLevel: Record<string, number> };
  trackPerformance: (
    name: string,
    value: number,
    unit?: 'ms' | 'bytes' | 'count',
    context?: Record<string, any>
  ) => void;
  trackError: (type: string, message: string, context?: Record<string, any>) => void;
  trackUserAction: (action: string, context?: Record<string, any>) => void;
  trackContractCall: (
    contract: string,
    function: string,
    duration: number,
    success: boolean,
    context?: Record<string, any>
  ) => void;
  trackPageView: (page: string, context?: Record<string, any>) => void;
  trackButtonClick: (button: string, context?: Record<string, any>) => void;
  trackTransaction: (
    type: string,
    status: string,
    duration: number,
    context?: Record<string, any>
  ) => void;
}
```

### useLogger Function

```typescript
function useLogger(component?: string): UseLoggerReturn;
```

Returns a useLoggerReturn object with all logging and monitoring methods.

## Components

### MonitoringDashboard

```typescript
interface MonitoringDashboardProps {
  refreshInterval?: number;
}
```

### LogViewer

```typescript
interface LogViewerProps {
  refreshInterval?: number;
  initialLevel?: LogLevel;
}
```

### PerformanceMonitor

No props required.

### RequestIdProvider

```typescript
interface RequestIdProviderProps {
  children: React.ReactNode;
}
```

### UserIdProvider

```typescript
interface UserIdProviderProps {
  children: React.ReactNode;
}
```

### TransactionIdProvider

```typescript
interface TransactionIdProviderProps {
  children: React.ReactNode;
}
```

## Types

### LogLevel

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
```

### LogEntry

```typescript
interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  requestId?: string;
  userId?: string;
  transactionId?: string;
  component?: string;
  action?: string;
  stack?: string;
}
```

### PerformanceMetric

```typescript
interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  context?: Record<string, any>;
}
```

### ErrorMetric

```typescript
interface ErrorMetric {
  type: string;
  message: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  context?: Record<string, any>;
}
```

### UserAction

```typescript
interface UserAction {
  action: string;
  timestamp: number;
  context?: Record<string, any>;
}
```

### PerformanceStats

```typescript
interface PerformanceStats {
  total: number;
  byName: Record<string, number>;
  avgByName: Record<string, number>;
}
```

### ErrorStats

```typescript
interface ErrorStats {
  total: number;
  byType: Record<string, number>;
  byMessage: Record<string, number>;
}
```

## Constants

```typescript
const DEFAULT_LOG_LEVEL: LogLevel = 'info';
const DEFAULT_MAX_ENTRIES: number = 1000;
const DEFAULT_MAX_METRICS: number = 10000;
```

## Usage Examples

### Basic Logging

```typescript
import { logger } from './utils/logger';

logger.info('Application started');
logger.error('Error occurred', { error: errorObject });
```

### Using useLogger Hook

```typescript
import { useLogger } from './hooks/useLogger';

function MyComponent() {
  const { info, error, trackPerformance } = useLogger('MyComponent');

  const handleClick = async () => {
    const startTime = Date.now();
    try {
      info('Button clicked');
      await doSomething();
      info('Action completed');
    } catch (err) {
      error('Action failed', { error: err });
    } finally {
      trackPerformance('action_duration', Date.now() - startTime);
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### Using MonitoringService

```typescript
import { monitoringService } from './services/MonitoringService';

monitoringService.trackPerformance('api_call', 150, 'ms');
monitoringService.trackError('api_error', 'Network error');
monitoringService.trackUserAction('button_click', { button: 'submit' });
```

### Using Context Providers

```typescript
import { RequestIdProvider, UserIdProvider, TransactionIdProvider } from './components/RequestIdProvider';

<RequestIdProvider>
  <UserIdProvider>
    <TransactionIdProvider>
      <App />
    </TransactionIdProvider>
  </UserIdProvider>
</RequestIdProvider>
```
