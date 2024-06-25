import type { Component } from 'solid-js';
import { createResource, Show } from 'solid-js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { _processContentResult, Content } from '@builder.io/sdk-solid';
import { getProps } from '@sdk/tests';

const App: Component = () => {
  const [props] = createResource(() => getProps({ _processContentResult }));

  return (
    <Show
      when={!props.loading && !props.error}
      fallback={<div>Content Not Found</div>}
    >
      {() => <Content {...props()} />}
    </Show>
  );
};

export default App;
