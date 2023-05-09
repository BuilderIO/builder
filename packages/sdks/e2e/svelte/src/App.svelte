<script lang="ts">
  import {
    RenderContent,
    type RegisteredComponent,
  } from '@builder.io/sdk-svelte';
  import { getProps } from '@builder.io/sdks-e2e-tests';
  import Counter from './Counter.svelte';

  $: props = getProps();

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

<svelte:head>
  <title>Home</title>
</svelte:head>

<main>
  {#if props}
    <RenderContent {...props} customComponents={CUSTOM_COMPONENTS} />
  {:else}
    Content Not Found
  {/if}
</main>
