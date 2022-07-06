<script context="module" lang="ts">
  export const prerender = true;
</script>

<script lang="ts">
  import { page } from '$app/stores';

  import Counter from '$lib/Counter.svelte';

  import {
    getContent,
    getBuilderSearchParams,
    convertSearchParamsToQueryObject,
    isEditing,
    RenderContent
  } from '@builder.io/sdk-svelte';

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
    content = await getContent({
      model: 'page',
      apiKey: BUILDER_PUBLIC_API_KEY,
      options: getBuilderSearchParams(convertSearchParamsToQueryObject($page.url.searchParams)),
      userAttributes: {
        urlPath: $page.url.pathname
      }
    });
    canShowContent = content || isEditing();
  };

  fetch();
</script>

<div>Hello world from your SvelteKit project. Below is Builder Content:</div>

{#if canShowContent}
  <div>page: {(content && content.data && content.data.title) || 'Unpublished'}</div>
  <RenderContent
    model="page"
    {content}
    apiKey={BUILDER_PUBLIC_API_KEY}
    customComponents={CUSTOM_COMPONENTS}
  />
{/if}
