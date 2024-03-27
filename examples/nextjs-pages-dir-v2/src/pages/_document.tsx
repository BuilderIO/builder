import ivm from 'isolated-vm';
import { Head, Html, Main, NextScript } from 'next/document';
const isolate = new ivm.Isolate();
const context = isolate.createContextSync();
console.log({ context });

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
