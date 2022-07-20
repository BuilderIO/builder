<script context="module" lang="ts">
  export const prerender = true;
</script>

<script lang="ts">
  import DynamicallyRenderBuilderPage from '$lib/DynamicallyRenderBuilderPage.svelte';
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<section>
  <h1>
    Welcome to your new<br />SvelteKit app
  </h1>

  <DynamicallyRenderBuilderPage />
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
    flex: 1;
  }

  h1 {
    width: 100%;
  }
</style>
