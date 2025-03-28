<template>
  <div v-if="!article && !isPreviewing()">404</div>
  <div v-if="article?.data" class="content">
    <h1>{{ article.data.title }}</h1>
    <p>{{ article.data.blurb }}</p>
    <img :src="article.data.image" />
    <Content :model="model" :content="article" :apiKey="API_KEY" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue';
import type { BuilderContent } from '@builder.io/sdk-vue';
import { useRoute } from 'vue-router';

const article = ref<BuilderContent | null>(null);
const model = 'blog-article';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const route = useRoute();

onMounted(() => {
  fetchOneEntry({
    model,
    apiKey: API_KEY,
    query: { 'data.handle': route.params.handle },
  }).then((data) => {
    article.value = data;
  });
});
</script>
