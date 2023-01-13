import type { Component } from 'solid-js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RenderContent } from '@builder.io/sdk-solid';
import { getProps } from '@builder.io/sdks-e2e-tests';

const App: Component = () => {
  const props = getProps();

  return props ? <RenderContent {...props} /> : <div>Content Not Found</div>;
};

export default App;
