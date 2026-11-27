<!-- A lazily loaded custom component (`component: { load, fallback }`). -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    load,
    fallback,
    props,
    children,
  }: {
    load: string | (() => Promise<{ default: any }>);
    fallback?: any;
    props: Record<string, any> | undefined;
    children?: Snippet;
  } = $props();

  // svelte-ignore state_referenced_locally
  const componentImport = typeof load === 'string' ? import(/* @vite-ignore */ load) : load();
</script>

{#await componentImport}
  {#if fallback}
    {@const Fallback = fallback}
    <Fallback />
  {/if}
{:then { default: Component }}
  <Component {...props}>{@render children?.()}</Component>
{/await}
