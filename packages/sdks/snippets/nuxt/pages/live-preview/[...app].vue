<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { subscribeToEditor } from '@builder.io/sdk-vue';

const content = ref<any>(null);

onMounted(() => {
  let unsubscribe = subscribeToEditor({
    model: 'blog-data',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      callback: (updatedContent) => content.value = updatedContent
  });
  return () => unsubscribe();
});

</script>

<template>
  <div v-if="content?.data" class="blog-data-preview">
      <div>Blog Title: {{ content?.data?.title }}</div>
      <div>Authored by: {{ content?.data?.author }}</div>
    <div>Handle: {{ content?.data?.handle }}</div>
  </div>
</template>
