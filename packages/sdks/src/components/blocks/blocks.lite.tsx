import BlockStyles from '../block/components/block-styles.lite.jsx';
import Block from '../block/block.lite.jsx';
import type { Signal } from '@builder.io/mitosis';
import {
  For,
  Show,
  useContext,
  useMetadata,
  useTarget,
} from '@builder.io/mitosis';
import type { BlocksWrapperProps } from './blocks-wrapper.lite.jsx';
import BlocksWrapper from './blocks-wrapper.lite.jsx';
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../context/types.js';
import BuilderContext from '../../context/builder.context.lite.js';
import ComponentsContext from '../../context/components.context.lite.js';

export type BlocksProps = Partial<BlocksWrapperProps> & {
  context?: Signal<BuilderContextInterface>;
  registeredComponents?: RegisteredComponents;
};

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
              registeredComponents={useTarget({
                rsc: props.registeredComponents,
                default:
                  props.registeredComponents ||
                  componentsContext.registeredComponents,
              })}
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
                default: props.context?.value || builderContext.value,
              })}
            />
          )}
        </For>
      </Show>
    </BlocksWrapper>
  );
}
