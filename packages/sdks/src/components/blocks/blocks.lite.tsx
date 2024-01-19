import type { Signal } from '@builder.io/mitosis';
import {
  For,
  Show,
  useContext,
  useMetadata,
  useTarget,
} from '@builder.io/mitosis';
import BuilderContext from '../../context/builder.context.lite.js';
import ComponentsContext from '../../context/components.context.lite.js';
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../context/types.js';
import Block from '../block/block.lite.jsx';
import type { BlocksWrapperProps } from './blocks-wrapper.lite.jsx';
import BlocksWrapper from './blocks-wrapper.lite.jsx';

export type BlocksProps = Partial<
  Omit<BlocksWrapperProps, 'BlocksWrapper' | 'BlocksWrapperProps'>
> & {
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
      BlocksWrapper={props.context?.value?.BlocksWrapper}
      BlocksWrapperProps={props.context?.value?.BlocksWrapperProps}
    >
      <Show when={props.blocks}>
        <For each={props.blocks}>
          {(block) => (
            <Block
              key={block.id}
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
    </BlocksWrapper>
  );
}
