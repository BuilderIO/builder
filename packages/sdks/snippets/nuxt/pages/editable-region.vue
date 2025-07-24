<script setup lang="ts">
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue';
import CustomColumnsInfo from '../components/CustomColumnsInfo';
import { useRoute } from 'nuxt/app';

const route = useRoute();
const model = 'editable-regions';
const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

const searchParams = process.server 
  ? new URLSearchParams(useRequestURL().search) 
  : new URLSearchParams(window.location.search);

const { data: content, pending } = await useAsyncData(
  `builder-${model}-${route.path}`,
  () =>
    fetchOneEntry({
      model,
      apiKey,
      userAttributes: { urlPath: route.path },
    })
);
</script>

<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-else-if="!content && !isPreviewing(searchParams)">404 - Not Found</div>
    <Content
      v-else
      :content="content"
      :model="model"
      :apiKey="apiKey"
      :customComponents="[CustomColumnsInfo]"
    />
  </div>
</template>
