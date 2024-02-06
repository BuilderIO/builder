<script>
  import { onMount } from 'svelte';
  import { fetchOneEntry, subscribeToEditor } from '@builder.io/sdk-svelte';

  const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

  let content = undefined;
  const fetch = async () => {
    content = await fetchOneEntry({
      model: 'coffee',
      apiKey: BUILDER_PUBLIC_API_KEY
    });
  };

  onMount(() => {
    const subscribe = subscribeToEditor('coffee', (data) => {
      content = data;
    });

    return () => {
      subscribe();
    };
  });

  fetch();
</script>

<main>
  {#if !content}
    <div>Loading...</div>
  {:else}
    <div>coffee name: {content.data?.name}</div>
    <div>coffee info: {content.data?.info}</div>
  {/if}
</main>
