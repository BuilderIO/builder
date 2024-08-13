<!-- https://www.builder.io/c/docs/integrate-section-building -->
<!-- https://www.builder.io/c/blueprints/announcement-bar -->

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
const model = 'announcement-bar';

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

  <!-- Your content coming from your app (or also Builder) -->
  <div>The rest of your page goes here</div>
</template>
