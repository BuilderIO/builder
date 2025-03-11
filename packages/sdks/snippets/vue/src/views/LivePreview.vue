<template>
  <div v-if="loading">Loading Data...</div>
  <div v-else-if="content" class="blog-data-preview">
    <div>Blog Title: {{ content?.data?.title }}</div>
    <div>Authored by: {{ content?.data?.author }}</div>
    <div>Handle: {{ content?.data?.handle }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  type BuilderContent,
  fetchOneEntry,
  subscribeToEditor,
} from '@builder.io/sdk-vue';

const content = ref<BuilderContent | null>(null);
const loading = ref(true);

const route = useRoute();

async function fetchContent() {
  loading.value = true;
  try {
    const data = await fetchOneEntry({
      model: 'blog-data',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      userAttributes: { urlPath: route.path },
    });
    content.value = data;
  } catch (err) {
    console.error('Error fetching Builder content:', err);
  } finally {
    loading.value = false;
  }
}

let unsubscribe: (() => void) | undefined;

onMounted(() => {
  fetchContent();
  unsubscribe = subscribeToEditor({
    model: 'blog-data',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    callback: (updatedContent) => {
      content.value = updatedContent;
    },
  });
});

watch(
  () => route.path,
  () => {
    fetchContent();
  }
);

onBeforeUnmount(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>
