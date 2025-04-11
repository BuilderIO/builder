<!-- pages/ProductHero.vue -->
<script setup lang="ts">
import { Content, fetchOneEntry } from '@builder.io/sdk-vue';
import { useAsyncData } from '#app';
import { useRoute } from 'nuxt/app';

const route = useRoute();

const { data: productHero } = await useAsyncData('productHero', () =>
  fetchOneEntry({
    model: 'collection-hero',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    userAttributes: { urlPath: route.path },
  })
)
</script>

<template>
  <div>
    <!-- Your nav goes here -->
    <!-- Hero Section -->
    <div v-if="productHero">
      <Content :content="productHero" model="collection-hero" apiKey="ee9f13b4981e489a9a1209887695ef2b" />
    </div>
    <!-- The rest of your page goes here -->
  </div>
</template>
