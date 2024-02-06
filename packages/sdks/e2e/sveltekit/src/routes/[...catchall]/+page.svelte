<script lang="ts">
  import { Content } from '@builder.io/sdk-svelte';

  // this data comes from the function in `+page.server.ts`, which runs on the server only
  export let data;
</script>

<main>
  {#if data.props}
    {#key data.props}
      <Content {...data.props} />
    {/key}
  {:else}
    Content Not Found
  {/if}
</main>
