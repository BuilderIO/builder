<template>
    <div>
      <div v-if="pending">Loading...</div>
      <div v-else-if="!content && !isPreviewing()">404 - Not Found</div>
      <Content
        v-else
        :content="content"
        :model="model"
        :apiKey="apikey"
        :customComponents="[CustomColumnsInfo]"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue';
  import CustomColumnsInfo from '../components/CustomColumnsInfo';
  import { useRoute } from 'nuxt/app';

  const route = useRoute();
  const model = 'editable-regions';
  const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

const { data: content, pending } = await useAsyncData(
  `builder-${model}-${route.path}`,
  () => fetchOneEntry({
    model,
    apiKey,
    userAttributes: {urlPath: route.path},
    })
  );

  </script>
  
