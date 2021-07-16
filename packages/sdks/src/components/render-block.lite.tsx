import { useState, Show } from '@jsx-lite/core';
import { getBlockComponentOptions } from '../functions/get-block-component-options';
import { getBlockProperties } from '../functions/get-block-properties';
import { getBlockStyles } from '../functions/get-block-styles';
import { getBlockTag } from '../functions/get-block-tag';
import { components } from '../functions/register-component';
import { BuilderBlock } from '../types/builder-block';

export type RenderBlockProps = {
  block: BuilderBlock;
};

export default function RenderBlock(props: RenderBlockProps) {
  const state = useState({
    get component() {
      return components[props.block.component?.name!];
    },
    get componentInfo() {
      return state.component?.info;
    },
    get componentRef() {
      return state.component?.component;
    },
    get tagName() {
      return getBlockTag(props.block) as any;
    },
    get properties() {
      return getBlockProperties(props.block);
    },
    get css() {
      return getBlockStyles(props.block);
    },
    get componentOptions() {
      return getBlockComponentOptions(props.block);
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
          <Show when={!state.componentRef && props.block.children && props.block.children.length}>
            {props.block.children.map((block: any) => (
              <RenderBlock block={block} />
            ))}
          </Show>
        </state.tagName>
      </Show>
    </>
  );
}
