<script lang="ts">
  import { onMount } from 'svelte';
  import {
    fetchOneEntry,
    Content,
    isPreviewing,
    type BuilderContent,
  } from '@builder.io/sdk-svelte';

  export let handle: string;
  let article: BuilderContent | null;
  const model = 'blog-article';
  const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

  onMount(() => {
    fetchOneEntry({
      model,
      apiKey,
      query: { 'data.handle': handle },
    }).then((data) => {
      article = data;
    });
  });
</script>

{#if !article?.data && !isPreviewing()}
  <div>404</div>
{:else if article?.data}
  <div class="content">
    <h1>{article.data.title}</h1>
    <p>{article.data.blurb}</p>
    <img src={article.data.image} alt={article.data.title} />
    <Content {model} content={article} {apiKey} />
  </div>
{/if}
