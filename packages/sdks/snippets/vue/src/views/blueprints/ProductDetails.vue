<template>
    <div v-if="!productDetails">
      <p>Loading product details...</p>
    </div>
    <div class="product-details-page" v-else>
      <h1>{{ productDetails.data.name }}</h1>
      <img
        :src="productDetails.data.image"
        :alt="productDetails.data.name"
      />
      <p>{{ productDetails.data.collection.value.data.copy }}</p>
      <p>Price: {{ productDetails.data.collection.value.data.price }}</p>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { fetchOneEntry, type BuilderContent } from '@builder.io/sdk-vue'
  import { useRoute } from 'vue-router'
  
  const route = useRoute()
  const productDetails = ref<BuilderContent | null>(null);
  
  onMounted( () => {
    fetchOneEntry({
        model: 'product-details',
        apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
        query: { 'data.handle': route.params.handle },
      }).then((data) => {
        productDetails.value = data
      })
  })
  </script>
  