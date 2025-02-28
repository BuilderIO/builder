<script setup lang="ts">
import { computed, watchEffect, onMounted, onUnmounted } from 'vue';
import { useAsyncData, useRoute } from '#app';
import { fetchOneEntry, subscribeToEditor } from '@builder.io/sdk-vue';

const slug = computed(() => useRoute().path);

const {
  data: content,
  pending,
  refresh,
} = await useAsyncData(
  'livePreview',
  () =>
    fetchOneEntry({
      model: 'blog-data',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      userAttributes: { urlPath: slug.value },
    }),
  { server: true }
);

watch(slug, async () => {
  await refresh();
});

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  unsubscribe = subscribeToEditor({
    model: 'blog-data',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    callback: (updatedContent) => (content.value = updatedContent),
  });
});

onUnmounted(() => unsubscribe?.());
</script>

<template>
  <div v-if="pending && !content?.data">Loading Data...</div>
  <div v-else-if="content?.data" class="blog-data-preview">
    <div>Blog Title: {{ content.data.title }}</div>
    <div>Authored by: {{ content.data.author }}</div>
    <div>Handle: {{ content.data.handle }}</div>
  </div>
</template>
