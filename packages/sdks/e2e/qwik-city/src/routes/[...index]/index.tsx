import { getProps } from '@builder.io/sdks-e2e-tests';
import { RenderContent } from '@builder.io/sdk-qwik';
import type { Signal } from '@builder.io/qwik';
import { useStyles$ } from '@builder.io/qwik';
import { useContextProvider } from '@builder.io/qwik';
import {
  component$,
  createContextId,
  useContext,
  useSignal,
  useStore,
} from '@builder.io/qwik';
type Props = { data: string };

const contextId = createContextId<{ count: Signal<number> }>('test');

const Button = component$(() => {
  const context = useContext(contextId);
  return (
    <button
      onClick$={() => {
        context.count.value++;
      }}
    >
      Increment Number
    </button>
  );
});

const Counter = component$(() => {
  const context = useContext(contextId);
  return <div>Count is: {context.count.value}</div>;
});

const RenderContent2 = component$<Props>((props) => {
  // useVisibleTask$(() => {
  //   console.log('RENDERCONTENT: test', props.data);
  // });

  useStyles$(`
    .div {
      border: 1px solid red;
      padding: 18px;
    }
  `);
  return (
    <div class="div">
      {/* Hello RenderContent {props.data} */}
      Inside RenderContent:
      <Button />
      <Counter />
    </div>
  );
});

import { useLocation } from '@builder.io/qwik-city';

export default component$(() => {
  const { url } = useLocation();
  const state = useStore({
    data: 'world',
  });

  const containerStr = useSignal('');

  useContextProvider(contextId, {
    count: useSignal(0),
  });

  // useTask$(async () => {
  //   console.log('in-app manifest', { manifest });
  //   // console.log('useTask$', global.SYMBOL_MAPPER);
  //   const result = await renderToString(
  //     <template>
  //       <RenderContent2 data={state.data} />
  //     </template>,
  //     {
  //       containerTagName: 'div',
  //       manifest: global.MANIFEST,
  //       symbolMapper: global.SYMBOL_MAPPER,
  //     }
  //   );

  //   containerStr.value = result.html;
  // });

  const contentProps = getProps(url.pathname);
  return contentProps ? (
    <RenderContent {...contentProps} />
  ) : (
    <div>Content Not Found</div>
  );
  useStyles$(`
    .div2 {
      border: 1px solid blue;
      padding: 18px;
      margin-bottom: 18px;
      }`);
  return (
    <div class="div2">
      User app:
      <div>
        <Button />
        <Counter />
      </div>
      <div dangerouslySetInnerHTML={containerStr.value}></div>
      <RenderContent data={state.data} />
    </div>
  );
});
