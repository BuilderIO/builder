<script setup lang="ts">
import { useAsyncData, useRoute } from '#app';
import { fetchOneEntry, Content, isPreviewing } from '@builder.io/sdk-vue';
import CustomHeroInfo from '../components/CustomHeroInfo';

const route = useRoute();
const model = 'custom-child';
const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';
const canShowContent = ref(false);

const { data: content, pending } = await useAsyncData(
  `builder-${model}-${route.path}`,
  () => fetchOneEntry({
    model,
    apiKey,
    userAttributes: {
        urlPath: route.path,
      },
    })
);  

canShowContent.value = content.value ? true : isPreviewing();
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="!canShowContent">404 - Not Found</div>
  <Content
    v-else
    :content="content"
    :model="model"
    :apiKey="apiKey"
    :customComponents="[CustomHeroInfo]"
    />
</template>

