import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';
import Button from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <div className="text-center p-8 bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200">
            {/* Error Icon with Animation */}
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <AlertCircle className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 bg-red-500 rounded-full mx-auto opacity-20 animate-ping" />
            </div>

            {/* Error Content */}
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We're sorry for the inconvenience. An unexpected error occurred while processing your request.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left bg-gray-50 rounded-lg p-4 border">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Error Details (Development)
                </summary>
                <div className="mt-3 text-xs text-gray-600 font-mono">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-xs">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRefresh}
                className="flex items-center gap-2"
                size="lg"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="flex items-center gap-2"
                size="lg"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 mt-6">
              If this problem persists, please contact support or try again later.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;