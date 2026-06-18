/**
 * Error Handling Components and Hooks
 * 
 * This module provides a comprehensive error handling solution:
 * 
 * Components:
 * - ErrorBoundary: App-level error catching (class component)
 * - PageErrorBoundary: Page-level error catching
 * - ErrorMessage: Reusable error display component
 * 
 * Hooks:
 * - useErrorHandler: Error state management for functional components
 * 
 * Usage:
 * 
 * 1. Wrap your app with ErrorBoundary:
 *    <ErrorBoundary>
 *      <App />
 *    </ErrorBoundary>
 * 
 * 2. Wrap individual pages with PageErrorBoundary:
 *    <PageErrorBoundary pageName="Markets">
 *      <MarketsPage />
 *    </PageErrorBoundary>
 * 
 * 3. Use useErrorHandler in functional components:
 *    const { error, handleError, clearError } = useErrorHandler();
 * 
 * 4. Display errors with ErrorMessage:
 *    <ErrorMessage error={error} onDismiss={clearError} />
 */

export { ErrorBoundary } from '@/components/ErrorBoundary';
export { PageErrorBoundary } from '@/components/PageErrorBoundary';
export { ErrorMessage } from '@/components/ErrorMessage';
export { useErrorHandler } from '@/hooks/useErrorHandler';
