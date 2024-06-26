import * as React from 'react';

export const ErrorMessage = () => (
  <div
    css={{
      margin: 15,
      borderRadius: 4,
      border: '1px solid rgba(150, 0, 0, 0.35)',
      color: 'rgba(150, 0, 0, 1)',
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      padding: 15,
      fontSize: 14,
      textAlign: 'center',
    }}
  >
    Oh no! We had an error :( Try{' '}
    <a
      onClick={() => location.reload()}
      css={{ color: 'steelblue', cursor: 'pointer', fontWeight: 'bold' }}
    >
      refreshing this page
    </a>{' '}
    and{' '}
    <a
      css={{ color: 'steelblue', cursor: 'pointer', fontWeight: 'bold' }}
      onClick={() => {
        (window as any).Intercom('showNewMesage', 'I am getting an error - please help');
      }}
    >
      chat us
    </a>{' '}
    or contact{' '}
    <a
      css={{ color: 'steelblue', cursor: 'pointer', fontWeight: 'bold' }}
      target="_blank"
      href="mailto:help@builder.io"
    >
      help@builder.io
    </a>{' '}
    if this continues
  </div>
);

/**
 * Provides error boundaries for safety (one component errors won't crash the whole app)
 */
export class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorMessage />;
    }

    return this.props.children;
  }
}
