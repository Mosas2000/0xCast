import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Link } from 'react-router-dom';

interface PageErrorBoundaryProps {
  children: ReactNode;
  pageName?: string;
}

interface PageErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * PageErrorBoundary Component
 * 
 * A lighter error boundary for individual pages/routes.
 * Shows error within the app layout (header/footer remain visible).
 */
export class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  constructor(props: PageErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<PageErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`PageErrorBoundary [${this.props.pageName || 'Unknown'}]:`, error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, pageName } = this.props;

    if (hasError) {
      return (
        <div className="pt-[72px] min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">
              {pageName ? `Error loading ${pageName}` : 'Page Error'}
            </h2>
            <p className="text-neutral-400 mb-6">
              Something went wrong while loading this page.
            </p>
            
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-left">
                <p className="text-xs text-amber-400 font-mono break-all">
                  {error.message}
                </p>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors text-sm"
              >
                Try Again
              </button>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors text-sm"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default PageErrorBoundary;
