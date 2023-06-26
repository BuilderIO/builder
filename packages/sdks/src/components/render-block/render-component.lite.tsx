import type { BuilderBlock } from '../../types/builder-block.js';
import BlockStyles from './block-styles.lite';
import RenderBlock from './render-block.lite';
import type { Signal } from '@builder.io/mitosis';
import { For, Show, useMetadata } from '@builder.io/mitosis';
import type { BuilderContextInterface } from '../../context/types.js';

type ComponentOptions = {
  [index: string]: any;
  attributes?: {
    [index: string]: any;
  };
};

export interface RenderComponentProps {
  componentRef: any;
  componentOptions: ComponentOptions;
  blockChildren: BuilderBlock[];
  context: Signal<BuilderContextInterface>;
}

useMetadata({
  qwik: {
    component: {
      isLight: true,
    },
  },
});

export default function RenderComponent(props: RenderComponentProps) {
  return (
    <Show when={props.componentRef}>
      <props.componentRef {...props.componentOptions}>
        {/**
         * We need to run two separate loops for content + styles to workaround the fact that Vue 2
         * does not support multiple root elements.
         */}
        <For each={props.blockChildren}>
          {(child) => (
            <RenderBlock
              key={'render-block-' + child.id}
              block={child}
              context={props.context}
            />
          )}
        </For>
        <For each={props.blockChildren}>
          {(child) => (
            <BlockStyles
              key={'block-style-' + child.id}
              block={child}
              context={props.context.value}
            />
          )}
        </For>
      </props.componentRef>
    </Show>
  );
}
