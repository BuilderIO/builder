<script context="module" lang="ts">
  export type RenderBlockProps = {
    block: BuilderBlock;
    context: BuilderStore;
  };
</script>

<script lang="ts">
  import type { BuilderContextInterface } from '../../context/types.js';
  import { getBlockActions } from '../../functions/get-block-actions.js';
  import { getBlockComponentOptions } from '../../functions/get-block-component-options.js';
  import { getBlockProperties } from '../../functions/get-block-properties.js';
  import { getProcessedBlock } from '../../functions/get-processed-block.js';
  import type { BuilderBlock } from '../../types/builder-block.js';
  import BlockStyles from './block-styles.svelte';
  import {
    getComponent,
    getRepeatItemData,
    isEmptyHtmlElement,
  } from './render-block.helpers.js';
  import type { RenderComponentProps } from './render-component.svelte';
  import RenderRepeatedBlock from './render-repeated-block.svelte';
  import { TARGET } from '../../constants/target.js';
  import { extractTextStyles } from '../../functions/extract-text-styles.js';
  import RenderComponent from './render-component.svelte';
  import { getReactNativeBlockStyles } from '../../functions/get-react-native-block-styles.js';
  import type { BuilderStore } from 'src/sdk-src/context/builder.context.js';

  const setAttrs = (node, attrs = {}) => {
    const attrKeys = Object.keys(attrs);
    const setup = (attr) => node.addEventListener(attr.substr(3), attrs[attr]);
    const teardown = (attr) =>
      node.removeEventListener(attr.substr(3), attrs[attr]);
    attrKeys.map(setup);
    return {
      update(attrs = {}) {
        const attrKeys = Object.keys(attrs);
        attrKeys.map(teardown);
        attrKeys.map(setup);
      },
      destroy() {
        attrKeys.map(teardown);
      },
    };
  };

  export let block: RenderBlockProps['block'];
  export let context: RenderBlockProps['context'];

  $: repeatItem = () => {
    return getRepeatItemData({
      block: block,
      context: $context,
    });
  };
  $: useBlock = () => {
    return repeatItem()
      ? block
      : getProcessedBlock({
          block: block,
          localState: $context.localState,
          rootState: $context.rootState,
          rootSetState: $context.rootSetState,
          context: $context.context,
          shouldEvaluateBindings: true,
        });
  };
  $: canShowBlock = () => {
    if ('hide' in useBlock()) {
      return !useBlock().hide;
    }
    if ('show' in useBlock()) {
      return useBlock().show;
    }
    return true;
  };
  $: actions = () => {
    return getBlockActions({
      block: useBlock(),
      rootState: $context.rootState,
      rootSetState: $context.rootSetState,
      localState: $context.localState,
      context: $context.context,
    });
  };
  $: attributes = () => {
    const blockProperties = getBlockProperties(useBlock());
    return {
      ...blockProperties,
      ...(TARGET === 'reactNative'
        ? {
            style: getReactNativeBlockStyles({
              block: useBlock(),
              context: $context,
              blockStyles: blockProperties.style,
            }),
          }
        : {}),
    };
  };
  $: childrenWithoutParentComponent = () => {
    /**
     * When there is no `componentRef`, there might still be children that need to be rendered. In this case,
     * we render them outside of `componentRef`.
     * NOTE: We make sure not to render this if `repeatItemData` is non-null, because that means we are rendering an array of
     * blocks, and the children will be repeated within those blocks.
     */
    const shouldRenderChildrenOutsideRef =
      !component?.component && !repeatItem();
    return shouldRenderChildrenOutsideRef ? useBlock().children ?? [] : [];
  };
  $: childrenContext = () => {
    const getInheritedTextStyles = () => {
      if (TARGET !== 'reactNative') {
        return {};
      }
      return extractTextStyles(
        getReactNativeBlockStyles({
          block: useBlock(),
          context: $context,
          blockStyles: attributes().style,
        })
      );
    };
    return context;
  };
  $: renderComponentProps = () => {
    return {
      blockChildren: useBlock().children ?? [],
      componentRef: component?.component,
      componentOptions: {
        ...getBlockComponentOptions(useBlock()),
        /**
         * These attributes are passed to the wrapper element when there is one. If `noWrap` is set to true, then
         * they are provided to the component itself directly.
         */
        ...(!component?.noWrap
          ? {}
          : {
              attributes: {
                ...attributes(),
                ...actions(),
              },
            }),
      },
      context: childrenContext(),
    };
  };

  let component = getComponent({
    block: block,
    context: $context,
  });
  let Tag = block.tagName || 'div';
</script>

{#if canShowBlock()}
  {#if !component?.noWrap}
    {#if isEmptyHtmlElement(Tag)}
      <svelte:element this={Tag} {...attributes()} use:setAttrs={actions()} />
    {/if}

    {#if !isEmptyHtmlElement(Tag) && repeatItem()}
      {#each repeatItem() as data, index (index)}
        <RenderRepeatedBlock repeatContext={data.context} block={data.block} />
      {/each}
    {/if}

    {#if !isEmptyHtmlElement(Tag) && !repeatItem()}
      <svelte:element this={Tag} {...attributes()} use:setAttrs={actions()}>
        <RenderComponent {...renderComponentProps()} />

        {#each childrenWithoutParentComponent() as child ('render-block-' + child.id)}
          <svelte:self block={child} context={childrenContext()} />
        {/each}

        {#each childrenWithoutParentComponent() as child ('block-style-' + child.id)}
          <BlockStyles block={child} context={childrenContext()} />
        {/each}
      </svelte:element>
    {/if}
  {:else}
    <RenderComponent {...renderComponentProps()} />
  {/if}
{/if}
