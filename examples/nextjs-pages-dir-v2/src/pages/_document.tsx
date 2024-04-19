import { HydrationOverlay } from '@builder.io/react-hydration-overlay';
import { Head, Html, Main, NextScript } from 'next/document';

import { initializeNodeRuntime } from '@builder.io/sdk-react/node/init';
initializeNodeRuntime();

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <HydrationOverlay>
          <Main />
        </HydrationOverlay>
        <NextScript />
      </body>
    </Html>
  );
}
