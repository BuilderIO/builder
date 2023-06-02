import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import { createEffect, createSignal } from 'solid-js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RenderContent } from '@builder.io/sdk-solid';
import { getProps } from '@builder.io/sdks-e2e-tests';

const App: Component = () => {
  const [props, setProps] = createSignal<object | null>(null);

  createEffect(() => {
    getProps().then((content) => {
      setProps(content);
    });
  });

  return (
    <Show when={props} fallback={<div>Content Not Found</div>}>
      {() => <RenderContent {...props()} />}
    </Show>
  );
};

export default App;
