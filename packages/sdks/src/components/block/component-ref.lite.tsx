import type { BuilderBlock } from '../../../types/builder-block.js';
import BlockStyles from './block-styles.lite';
<<<<<<< HEAD:packages/sdks/src/components/block/components/component-ref.lite.tsx
import Block from '../block.lite';
=======
import Block from './block.lite';
>>>>>>> prep/sdk-rename:packages/sdks/src/components/block/component-ref.lite.tsx
import type { Signal } from '@builder.io/mitosis';
import { For, Show, useMetadata } from '@builder.io/mitosis';
import type {
  BuilderContextInterface,
  RegisteredComponent,
} from '../../../context/types.js';
import type { PropsWithBuilderData } from '../../../types/builder-props.js';
import type { Dictionary } from '../../../types/typescript.js';

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
  components: Dictionary<RegisteredComponent>;
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
<<<<<<< HEAD:packages/sdks/src/components/block/components/component-ref.lite.tsx
              key={'render-block-' + child.id}
=======
              key={'block-' + child.id}
>>>>>>> prep/sdk-rename:packages/sdks/src/components/block/component-ref.lite.tsx
              block={child}
              context={props.context}
              components={props.components}
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
