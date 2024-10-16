<script lang="ts">
  import { Content } from '@builder.io/sdk-svelte';
  export let data;
</script>

<main>
  {#if data.props}
    {#key data.props}
      <Content {...data.props} customComponents={data.customComponents} />
    {/key}
  {:else}
    Content Not Found
  {/if}
</main>
