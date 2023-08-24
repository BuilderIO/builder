import type { BuilderContent } from '~/sdk-src/types/builder-content';
import Blocks from '../blocks/blocks';
import EnableEditor from './components/enable-editor';
import { component$, useStore } from '@builder.io/qwik';

export const ContentComponent = component$(
  (props: { content: BuilderContent }) => {
    const state = useStore<any>(
      {
        builderContextSignal: {
          content: { ...props.content },
        },
      },
      { deep: true }
    );

    return (
      <EnableEditor
        // LOOK HERE!!!
        // COMMENT THIS `content` PROP OUT TO SEE THE CODE WORK.
        content={props.content}
        builderContextSignal={state.builderContextSignal}
      >
        <Blocks
          blocks={state.builderContextSignal.content?.data?.blocks}
        ></Blocks>
      </EnableEditor>
    );
  }
);

export default ContentComponent;
