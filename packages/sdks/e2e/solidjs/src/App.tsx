import type { Component } from 'solid-js';
import { createResource, Show } from 'solid-js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RenderContent } from '@builder.io/sdk-solid';
import { getProps } from '@builder.io/sdks-e2e-tests';

const App: Component = () => {
  const [props] = createResource(() => getProps());

  return (
    <Show
      when={!props.loading && !props.error}
      fallback={<div>Content Not Found</div>}
    >
      {() => <RenderContent {...props()} />}
    </Show>
  );
};

export default App;
