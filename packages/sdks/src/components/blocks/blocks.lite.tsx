import BlockStyles from '../block/components/block-styles.lite';
import Block from '../block/block.lite';
import type { Signal } from '@builder.io/mitosis';
import { For, Show } from '@builder.io/mitosis';
import type { BlocksWrapperProps } from './blocks-wrapper.lite.jsx';
import BlocksWrapper from './blocks-wrapper.lite.jsx';
import type {
  BuilderContextInterface,
  RegisteredComponent,
} from '../../context/types.js';
import type { Dictionary } from '../../types/typescript';

export type BlocksProps = Partial<BlocksWrapperProps> & {
  context: Signal<BuilderContextInterface>;
  components: Dictionary<RegisteredComponent>;
};

export default function Blocks(props: BlocksProps) {
  return (
    <BlocksWrapper
      blocks={props.blocks}
      parent={props.parent}
      path={props.path}
      styleProp={props.styleProp}
    >
      {/**
       * We need to run two separate loops for content + styles to workaround the fact that Vue 2
       * does not support multiple root elements.
       */}
      <Show when={props.blocks}>
        <For each={props.blocks}>
          {(block) => (
            <Block
              key={'render-block-' + block.id}
              block={block}
              context={props.context}
              components={props.components}
            />
          )}
        </For>
      </Show>
      <Show when={props.blocks}>
        <For each={props.blocks}>
          {(block) => (
            <BlockStyles
              key={'block-style-' + block.id}
              block={block}
              context={props.context.value}
            />
          )}
        </For>
      </Show>
    </BlocksWrapper>
  );
}
