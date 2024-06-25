<!-- Quickstart snippet -->
<!-- https://www.builder.io/c/docs/integrating-builder-pages -->

<script setup lang="ts">
import {
  Content,
  type BuilderContent,
  fetchOneEntry,
  getBuilderSearchParams,
  isPreviewing,
} from '@builder.io/sdk-vue';
import { onMounted, ref } from 'vue';

const content = ref<BuilderContent | null>(null);
const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
const canShowContent = ref(false);
const model = 'page';

onMounted(async () => {
  content.value = await fetchOneEntry({
    model,
    apiKey,
    options: getBuilderSearchParams(new URL(location.href).searchParams),
    userAttributes: {
      urlPath: window.location.pathname,
    },
  });
  canShowContent.value = content.value ? true : isPreviewing();
});
</script>

<template>
  <Content
    v-if="canShowContent"
    :model="model"
    :content="content"
    :api-key="apiKey"
  />
  <div v-else>Content not Found</div>
</template>
