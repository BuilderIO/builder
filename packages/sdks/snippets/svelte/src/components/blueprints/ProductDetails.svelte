<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchOneEntry, type BuilderContent } from '@builder.io/sdk-svelte';

  interface Props {
    handle: string;
  }

  let { handle }: Props = $props();
  let productDetails: BuilderContent | null = $state(null);

  onMount(() => {
    fetchOneEntry({
      model: 'product-details',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      query: { 'data.handle': handle },
    }).then((data) => (productDetails = data));
  });
</script>

{#if !productDetails}
  <p>Loading product details...</p>
{:else}
  <div class="product-details-page">
    <h1>{productDetails.data?.name}</h1>
    <img src={productDetails.data?.image} alt={productDetails.data?.name} />
    <p>{productDetails.data?.collection.value.data.copy}</p>
    <p>Price: {productDetails.data?.collection.value.data.price}</p>
  </div>
{/if}
