<script>
  import Counter from './lib/Counter.svelte';
  import { fetchOneEntry, isPreviewing, Content } from '@builder.io/sdk-svelte';

  // Create an array of your custom components and their properties
  const CUSTOM_COMPONENTS = [
    {
      component: Counter,
      name: 'Counter',
      inputs: [
        {
          name: 'name',
          type: 'string',
          defaultValue: 'hello'
        },
        {
          name: 'count',
          type: 'number',
          defaultValue: 0
        }
      ]
    }
  ];
  // TODO: enter your public API key
  const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

  let content = undefined;
  let canShowContent = false;
  const fetch = async () => {
    // fetch your Builder content
    content = await fetchOneEntry({
      model: 'page',
      apiKey: BUILDER_PUBLIC_API_KEY,
      userAttributes: {
        urlPath: window.location.pathname || '/'
      }
    });
    // handle preview mode
    canShowContent = content || isPreviewing();
  };

  fetch();
</script>

<svelte:head>
  <title>Home</title>
</svelte:head>

<main>
  <h1>
    Welcome to your new<br />Svelte app
  </h1>

  <div>Below is your Builder Content:</div>
  {#if canShowContent}
    <div>page Title: {content?.data?.title || 'Unpublished'}</div>
    <!-- Render builder content with all required props -->
    <Content
      model="page"
      {content}
      apiKey={BUILDER_PUBLIC_API_KEY}
      customComponents={CUSTOM_COMPONENTS}
    />
  {:else}
    Content Not Found
  {/if}
</main>

<footer>
  <p>visit <a href="https://svelte.dev">svelte.dev</a> to learn Svelte</p>
</footer>

<style>
  h1 {
    width: 100%;
    font-size: 2rem;
    text-align: center;
  }

  footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px;
  }

  @media (min-width: 480px) {
    footer {
      padding: 40px 0;
    }
  }
</style>
