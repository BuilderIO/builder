<script lang="ts">
  import { Content } from '@builder.io/sdk-svelte';
    import NotLazyComponent from '../../components/NotLazyComponent.svelte';

  // this data comes from the function in `+page.server.ts`, which runs on the server only
  export let data;

  const customComponents = [
    {
      name: 'LazyComponent',
      component: {
          load: () => import('../../components/LazyComponent.svelte'),
      }
    },
    {
      name: 'NotLazyComponent',
      component: NotLazyComponent
    }
  ]
</script>

<main>
  {#if data.props}
    {#key data.props}
      <Content {...data.props} {customComponents} />
    {/key}
  {:else}
    Content Not Found
  {/if}
</main>
