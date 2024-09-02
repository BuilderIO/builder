---
'@builder.io/sdk-qwik': patch
---

Feature: add `@builder.io/sdk-qwik/node/init` entry point with `initializeNodeRuntime` export that sets the IVM instance.

This import should be called in a server-only location such as,

```tsx
// entry.ssr.tsx
import { renderToStream, type RenderToStreamOptions } from '@builder.io/qwik/server';
import { manifest } from '@qwik-client-manifest';
import Root from './root';
import { initializeNodeRuntime } from '@builder.io/sdk-qwik/node/init';

initializeNodeRuntime();

export default function (opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    manifest,
    ...opts,
    // ...
  });
}
```
