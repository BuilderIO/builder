import { TARGET } from '../../constants/target.js';
import BuilderContext from '../../context/builder.context.lite';
import { getBlockActions } from '../../functions/get-block-actions.js';
import { getBlockComponentOptions } from '../../functions/get-block-component-options.js';
import { getBlockProperties } from '../../functions/get-block-properties.js';
import { getBlockStyles } from '../../functions/get-block-styles.js';
import { getBlockTag } from '../../functions/get-block-tag.js';
import { getProcessedBlock } from '../../functions/get-processed-block.js';
import { BuilderBlock } from '../../types/builder-block.js';
import BlockStyles from './block-styles.lite';
import {
  For,
  Show,
  useContext,
  useMetadata,
  useState,
} from '@builder.io/mitosis';

export type RenderBlockProps = {
  block: BuilderBlock;
};

useMetadata({
  elementTag: 'state.tagName',
});

export default function RenderBlock(props: RenderBlockProps) {
  const builderContext = useContext(BuilderContext);

  const state = useState({
    get component() {
      const componentName = state.useBlock.component?.name;
      if (!componentName) {
        return null;
      }

      const ref = builderContext.registeredComponents[componentName];

      if (!ref) {
        // TODO: Public doc page with more info about this message
        console.warn(`
          Could not find a registered component named "${componentName}". 
          If you registered it, is the file that registered it imported by the file that needs to render it?`);
        return undefined;
      } else {
        return ref;
      }
    },
    get componentInfo() {
      return state.component?.info;
    },
    get componentRef() {
      return state.component?.component;
    },
    get tagName() {
      return getBlockTag(state.useBlock);
    },
    get useBlock(): BuilderBlock {
      return getProcessedBlock({
        block: props.block,
        state: builderContext.state,
        context: builderContext.context,
      });
    },
    get propertiesAndActions() {
      return {
        ...getBlockProperties(state.useBlock),
        ...getBlockActions({
          block: state.useBlock,
          state: builderContext.state,
          context: builderContext.context,
        }),
      };
    },
    get css() {
      return getBlockStyles(state.useBlock);
    },
    get componentOptions() {
      return getBlockComponentOptions(state.useBlock);
    },
    get children() {
      // TO-DO: When should `canHaveChildren` dictate rendering?
      // This is currently commented out because some Builder components (e.g. Box) do not have `canHaveChildren: true`,
      // but still receive and need to render children.
      // return state.componentInfo?.canHaveChildren ? state.useBlock.children : [];
      return state.useBlock.children ?? [];
    },
    get noCompRefChildren() {
      return state.componentRef ? [] : state.children;
    },
  });

  return (
    <>
      <Show
        when={!state.componentInfo?.noWrap}
        else={
          <state.componentRef
            attributes={state.propertiesAndActions}
            {...state.componentOptions}
            builderBlock={state.useBlock}
            style={state.css}
          >
            <For each={state.children}>
              {(child) => <RenderBlock key={child.id} block={child} />}
            </For>
          </state.componentRef>
        }
      >
        <state.tagName {...state.propertiesAndActions} style={state.css}>
          <Show when={TARGET === 'vue' || TARGET === 'svelte'}>
            <BlockStyles block={state.useBlock} />
          </Show>
          {state.componentRef && (
            <state.componentRef
              {...state.componentOptions}
              builderBlock={state.useBlock}
            >
              <For each={state.children}>
                {(child) => <RenderBlock key={child.id} block={child} />}
              </For>
            </state.componentRef>
          )}
          <For each={state.noCompRefChildren}>
            {(child) => <RenderBlock key={child.id} block={child} />}
          </For>
        </state.tagName>
      </Show>
    </>
  );
}
