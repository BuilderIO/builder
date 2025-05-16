<script setup lang="ts">
import { useAsyncData } from '#app';
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue';

const model = 'homepage';
const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

const { data: content } = await useAsyncData('homepage', () =>
  fetchOneEntry({
    model: model,
    apiKey: apiKey,
  })
);
</script>

<template>
  <div v-if="content || isPreviewing()">
    <Content :model="model" :content="content" :apiKey="apiKey" />
  </div>
  <div v-else>404</div>
</template>
