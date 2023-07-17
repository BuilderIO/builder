import type { BuilderBlock } from '../../../types/builder-block.js';
import BlockStyles from './block-styles.lite';
import Block from '../block.lite';
import type { Signal } from '@builder.io/mitosis';
import { For, Show, useMetadata } from '@builder.io/mitosis';
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../../context/types.js';
import type { PropsWithBuilderData } from '../../../types/builder-props.js';

type ComponentOptions = PropsWithBuilderData<{
  [index: string]: any;
  attributes?: {
    [index: string]: any;
  };
}>;

export interface ComponentProps {
  componentRef: any;
  componentOptions: ComponentOptions;
  blockChildren: BuilderBlock[];
  context: Signal<BuilderContextInterface>;
  registeredComponents: RegisteredComponents;
}

useMetadata({
  qwik: {
    component: {
      isLight: true,
    },
  },
  options: {
    vue3: {
      asyncComponentImports: true,
    },
  },
});

export default function ComponentRef(props: ComponentProps) {
  return (
    <Show when={props.componentRef}>
      <props.componentRef {...props.componentOptions}>
        {/**
         * We need to run two separate loops for content + styles to workaround the fact that Vue 2
         * does not support multiple root elements.
         */}
        <For each={props.blockChildren}>
          {(child) => (
            <Block
              key={'block-' + child.id}
              block={child}
              context={props.context}
              registeredComponents={props.registeredComponents}
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
