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
const apiKey = 'f1a790f8c3204b3b8c5c1795aeac4660';
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
  <!-- Your header coming from Builder -->
  <Content
    v-if="canShowContent"
    :model="model"
    :content="content"
    :api-key="apiKey"
  />
  <div v-else>Announcement Bar not Found</div>

  <!-- Your content coming from your app (or also Builder) -->
  <div>The rest of your page goes here</div>
</template>
