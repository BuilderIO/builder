import React from 'react';
import { logger } from '../helpers/logger';

export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { hasError: boolean }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logger.error(
      'ErrorBoundary caught error:',
      info.error,
      info.componentStack
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <p>
          Builder.io SDK: error while rendering block. See console for full
          logs.
        </p>
      );
    }

    return this.props.children;
  }
}
