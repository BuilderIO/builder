import BuilderContext, {
  BuilderContextInterface,
  RegisteredComponent,
} from '../../context/builder.context.lite';
import { getBlockActions } from '../../functions/get-block-actions.js';
import { getBlockComponentOptions } from '../../functions/get-block-component-options.js';
import { getBlockProperties } from '../../functions/get-block-properties.js';
import { getBlockStyles } from '../../functions/get-block-styles.js';
import { getBlockTag } from '../../functions/get-block-tag.js';
import { getProcessedBlock } from '../../functions/get-processed-block.js';
import { BuilderBlock } from '../../types/builder-block.js';
import { Nullable } from '../../types/typescript.js';
import { evaluate } from '../../functions/evaluate.js';
import BlockStyles from './block-styles.lite';
import { isEmptyHtmlElement } from './render-block.helpers.js';
import RenderComponent, { RenderComponentProps } from './render-component.lite';
import {
  For,
  Show,
  useContext,
  useMetadata,
  useStore,
} from '@builder.io/mitosis';
import RenderRepeatedBlock from './render-repeated-block.lite';

export type RenderBlockProps = {
  block: BuilderBlock;
};

// eslint-disable-next-line @builder.io/mitosis/only-default-function-and-imports
useMetadata({
  elementTag: 'state.tagName',
});

interface RepeatData {
  block: BuilderBlock;
  context: BuilderContextInterface;
}

export default function RenderBlock(props: RenderBlockProps) {
  const builderContext = useContext(BuilderContext);

  const state = useStore({
    get component(): Nullable<RegisteredComponent> {
      const componentName = getProcessedBlock({
        block: props.block,
        state: builderContext.state,
        context: builderContext.context,
        evaluateBindings: false,
      }).component?.name;

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
      if (state.component) {
        const { component: _, ...info } = state.component;
        return info;
      } else {
        return undefined;
      }
    },
    get componentRef() {
      return state.component?.component;
    },
    get tagName() {
      return getBlockTag(state.useBlock);
    },
    get useBlock(): BuilderBlock {
      return state.repeatItemData
        ? props.block
        : getProcessedBlock({
            block: props.block,
            state: builderContext.state,
            context: builderContext.context,
            evaluateBindings: true,
          });
    },
    get attributes() {
      return {
        ...getBlockProperties(state.useBlock),
        ...getBlockActions({
          block: state.useBlock,
          state: builderContext.state,
          context: builderContext.context,
        }),
        style: getBlockStyles(state.useBlock),
      };
    },

    get shouldWrap() {
      return !state.componentInfo?.noWrap;
    },

    get componentOptions() {
      return {
        ...getBlockComponentOptions(state.useBlock),
        /**
         * These attributes are passed to the wrapper element when there is one. If `noWrap` is set to true, then
         * they are provided to the component itself directly.
         */
        ...(state.shouldWrap ? {} : { attributes: state.attributes }),
      };
    },

    get renderComponentProps(): RenderComponentProps {
      return {
        blockChildren: state.children,
        componentRef: state.componentRef,
        componentOptions: state.componentOptions,
      };
    },
    get children() {
      // TO-DO: When should `canHaveChildren` dictate rendering?
      // This is currently commented out because some Builder components (e.g. Box) do not have `canHaveChildren: true`,
      // but still receive and need to render children.
      // return state.componentInfo?.canHaveChildren ? state.useBlock.children : [];
      return state.useBlock.children ?? [];
    },
    get childrenWithoutParentComponent() {
      /**
       * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
       * we render them outside of `componentRef`.
       * NOTE: We make sure not to render this if `repeatItemData` is non-null, because that means we are rendering an array of
       * blocks, and the children will be repeated within those blocks.
       */
      const shouldRenderChildrenOutsideRef =
        !state.componentRef && !state.repeatItemData;

      return shouldRenderChildrenOutsideRef ? state.children : [];
    },

    get repeatItemData(): RepeatData[] | undefined {
      /**
       * we don't use `state.useBlock` here because the processing done within its logic includes evaluating the block's bindings,
       * which will not work if there is a repeat.
       */
      const { repeat, ...blockWithoutRepeat } = props.block;

      if (!repeat?.collection) {
        return undefined;
      }

      const { collection, itemName } = repeat;

      const itemsArray = evaluate({
        code: collection,
        state: builderContext.state,
        context: builderContext.context,
      });

      if (Array.isArray(itemsArray)) {
        const collectionName = collection.split('.').pop();
        const itemNameToUse =
          itemName || (collectionName ? collectionName + 'Item' : 'item');

        const repeatArray = itemsArray.map<RepeatData>((item, index) => ({
          context: {
            ...builderContext,
            state: {
              ...builderContext.state,
              $index: index,
              $item: item,
              [itemNameToUse]: item,
              [`$${itemNameToUse}Index`]: index,
            },
          },
          block: blockWithoutRepeat,
        }));
        return repeatArray;
      } else {
        return undefined;
      }
    },
  });

  return (
    <Show
      when={state.shouldWrap}
      else={<RenderComponent {...state.renderComponentProps} />}
    >
      <Show
        when={!isEmptyHtmlElement(state.tagName)}
        else={
          /**
           * Svelte is super finicky, and does not allow an empty HTML element (e.g. `img`) to have logic inside of it,
           * _even_ if that logic ends up not rendering anything.
           */
          <state.tagName {...state.attributes} />
        }
      >
        <state.tagName {...state.attributes}>
          <Show
            when={state.repeatItemData}
            else={<RenderComponent {...state.renderComponentProps} />}
          >
            <For each={state.repeatItemData}>
              {(data, index) => (
                <RenderRepeatedBlock
                  key={index}
                  repeatContext={data.context}
                  block={data.block}
                />
              )}
            </For>
          </Show>
          {/**
           * We need to run two separate loops for content + styles to workaround the fact that Vue 2
           * does not support multiple root elements.
           */}
          <For each={state.childrenWithoutParentComponent}>
            {(child) => (
              <RenderBlock key={'render-block-' + child.id} block={child} />
            )}
          </For>
          <For each={state.childrenWithoutParentComponent}>
            {(child) => (
              <BlockStyles key={'block-style-' + child.id} block={child} />
            )}
          </For>
        </state.tagName>
      </Show>
    </Show>
  );
}
