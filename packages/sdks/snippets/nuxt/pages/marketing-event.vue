<!-- pages/ProductHero.vue -->
<template>
  <div>
    <!-- Your nav goes here -->
    <!-- Hero Section -->
    <div v-if="productHero || isPreviewing()">
      <Content :content="productHero" :model="MODEL" :apiKey="API_KEY" />
    </div>
    <div v-else>404</div>
    <!-- The rest of your page goes here -->
  </div>
</template>

<script setup lang="ts">
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue';
import { useAsyncData } from '#app';
import { useRoute } from 'nuxt/app';

const MODEL = 'collection-hero';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

const route = useRoute();

const { data: productHero } = await useAsyncData('productHero', () =>
  fetchOneEntry({
    model: MODEL,
    apiKey: API_KEY,
    userAttributes: { urlPath: route.path },
  })
);
</script>
