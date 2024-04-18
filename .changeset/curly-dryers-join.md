---
'@builder.io/sdk-react': patch
---

Feature: add `@builder.io/sdk-react/node/init` entry point with `initializeNodeRuntime` export that sets the IVM instance.

This import should be called in a server-only location, such as:

- The NextJS Pages router's `_document.tsx`:

```tsx
// _document.tsx
import { Html, Head, Main, NextScript } from 'next/document';
import { initializeNodeRuntime } from '@builder.io/sdk-react/node/init';
initializeNodeRuntime();

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

- Your Remix route's `loader` responsible for fetching the page content from Builder.io:

```tsx
// ($slug)._index.tsx
import { fetchOneEntry } from '@builder.io/sdk-react';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  // the import must be inside the loader itself.
  const { initializeNodeRuntime } = await import('@builder.io/sdk-react/node/init');
  await initializeNodeRuntime();

  const page = await fetchOneEntry({
    /** */
  });
};
```
