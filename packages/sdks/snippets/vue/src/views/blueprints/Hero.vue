<!-- Hero.vue -->
<template>
    <div>
      <!-- Your nav goes here -->
      <div v-if="productHero">
        <Content :content="productHero" :model="MODEL" :apiKey="API_KEY" />
      </div>
      <!-- The rest of your page goes here -->
    </div>
  </template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Content, fetchOneEntry } from '@builder.io/sdk-vue';
import type { BuilderContent } from '@builder.io/sdk-vue';

const MODEL = 'collection-hero';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

const productHero = ref<BuilderContent | null>(null);

onMounted(() => {
  fetchOneEntry({
    model: MODEL,
    apiKey: API_KEY,
    userAttributes: { urlPath: window.location.pathname },
  }).then((data) => {
    productHero.value = data;
  });
});
</script>
  