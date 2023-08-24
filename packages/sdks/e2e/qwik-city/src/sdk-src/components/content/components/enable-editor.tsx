import type { BuilderContent } from '~/sdk-src/types/builder-content';
import builderContext from '../../../context/builder.context';
import type { BuilderContextInterface } from '../../../context/types';
import {
  $,
  Slot,
  component$,
  useContextProvider,
  useStore,
} from '@builder.io/qwik';

type BuilderEditorProps = {
  builderContextSignal: BuilderContextInterface;
  children?: any;
  content: BuilderContent;
};

export const EnableEditor = component$((props: BuilderEditorProps) => {
  const state = useStore(
    {
      forceReRenderCount: 0,
    },
    { deep: true }
  );
  useContextProvider(builderContext, props.builderContextSignal);

  return (
    <>
      RERENDER_COUNT: {state.forceReRenderCount}
      <button
        onClick$={$(() => {
          props.builderContextSignal.content!.data!.blocks![0].component!.options.columns[0].blocks[0].component.options.text =
            'UPDATED TEXT';

          state.forceReRenderCount++;
        })}
      >
        UPDATE TEXT
      </button>
      <div key={state.forceReRenderCount}>
        <Slot></Slot>
      </div>
    </>
  );
});

export default EnableEditor;
