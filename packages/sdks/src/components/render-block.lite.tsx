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
import RenderBlocks from './render-blocks.lite';

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
      const ref = components[state.useBlock.component?.name!];
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
      return getBlockTag(state.useBlock) as any;
    },
    get properties() {
      return getBlockProperties(state.useBlock);
    },
    get useBlock() {
      return getProcessedBlock({
        block: props.block,
        state: builderContext.state,
        context: builderContext.context,
      });
    },
    get propertiesAndActions() {
      return {
        ...state.properties,
        ...state.actions,
      };
    },
    get actions() {
      return getBlockActions({
        block: state.useBlock,
        state: builderContext.state,
        context: builderContext.context,
      });
    },
    get css() {
      return getBlockStyles(state.useBlock);
    },
    get componentOptions() {
      return getBlockComponentOptions(state.useBlock);
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
            <Show
              when={
                state.componentInfo.canHaveChildren && state.useBlock.children
              }
            >
              <RenderBlocks path="children" blocks={state.useBlock.children} />
            </Show>
            <For
              each={
                !state.componentInfo.canHaveChildren
                  ? state.useBlock.children
                  : []
              }
            >
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
              <Show
                when={
                  state.componentInfo.canHaveChildren && state.useBlock.children
                }
              >
                <RenderBlocks
                  path="children"
                  blocks={state.useBlock.children}
                />
              </Show>
              <For
                each={
                  !state.componentInfo.canHaveChildren
                    ? state.useBlock.children
                    : []
                }
              >
                {(child: any) => <RenderBlock block={child} />}
              </For>
            </state.componentRef>
          )}
          <Show
            when={
              state.componentInfo.canHaveChildren && state.useBlock.children
            }
          >
            <RenderBlocks path="children" blocks={state.useBlock.children} />
          </Show>
          <For
            each={
              !state.componentInfo.canHaveChildren
                ? state.useBlock.children
                : []
            }
          >
            {(child: any) => <RenderBlock block={child} />}
          </For>
        </state.tagName>
      </Show>
    </>
  );
}
