<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;
</script>

{#if !data.productDetails}
  <p>Loading product details...</p>
{:else}
  <div class="product-details-page">
    <h1>{data.productDetails.data?.name}</h1>
    <img
      src={data.productDetails.data?.image}
      alt={data.productDetails.data?.name}
    />
    <p>{data.productDetails.data?.collection.value.data.copy}</p>
    <p>Price: {data.productDetails.data?.collection.value.data.price}</p>
  </div>
{/if}
