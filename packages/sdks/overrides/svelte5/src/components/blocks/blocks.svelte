<!--
  A list of blocks in a `builder-blocks` wrapper. Custom components render their nested content
  with it (`<Blocks blocks={...} parent={builderBlock.id} path="..." />`): with no `context` prop it
  renders in the context of the nearest `<Content>` (or repeat item).
-->
<script lang="ts">
  import { getContext, type Snippet } from 'svelte';
  import BuilderContext from '../../context/builder.context.js';
  import ComponentsContext from '../../context/components.context.js';
  import type { ReactiveBuilderContext } from '../../context/reactive-context.svelte.js';
  import type { RegisteredComponents } from '../../context/types.js';
  import { isEditing } from '../../functions/is-editing.js';
  import { keyBlocks } from '../../helpers/inline-tags.js';
  import type { BuilderBlock } from '../../types/builder-block.js';
  import Block from '../block/block.svelte';

  let {
    blocks,
    parent,
    path,
    styleProp,
    className,
    context,
    registeredComponents,
    linkComponent,
    BlocksWrapperProps,
    children,
  }: {
    blocks?: BuilderBlock[];
    parent?: string;
    path?: string;
    styleProp?: Record<string, any>;
    className?: string;
    context?: ReactiveBuilderContext;
    registeredComponents?: RegisteredComponents;
    linkComponent?: any;
    BlocksWrapperProps?: Record<string, any>;
    children?: Snippet;
  } = $props();

  const inheritedContext = getContext<ReactiveBuilderContext | undefined>(BuilderContext.key);
  const inheritedComponents = getContext<{ registeredComponents: RegisteredComponents } | undefined>(
    ComponentsContext.key
  );

  const ctx = $derived((context || inheritedContext)!);
  const components = $derived(
    registeredComponents || inheritedComponents?.registeredComponents || {}
  );
  const Wrapper = $derived(ctx?.BlocksWrapper || 'div');
  const wrapperProps = $derived(BlocksWrapperProps || ctx?.BlocksWrapperProps);
  const keyed = $derived(keyBlocks(blocks));

  const classes = $derived(
    ['builder-blocks', !blocks?.length ? 'no-blocks' : '', className]
      .filter(Boolean)
      .join(' ')
  );

  const style = $derived.by(() => {
    let out = '';
    for (const key in styleProp) {
      out += key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()) + ':' + styleProp[key] + ';';
    }
    return out || undefined;
  });

  const dataPath = $derived.by(() => {
    if (!path) return undefined;
    if (path.startsWith('this.')) return path.replace('this.', '');
    if (path.startsWith('component.options.')) return path;
    return `component.options.${path}`;
  });

  // In the editor, an empty list is where "+ Add Block" goes.
  function notifyEditor(type: string) {
    if (isEditing() && !blocks?.length) {
      window.parent?.postMessage(
        { type, data: { parentElementId: parent, dataPath: dataPath } },
        '*'
      );
    }
  }
  const onclick = () => notifyEditor('builder.clickEmptyBlocks');
  const onmouseenter = () => notifyEditor('builder.hoverEmptyBlocks');
</script>

{#snippet list()}
  {@render children?.()}
  {#each keyed as item (item.key)}
    <Block block={item.block} context={ctx} registeredComponents={components} {linkComponent} />
  {/each}
{/snippet}

{#if typeof Wrapper === 'string'}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <svelte:element
    this={Wrapper}
    class="{classes} svelteelement"
    {style}
    builder-path={dataPath}
    builder-parent-id={parent}
    {onclick}
    {onmouseenter}
    onkeypress={onclick}
    {...wrapperProps}>{@render list()}</svelte:element
  >
{:else}
  <Wrapper
    class={classes}
    {style}
    builder-path={dataPath}
    builder-parent-id={parent}
    {...wrapperProps}>{@render list()}</Wrapper
  >
{/if}

<style>
  .svelteelement {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
</style>
