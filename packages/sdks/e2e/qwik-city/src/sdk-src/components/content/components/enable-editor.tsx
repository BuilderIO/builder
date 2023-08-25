import { Slot, component$, useStore } from '@builder.io/qwik';
import type { Content } from '../content.types';

const NEW_CONTENT = {
  blocks: ['NEW text'],
  id: 'foo',
};

export const EnableEditor = component$((props: { x: { content: Content } }) => {
  const state = useStore({
    forceReRenderCount: 0,
  });
  return (
    <>
      <button
        onClick$={() => {
          const newContentValue = { ...props.x.content, ...NEW_CONTENT };

          console.log(newContentValue);

          props.x.content = newContentValue;
          state.forceReRenderCount++;
        }}
      >
        update me
      </button>
      <div key={state.forceReRenderCount}>
        <Slot></Slot>
      </div>
    </>
  );
});

export default EnableEditor;
