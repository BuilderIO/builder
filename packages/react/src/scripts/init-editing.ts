import { version } from '../../package.json';

if (typeof window !== 'undefined') {
  window.parent?.postMessage(
    {
      type: 'builder.isReactSdk',
      data: {
        value: true,
        supportsPatchUpdates: 'v3',
        priorVersion: version,
      },
    },
    '*'
  );
}
