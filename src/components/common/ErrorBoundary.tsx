import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900/50 rounded-2xl border border-rose-800/60 m-4">
          <div className="p-3 bg-rose-950/70 rounded-full border border-rose-700 mb-3">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-base font-bold text-white mb-1">
            {this.props.fallbackTitle || 'Component Encountered an Error'}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mb-4 font-mono">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Component State</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
