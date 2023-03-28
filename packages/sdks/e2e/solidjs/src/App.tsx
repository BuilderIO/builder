import type { Component } from 'solid-js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RenderContent } from '@builder.io/sdk-solid';
import { getProps } from '@builder.io/sdks-e2e-tests';
import { getCustomComponents } from '@builder.io/sdks-tests-custom-components/output/solid/src/index';

const App: Component = () => {
  const props = { ...getProps(), customComponents: getCustomComponents() };

  return props ? <RenderContent {...props} /> : <div>Content Not Found</div>;
};

export default App;
