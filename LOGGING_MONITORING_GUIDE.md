# Logging and Monitoring System Guide

## Overview

The comprehensive logging and monitoring system provides structured logging, performance tracking, error monitoring, and user action tracking for the 0xCast application.

## Features

- Structured logging with levels (debug, info, warn, error, fatal)
- Request ID tracking for request tracing
- User ID tracking for user action tracking
- Transaction ID tracking for transaction monitoring
- Performance metrics collection
- Error tracking and aggregation
- User action tracking
- Monitoring dashboard
- Log viewer
- Performance monitor

## Architecture

```
┌─────────────────────────────────────────┐
│         UI Components                   │
│  (MonitoringDashboard, LogViewer,       │
│   PerformanceMonitor)                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Hooks Layer                     │
│  (useLogger)                            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Logging & Monitoring Services      │
│  (Logger, MonitoringService)            │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Context Providers                  │
│  (RequestIdProvider, UserIdProvider,    │
│   TransactionIdProvider)                │
└──────────────────────────────────────────┘
```

## Core Components

### Logger

The logger provides structured logging with multiple levels and context support.

```typescript
import { logger } from './utils/logger';

logger.debug('Debug message', { component: 'MyComponent' });
logger.info('Info message', { action: 'myAction' });
logger.warn('Warning message');
logger.error('Error message', { error: errorObject });
logger.fatal('Fatal error', { critical: true });
```

### MonitoringService

The monitoring service tracks performance metrics, errors, and user actions.

```typescript
import { monitoringService } from './services/MonitoringService';

monitoringService.trackPerformance('api_call', 150, 'ms');
monitoringService.trackError('api_error', 'Network error');
monitoringService.trackUserAction('button_click', { button: 'submit' });
monitoringService.trackContractCall('market-core', 'create-market', 250, true);
```

### useLogger Hook

React hook for easy access to logging and monitoring functionality.

```typescript
import { useLogger } from './hooks/useLogger';

function MyComponent() {
  const { info, error, trackPerformance, trackError } = useLogger('MyComponent');

  const handleClick = async () => {
    const startTime = Date.now();
    try {
      await doSomething();
      info('Action completed');
    } catch (err) {
      error('Action failed', { error: err });
      trackError('action_failed', 'Action failed');
    } finally {
      trackPerformance('action_duration', Date.now() - startTime);
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

## Components

### MonitoringDashboard

Real-time monitoring dashboard showing performance metrics, errors, and user actions.

```typescript
import { MonitoringDashboard } from './components/MonitoringDashboard';

<MonitoringDashboard refreshInterval={5000} />
```

### LogViewer

Interactive log viewer with filtering and level selection.

```typescript
import { LogViewer } from './components/LogViewer';

<LogViewer refreshInterval={1000} initialLevel="debug" />
```

### PerformanceMonitor

Performance metrics visualization and tracking.

```typescript
import { PerformanceMonitor } from './components/PerformanceMonitor';

<PerformanceMonitor />
```

### RequestIdProvider

Provides request ID context for request tracing.

```typescript
import { RequestIdProvider } from './components/RequestIdProvider';

<RequestIdProvider>
  <App />
</RequestIdProvider>
```

### UserIdProvider

Provides user ID context for user action tracking.

```typescript
import { UserIdProvider } from './components/UserIdProvider';

<UserIdProvider>
  <App />
</UserIdProvider>
```

### TransactionIdProvider

Provides transaction ID context for transaction monitoring.

```typescript
import { TransactionIdProvider } from './components/TransactionIdProvider';

<TransactionIdProvider>
  <App />
</TransactionIdProvider>
```

## Log Levels

| Level | Priority | Use Case |
|-------|----------|----------|
| debug | 0 | Detailed debugging information |
| info | 1 | General information messages |
| warn | 2 | Warning messages |
| error | 3 | Error messages |
| fatal | 4 | Critical errors |

## Context Fields

### Request ID
Unique identifier for each request, used for tracing requests across the application.

### User ID
User identifier for tracking user actions and associating logs with specific users.

### Transaction ID
Transaction identifier for tracking contract calls and transactions.

### Component
Component name for filtering logs by component.

### Action
Action name for filtering logs by action.

## API Reference

### Logger Methods

```typescript
logger.debug(message: string, context?: Record<string, any>): void;
logger.info(message: string, context?: Record<string, any>): void;
logger.warn(message: string, context?: Record<string, any>): void;
logger.error(message: string, context?: Record<string, any>): void;
logger.fatal(message: string, context?: Record<string, any>): void;

logger.setRequestId(id: string): void;
logger.setUserId(id: string): void;
logger.setTransactionId(id: string): void;

