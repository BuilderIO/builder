import {
  For,
  Show,
  useContext,
  useMetadata,
  useTarget,
} from '@builder.io/mitosis';
import BuilderContext from '../../context/builder.context.lite.js';
import ComponentsContext from '../../context/components.context.lite.js';
import Block from '../block/block.lite.jsx';
import BlocksWrapper from './blocks-wrapper.lite.jsx';
import type { BlocksProps } from './blocks.types.js';

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
              linkComponent={props.linkComponent}
            />
          )}
        </For>
      </Show>
    </BlocksWrapper>
  );
}
