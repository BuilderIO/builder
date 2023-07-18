import type { BuilderBlock } from '../../../types/builder-block.js';
import BlockStyles from './block-styles.lite';
import Block from '../block.lite';
import type { Signal } from '@builder.io/mitosis';
import { For, Show, useMetadata, useStore } from '@builder.io/mitosis';
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../../context/types.js';
import type { PropsWithBuilderData } from '../../../types/builder-props.js';
import { getBlockProperties } from '../../../functions/get-block-properties.js';
import type { InteractiveElementProps } from './interactive-element.lite.jsx';
import InteractiveElement from './interactive-element.lite.jsx';

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
  builderBlock: BuilderBlock;
  includeBlockProps: boolean;
  isRSC: boolean | undefined;
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
  elementTag: 'state.Wrapper',
});

export default function ComponentRef(props: ComponentProps) {
  const state = useStore({
    Wrapper: props.isRSC ? props.componentRef : InteractiveElement,
    get wrapperProps() {
      const blockWrapperProps: InteractiveElementProps = {
        Wrapper: props.componentRef,
        block: props.builderBlock,
        context: props.context,
        wrapperProps: props.componentOptions,
        shouldNestAttributes: true,
      };

      return props.isRSC
        ? {
            ...props.componentOptions,
            /**
             * If `noWrap` is set to `true`, then the block's props/attributes are provided to the
             * component itself directly. Otherwise, they are provided to the wrapper element.
             */
            ...(props.includeBlockProps
              ? {
                  attributes: getBlockProperties({
                    block: props.builderBlock,
                    context: props.context.value,
                  }),
                }
              : {}),
          }
        : blockWrapperProps;
    },
  });
  return (
    <Show when={props.componentRef}>
      <state.Wrapper {...state.wrapperProps}>
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
      </state.Wrapper>
    </Show>
  );
}
