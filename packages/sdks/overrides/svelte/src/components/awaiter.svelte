<script lang="ts">
  export let load: () => Promise<any>;
  export let fallback: any;
  export let props: any;
  export let attributes: any;
</script>

{#await load()}
  {#if fallback}
    <svelte:component this={fallback} />
  {/if}
  {:then { default: Component }}
  <svelte:component
    this={Component}
    {...props}
    attributes={attributes}
  >
    <slot />
  </svelte:component>
{/await}
