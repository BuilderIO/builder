<!-- Hero.vue -->
<template>
    <div>
      <!-- Your nav goes here -->
      <div v-if="productHero">
        <Content :content="productHero" model="collection-hero" apiKey="ee9f13b4981e489a9a1209887695ef2b" />
      </div>
      <!-- The rest of your page goes here -->
    </div>
  </template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Content, fetchOneEntry } from '@builder.io/sdk-vue';
import type { BuilderContent } from '@builder.io/sdk-vue';

const productHero = ref<BuilderContent | null>(null);

onMounted(() => {
  fetchOneEntry({
    model: 'collection-hero',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    userAttributes: { urlPath: window.location.pathname },
  }).then((data) => {
    productHero.value = data;
  });
});
</script>
  