logger.clearRequestId(): void;
logger.clearUserId(): void;
logger.clearTransactionId(): void;

logger.getEntries(): LogEntry[];
logger.getEntriesByLevel(level: LogLevel): LogEntry[];
logger.getEntriesByComponent(component: string): LogEntry[];
logger.getEntriesByRequest(requestId: string): LogEntry[];
logger.getStats(): { total: number; byLevel: Record<string, number> };
```

### MonitoringService Methods

```typescript
monitoringService.trackPerformance(
  name: string,
  value: number,
  unit: 'ms' | 'bytes' | 'count',
  context?: Record<string, any>
): void;

monitoringService.trackError(
  type: string,
  message: string,
  context?: Record<string, any>
): void;

monitoringService.trackUserAction(
  action: string,
  context?: Record<string, any>
): void;

monitoringService.trackContractCall(
  contract: string,
  function: string,
  duration: number,
  success: boolean,
  context?: Record<string, any>
): void;

monitoringService.trackPageView(
  page: string,
  context?: Record<string, any>
): void;

monitoringService.trackButtonClick(
  button: string,
  context?: Record<string, any>
): void;

monitoringService.trackTransaction(
  type: string,
  status: string,
  duration: number,
  context?: Record<string, any>
): void;

monitoringService.getPerformanceMetrics(): PerformanceMetric[];
monitoringService.getErrorMetrics(): ErrorMetric[];
monitoringService.getUserActions(): UserAction[];
monitoringService.getPerformanceStats(): PerformanceStats;
monitoringService.getErrorStats(): ErrorStats;
monitoringService.getRecentUserActions(count: number): UserAction[];

monitoringService.clearAllMetrics(): void;
monitoringService.clearPerformanceMetrics(): void;
monitoringService.clearErrorMetrics(): void;
monitoringService.clearUserActions(): void;
```

### useLogger Hook

```typescript
const {
  debug,
  info,
  warn,
  error,
  fatal,
  setRequestId,
  setUserId,
  setTransactionId,
  clearRequestId,
  clearUserId,
  clearTransactionId,
  getEntries,
  getEntriesByLevel,
  getEntriesByComponent,
  getEntriesByRequest,
  getStats,
  trackPerformance,
  trackError,
  trackUserAction,
  trackContractCall,
  trackPageView,
  trackButtonClick,
  trackTransaction,
} = useLogger(component?: string);
```

## Testing

Run tests:
```bash
npm test
```

Test files:
- `logger.test.ts` - Logger utility tests
- `MonitoringService.test.ts` - Monitoring service tests
- `useLogger.test.ts` - useLogger hook tests

## Best Practices

1. **Use appropriate log levels**
   - debug: Detailed debugging information
   - info: General information
   - warn: Warning messages
   - error: Error messages
   - fatal: Critical errors

2. **Include context**
   - Always include component name
   - Include action name when applicable
   - Include relevant data in context

3. **Use request IDs**
   - Set request ID at the start of each request
   - Use request ID for tracing

4. **Track user actions**
   - Track important user actions
   - Include relevant context

5. **Monitor performance**
   - Track API call durations
   - Track contract call durations
   - Track transaction durations

6. **Handle errors properly**
   - Log errors with full context
   - Track error metrics
   - Include stack traces

## Example Integration

```typescript
import { RequestIdProvider, UserIdProvider, TransactionIdProvider } from './components/RequestIdProvider';
import { useLogger } from './hooks/useLogger';

function App() {
  return (
    <RequestIdProvider>
      <UserIdProvider>
        <TransactionIdProvider>
          <MainApp />
        </TransactionIdProvider>
      </UserIdProvider>
    </RequestIdProvider>
  );
}

function MainApp() {
  const { info, error, trackPerformance, trackError } = useLogger('MainApp');

  useEffect(() => {
    info('Application started');
  }, []);

  return <div>App</div>;
}

function MyComponent() {
  const { info, error, trackPerformance, trackError } = useLogger('MyComponent');

  const handleClick = async () => {
    const startTime = Date.now();
    try {
      info('Button clicked');
      await doSomething();
      info('Action completed');
    } catch (err) {
      error('Action failed', { error: err });
      trackError('action_failed', 'Action failed');
    } finally {
      trackPerformance('action_duration', Date.now() - startTime);
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

## Migration from console.log

Replace:
```typescript
console.log('Message');
console.error('Error');
```

With:
```typescript
logger.info('Message');
logger.error('Error', { component: 'MyComponent' });
```

## Future Enhancements

1. Integration with external logging services (Sentry, LogRocket)
2. Real-time log streaming
3. Advanced filtering and search
4. Log export functionality
5. Alerting for critical errors
6. Performance dashboards
7. Error analytics
8. User behavior analytics
