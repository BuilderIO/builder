import Blocks from '../blocks/blocks';
import EnableEditor from './components/enable-editor';
import { component$, useStore } from '@builder.io/qwik';

export const ContentComponent = component$((props) => {
  const state = useStore<any>(
    {
      builderContextSignal: {
        content: JSON.parse(JSON.stringify(props.content)),
      },
    },
    { deep: true }
  );

  return (
    <EnableEditor builderContextSignal={state.builderContextSignal}>
      <Blocks
        blocks={state.builderContextSignal.content?.data?.blocks}
      ></Blocks>
    </EnableEditor>
  );
});

export default ContentComponent;
