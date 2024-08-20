import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

class LogRowErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('Error caught in LogRowErrorBoundary: ', error, info);
  }

  render() {
    const { hasError } = this.state;
    const { fallback, children } = this.props;
    if (hasError) {
      // You can render any custom fallback UI
      return fallback;
    }

    return children;
  }
}

export default LogRowErrorBoundary;
