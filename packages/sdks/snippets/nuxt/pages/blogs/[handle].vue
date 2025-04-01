<script setup lang="ts">
import { Content, fetchOneEntry } from '@builder.io/sdk-vue';
import { useRoute } from 'nuxt/app';

const model = 'blog-article';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';
const route = useRoute();

const { data: article } = await useAsyncData('blogArticle', () =>
  fetchOneEntry({
    model,
    apiKey: API_KEY,
    query: { 'data.handle': route.params.handle },
  })
);
</script>

<template>
  <div v-if="!article && !isPreviewing()">404</div>
  <div v-if="article?.data" class="content">
    <h1>{{ article.data.title }}</h1>
    <p>{{ article.data.blurb }}</p>
    <img :src="article.data.image" alt="" />
    <Content :model="model" :content="article" :apiKey="API_KEY" />
  </div>
</template>
