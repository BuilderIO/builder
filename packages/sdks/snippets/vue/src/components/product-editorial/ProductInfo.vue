<!-- src/components/ProductInfo.vue -->
<template>
  <div v-if="product" class="product-info">
    <div class="product-image">
      <img :src="product.image" :alt="product.title" />
    </div>
    <div>
      <h2>{{ product.title }}</h2>
      <p>{{ product.description }}</p>
      <p>Price: {{ product.price }} $</p>
      <p>Rating: {{ product.rating.rate }} / 5</p>
      <button>Buy now</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  product: {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating: { rate: number; count: number };
  } | null;
}>();
</script>
