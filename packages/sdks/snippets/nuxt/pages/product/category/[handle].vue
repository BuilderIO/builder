<script setup lang="ts">
import { useAsyncData } from '#app';
import { fetchOneEntry } from '@builder.io/sdk-vue';
import { useRoute } from 'nuxt/app';

const route = useRoute();
const { data: productDetails, pending } = await useAsyncData(
  'product-details',
  () =>
    fetchOneEntry({
      model: 'product-details',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      query: {
        'data.handle': route.params.handle,
      },
    })
);
</script>

<template>
  <div v-if="pending">Loading product details...</div>

  <div class="product-details-page" v-if="productDetails?.data">
    <h1>{{ productDetails.data.name }}</h1>
    <img :src="productDetails.data.image" :alt="productDetails.data.name" />
    <p>{{ productDetails.data.collection.value.data.copy }}</p>
    <p>Price: {{ productDetails.data.collection.value.data.price }}</p>
  </div>
</template>
