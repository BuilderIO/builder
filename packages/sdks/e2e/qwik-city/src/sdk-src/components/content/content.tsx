import Blocks from '../blocks/blocks';

import EnableEditor from './components/enable-editor';

import { component$, useStore } from '@builder.io/qwik';
import type { Content } from './content.types';

export const ContentComponent = component$((props: { content: Content }) => {
  const state = useStore(
    { x: { content: JSON.parse(JSON.stringify(props.content)) } },
    { deep: true }
  );

  return (
    <EnableEditor x={state.x}>
      <Blocks x={state.x}></Blocks>
    </EnableEditor>
  );
});

export default ContentComponent;
