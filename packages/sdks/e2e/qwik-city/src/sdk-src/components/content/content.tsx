import Blocks from '../blocks/blocks';

import EnableEditor from './components/enable-editor';

import type { ContentProps } from './content.types';

import { component$, useStore } from '@builder.io/qwik';

export const ContentComponent = component$((props: ContentProps) => {
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
      <div>
        in CONTENT:{' '}
        {
          state.builderContextSignal?.content?.data?.blocks[0]?.children?.[1]
            ?.component.options.columns[0].blocks[1].component.options.text
        }
      </div>
      <Blocks
        blocks={state.builderContextSignal.content?.data?.blocks}
      ></Blocks>
    </EnableEditor>
  );
});

export default ContentComponent;
