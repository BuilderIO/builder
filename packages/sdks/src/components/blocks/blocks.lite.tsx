import BlockStyles from '../block/components/block-styles.lite';
import Block from '../block/block.lite';
import type { Signal } from '@builder.io/mitosis';
import { For, Show, useMetadata } from '@builder.io/mitosis';
import type { BlocksWrapperProps } from './blocks-wrapper.lite';
import BlocksWrapper from './blocks-wrapper.lite';
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../context/types.js';

export type BlocksProps = Partial<BlocksWrapperProps> & {
  context: Signal<BuilderContextInterface>;
  registeredComponents: RegisteredComponents;
};

useMetadata({
  rsc: {
    componentType: 'server',
  },
});

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
              registeredComponents={props.registeredComponents}
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
