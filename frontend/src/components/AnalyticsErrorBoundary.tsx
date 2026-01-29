import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class AnalyticsErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Analytics Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-12 text-center bg-red-50 rounded-3xl border border-red-100">
                    <h2 className="text-2xl font-black text-red-900 mb-2">Something went wrong.</h2>
                    <p className="text-red-700">We couldn't load the analytics data. Please try refreshing.</p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-6 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.children;
    }
}
