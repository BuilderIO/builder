<script setup lang="ts">
import { useAsyncData } from '#app'
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue'

const MODEL = 'homepage';
const API_KEY = 'ee9f13b4981e489a9a1209887695ef2b';

const { data: content } = await useAsyncData('homepage', () =>
  fetchOneEntry({
    model: MODEL,
    apiKey: API_KEY,
  })
)
</script>

<template>
  <div v-if="content || isPreviewing()">
    <Content :model="MODEL" :content="content" :apiKey="API_KEY" />
  </div>
  <div v-else>
    404
  </div>
</template>
