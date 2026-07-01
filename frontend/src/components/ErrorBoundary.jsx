import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 max-w-md">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-4">Something went wrong</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
              An unexpected error occurred. Please try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors cursor-pointer text-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
