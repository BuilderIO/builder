<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;

  import ProductHeader from '../ProductHeader.svelte';
  import ProductFooter from '../ProductFooter.svelte';
  import ProductInfo from '../ProductInfo.svelte';
  import { Content, isPreviewing } from '@builder.io/sdk-svelte';
</script>

{#if !data.product && !data.editorial && !isPreviewing()}
  <p>404</p>
{:else}
  <ProductHeader />
  <ProductInfo product={data.product} />
  <Content
    model="product-editorial"
    content={data.editorial}
    apiKey="ee9f13b4981e489a9a1209887695ef2b"
  />
  <ProductFooter />
{/if}
