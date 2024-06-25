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

const model = 'announcement-bar';
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
