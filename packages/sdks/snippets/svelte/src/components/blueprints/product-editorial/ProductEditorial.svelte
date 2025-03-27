<script lang="ts">
  import { onMount } from 'svelte';
  import {
    fetchOneEntry,
    Content,
    type BuilderContent,
    isPreviewing,
  } from '@builder.io/sdk-svelte';
  import ProductHeader from './ProductHeader.svelte';
  import ProductFooter from './ProductFooter.svelte';
  import ProductInfo from './ProductInfo.svelte';

  const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
  const modelName = 'product-editorial';
  export let handle: string;
  let product: any = null;
  let editorial: BuilderContent | null = null;

  onMount(() => {
    Promise.all([
      fetch(`https://fakestoreapi.com/products/${handle}`).then((res) =>
        res.json()
      ),
      fetchOneEntry({
        model: modelName,
        apiKey: API_KEY,
        userAttributes: { urlPath: window.location.pathname },
      }),
    ])
      .then(([productData, editorialData]) => {
        product = productData;
        editorial = editorialData;
      })
      .catch((error) => console.error('Error fetching data:', error));
  });
</script>

{#if !product && !editorial && !isPreviewing()}
  <p>404</p>
{:else}
  <ProductHeader />
  <ProductInfo {product} />
  <Content model={modelName} content={editorial} apiKey={API_KEY} />
  <ProductFooter />
{/if}
