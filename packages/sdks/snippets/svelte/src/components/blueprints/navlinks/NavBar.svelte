<script lang="ts">
  import type { BuilderContent } from '@builder.io/sdk-svelte';
  export let links: BuilderContent | null;
</script>

{#if links?.data?.links}
  <ul>
    {#each links.data.links as link}
      <li>
        <a href={link.url}>{link.text}</a>
      </li>
    {/each}
  </ul>
{/if}
