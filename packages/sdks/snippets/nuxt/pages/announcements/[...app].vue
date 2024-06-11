<!-- https://www.builder.io/c/docs/integrate-section-building -->
<!-- https://www.builder.io/c/blueprints/announcement-bar -->
<!-- pages/announcements/[...app].vue -->

<script setup>
import {
  Content,
  fetchOneEntry,
  isPreviewing,
  getBuilderSearchParams,
} from '@builder.io/sdk-vue';
import { ref } from 'vue';

const route = useRoute();

const model = 'page';
const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
const canShowContent = ref(false);

const { data: content } = await useAsyncData('builderData', () =>
  fetchOneEntry({
    model,
    apiKey,
    options: getBuilderSearchParams(route.query),
    userAttributes: { urlPath: route.path },
  })
);

canShowContent.value = content.value ? true : isPreviewing(route.query);
</script>

<template>
  <div v-if="canShowContent">
    <Content :api-key="apiKey" :model="model" :content="content" />
  </div>
  <div v-else>Content not Found</div>
</template>
