import { useState, Show, useContext, For } from '@builder.io/mitosis';
import { getBlockComponentOptions } from '../functions/get-block-component-options';
import { getBlockProperties } from '../functions/get-block-properties';
import { getBlockStyles } from '../functions/get-block-styles';
import { getBlockTag } from '../functions/get-block-tag';
import { components } from '../functions/register-component';
import { BuilderBlock } from '../types/builder-block';
import BuilderContext from '../context/builder.context.lite';
import { getBlockActions } from '../functions/get-block-actions';
import { getProcessedBlock } from '../functions/get-processed-block';
import BlockStyles from './block-styles.lite';

export type RenderBlockProps = {
  block: BuilderBlock;
};

export default function RenderBlock(props: RenderBlockProps) {
  const builderContext = useContext(BuilderContext);

  const state = useState({
    get component() {
      const componentName = state.useBlock.component?.name;
      if (!componentName) {
        return null;
      }
      const ref = components[componentName];
      if (componentName && !ref) {
        // TODO: Public doc page with more info about this message
        console.warn(`
          Could not find a registered component named "${componentName}". 
          If you registered it, is the file that registered it imported by the file that needs to render it?`);
      }
      return ref;
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
              {(child: any) => <RenderBlock block={child} />}
            </For>
          </state.componentRef>
        }
      >
        <state.tagName {...state.propertiesAndActions} style={state.css}>
          <BlockStyles block={state.useBlock} />
          {state.componentRef && (
            <state.componentRef
              {...state.componentOptions}
              builderBlock={state.useBlock}
            >
              <For each={state.children}>
                {(child: any) => <RenderBlock block={child} />}
              </For>
            </state.componentRef>
          )}
          <For each={state.noCompRefChildren}>
            {(child: any) => <RenderBlock block={child} />}
          </For>
        </state.tagName>
      </Show>
    </>
  );
}
