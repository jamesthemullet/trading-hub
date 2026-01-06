import { Component, type ErrorInfo, type ReactNode } from 'react';

import { reportErrorToDynatrace } from '@/libs/utils/dynatrace';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (args: { error: Error; info: ErrorInfo }) => void;
};

type State = {
  hasError: boolean;
};

const initialState: State = { hasError: false };

export class ErrorBoundary extends Component<Props, State> {
  state = initialState;

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (prevState.hasError && prevProps.children !== this.props.children) {
      this.setState(initialState);
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportErrorToDynatrace(error);
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.({ error, info: errorInfo });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              marginTop: '100px',
            }}
          >
            <h1>Something went wrong</h1>
            <p>
              We&apos;re sorry, but something unexpected happened. Please try
              refreshing the page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                cursor: 'pointer',
              }}
            >
              Refresh Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
