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

export type RenderBlockProps = {
  block: BuilderBlock;
};

export default function RenderBlock(props: RenderBlockProps) {
  const builderContext = useContext(BuilderContext);

  const state = useState({
    get component() {
      return components[state.block.component?.name!];
    },
    get componentInfo() {
      return state.component?.info;
    },
    get componentRef() {
      return state.component?.component;
    },
    get tagName() {
      return getBlockTag(state.block) as any;
    },
    get properties() {
      return getBlockProperties(state.block);
    },
    get block() {
      return getProcessedBlock({
        block: props.block,
        state: builderContext.state,
        context: builderContext.context,
      });
    },
    get actions() {
      return getBlockActions({
        block: state.block,
        state: builderContext.state,
        context: builderContext.context,
      });
    },
    get css() {
      return getBlockStyles(state.block);
    },
    get componentOptions() {
      return getBlockComponentOptions(state.block);
    },
  });

  return (
    <>
      <Show when={state.componentInfo?.noWrap}>
        <state.componentRef
          attributes={state.properties}
          {...state.componentInfo?.options}
          style={state.css}
        />
      </Show>
      <Show when={!state.componentInfo?.noWrap}>
        <state.tagName {...state.properties} style={state.css}>
          {state.componentRef && <state.componentRef {...state.componentOptions} />}
          <Show when={!state.componentRef && state.block.children && state.block.children.length}>
            <For each={state.block.children}>{(child: any) => <RenderBlock block={child} />}</For>
          </Show>
        </state.tagName>
      </Show>
    </>
  );
}
