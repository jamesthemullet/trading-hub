import { Component, type ErrorInfo, type ReactNode } from 'react';

import { reportErrorToDynatrace } from '@/libs/utils/dynatrace';

import { Button } from '../button/button';
import styles from './error-boundary.module.css';

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
    reportErrorToDynatrace(error, {
      'error.componentStack': errorInfo.componentStack,
    });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.({ error, info: errorInfo });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className={styles.fallbackContainer}>
            <h1>Something went wrong</h1>
            <p>
              We&apos;re sorry, but something unexpected happened. Please try
              refreshing the page.
            </p>
            <Button
              type="button"
              onClick={() => window.location.reload()}
              className={styles.refreshButton}
            >
              Refresh Page
            </Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
