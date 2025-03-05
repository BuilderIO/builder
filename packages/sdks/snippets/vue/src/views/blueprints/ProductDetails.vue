<template>
    <div v-if="!productDetails">
      <p>Loading product details...</p>
    </div>
    <div v-else>
      <h1>{{ productDetails.data.name }}</h1>
      <img
        :src="productDetails.data.image"
        :alt="productDetails.data.name"
        width="400"
        height="500"
      />
      <p>{{ productDetails.data.collection.value.data.copy }}</p>
      <p>Price: {{ productDetails.data.collection.value.data.price }}</p>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted } from 'vue'
  import { fetchOneEntry } from '@builder.io/sdk-vue'
  
  const productDetails = ref<any | null>(null)
  
  onMounted( () => {
    fetchOneEntry({
        model: 'product-details',
        apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
        query: { 'data.handle': 'jacket' },
      }).then((data) => {
        productDetails.value = data
      })
  })
  </script>
  