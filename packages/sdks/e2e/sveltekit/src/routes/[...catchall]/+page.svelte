<script lang="ts">
  import {
    RenderContent,
    type RegisteredComponent,
  } from '@builder.io/sdk-svelte';
  import Counter from '../../Counter.svelte';

  // this data comes from the function in `+page.server.ts`, which runs on the server only
  export let data: any;

  const CUSTOM_COMPONENTS: RegisteredComponent[] = [
    {
      name: 'Counter',
      component: Counter,
      image: 'https://cdn-icons-png.flaticon.com/512/6134/6134688.png',
      inputs: [
        {
          name: 'count',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
  ];
</script>

<main>
  {#if data.props}
    {#key data.props}
      <RenderContent {...data.props} customComponents={CUSTOM_COMPONENTS} />
    {/key}
  {:else}
    Content Not Found
  {/if}
</main>
