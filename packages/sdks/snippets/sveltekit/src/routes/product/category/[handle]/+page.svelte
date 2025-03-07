<script lang="ts">
  import type { BuilderContent } from '@builder.io/sdk-svelte';

  export let data: {
    productDetails: BuilderContent | null;
  };

  let productDetails = data.productDetails;
</script>

{#if !productDetails}
  <p>Loading product details...</p>
{:else}
  <h1>{productDetails.data?.name}</h1>
  <img
    src={productDetails.data?.image}
    alt={productDetails.data?.name}
    width="400"
    height="500"
  />
  <p>{productDetails.data?.collection?.value?.data?.copy}</p>
  <p>Price: {productDetails.data?.collection?.value?.data?.price}</p>
{/if}
