import type { Component } from 'solid-js';
import { createResource, Show } from 'solid-js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { _processContentResult, RenderContent } from '@builder.io/sdk-solid';
import { getProps } from '@e2e/tests';

const App: Component = () => {
  const [props] = createResource(() => getProps({ _processContentResult }));

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
