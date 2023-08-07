import BlockStyles from '../block/components/block-styles.lite';
import type { BlockProps } from '../block/block.lite';
import Block from '../block/block.lite';
import {
  For,
  Show,
  useContext,
  useMetadata,
  useTarget,
} from '@builder.io/mitosis';
import type { BlocksWrapperProps } from './blocks-wrapper.lite';
import BlocksWrapper from './blocks-wrapper.lite';
import BuilderContext from '../../context/builder.context.lite';
import ComponentsContext from '../../context/components.context.lite';

export type BlocksProps = Partial<BlocksWrapperProps> &
  Omit<BlockProps, 'block'>;

useMetadata({
  rsc: {
    componentType: 'server',
  },
});

export default function Blocks(props: BlocksProps) {
  const builderContext = useContext(BuilderContext);
  const componentsContext = useContext(ComponentsContext);

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
              context={useTarget({
                rsc: props.context,
                default: props.context || builderContext,
              })}
              components={useTarget({
                rsc: props.components,
                default:
                  props.components || componentsContext.registeredComponents,
              })}
              serverExecutor={props.serverExecutor}
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
              context={useTarget({
                rsc: props.context?.value,
                default: props.context.value || builderContext.value,
              })}
              serverExecutor={props.serverExecutor}
            />
          )}
        </For>
      </Show>
    </BlocksWrapper>
  );
}
