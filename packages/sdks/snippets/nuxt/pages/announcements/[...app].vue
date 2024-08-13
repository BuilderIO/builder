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
const canShowAnnouncementBar = ref(false);

const { data: announcement } = await useAsyncData('builderData', () =>
  fetchOneEntry({
    model,
    apiKey,
    options: getBuilderSearchParams(route.query),
    userAttributes: { urlPath: route.path },
  })
);

canShowAnnouncementBar.value = announcement.value
  ? true
  : isPreviewing(route.query);
</script>

<template>
  <Content
    v-if="canShowAnnouncementBar"
    :model="model"
    :content="announcement"
    :api-key="apiKey"
  />

  <!-- Your content coming from your app (or also Builder) -->
  <div>The rest of your page goes here</div>
</template>
