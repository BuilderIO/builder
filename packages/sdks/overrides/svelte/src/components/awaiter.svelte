<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let load: () => Promise<{ default: typeof SvelteComponent<any> }>;
  export let fallback: any;
  export let props: any;
  export let attributes: any;
  const componentImport = typeof load === 'string' ? import(load) : load();
</script>

{#await componentImport}
  {#if fallback}
    <svelte:component this={fallback} />
  {/if}
{:then { default: Component }}
  <svelte:component this={Component} {...props} {...attributes}>
    <slot />
  </svelte:component>
{/await}
