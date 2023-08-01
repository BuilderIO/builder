import { version } from '../../package.json';

if (typeof window !== 'undefined') {
  window.parent?.postMessage(
    {
      type: 'builder.isReactSdk',
      data: {
        value: true,
        supportsPatchUpdates: 'v4',
        supportsCustomBreakpoints: true,
        supportsGlobalSymbols: true,
        priorVersion: version,
      },
    },
    '*'
  );
}
