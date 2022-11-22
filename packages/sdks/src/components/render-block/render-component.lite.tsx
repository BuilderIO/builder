import type { BuilderBlock } from '../../types/builder-block.js';
import BlockStyles from './block-styles.lite';
import RenderBlock from './render-block.lite';
import { For, Show, useMetadata } from '@builder.io/mitosis';
import type { BuilderContextInterface } from '../../context/types.js';
import type { Breakpoints } from '../../types/builder-content.js';

export interface RenderComponentProps {
  componentRef: any;
  componentOptions: any;
  blockChildren: BuilderBlock[];
  context: BuilderContextInterface;
  customBreakpoints?: Breakpoints;
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
              context={props.context}
            />
          )}
        </For>
      </props.componentRef>
    </Show>
  );
}
