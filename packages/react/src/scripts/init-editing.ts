import { SDK_VERSION } from '../sdk-version';

if (typeof window !== 'undefined') {
  window.parent?.postMessage(
    {
      type: 'builder.isReactSdk',
      data: {
        value: true,
        supportsPatchUpdates: 'v4',
        supportsCustomBreakpoints: true,
        supportsXSmallBreakpoint: true,
        supportsGlobalSymbols: true,
        blockLevelPersonalization: true,
        version: SDK_VERSION,
      },
    },
    '*'
  );
}
