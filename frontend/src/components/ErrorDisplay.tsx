import React from 'react';
import { ApiError, ErrorCode } from '../utils/apiErrors';

interface ErrorDisplayProps {
  error: ApiError | Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  className = '',
}) => {
  if (!error) {
    return null;
  }

  const apiError = error instanceof ApiError ? error : ApiError.fromError(error);

  const getIcon = () => {
    switch (apiError.code) {
      case ErrorCode.NETWORK_ERROR:
      case ErrorCode.TIMEOUT_ERROR:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      case ErrorCode.UNAUTHORIZED:
      case ErrorCode.FORBIDDEN:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const getSeverityColor = () => {
    switch (apiError.code) {
      case ErrorCode.NETWORK_ERROR:
      case ErrorCode.TIMEOUT_ERROR:
      case ErrorCode.RPC_ERROR:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case ErrorCode.UNAUTHORIZED:
      case ErrorCode.FORBIDDEN:
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case ErrorCode.TRANSACTION_REJECTED:
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <div className={`error-display rounded-lg border p-4 ${getSeverityColor()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>

        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {apiError.code === ErrorCode.TRANSACTION_REJECTED
              ? 'Transaction Cancelled'
              : 'Error'}
          </h3>

          <div className="mt-2 text-sm">
            <p>{apiError.message}</p>

            {apiError.retryable && apiError.retryAfter && (
              <p className="mt-1 text-xs opacity-75">
                Please wait {apiError.retryAfter} seconds before retrying.
              </p>
            )}
          </div>

          {showDetails && apiError.data && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs opacity-75 hover:opacity-100">
                Technical details
              </summary>
              <pre className="mt-1 text-xs bg-black bg-opacity-10 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(apiError.data, null, 2)}
              </pre>
            </details>
          )}

          <div className="mt-3 flex gap-2">
            {onRetry && apiError.retryable && (
              <button
                onClick={onRetry}
                className="text-sm font-medium hover:underline focus:outline-none"
              >
                Try Again
              </button>
            )}

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm font-medium hover:underline focus:outline-none"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-auto flex-shrink-0 inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 focus:outline-none"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
