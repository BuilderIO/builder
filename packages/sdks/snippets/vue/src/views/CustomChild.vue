<template>
  <div>
    <div v-if="notFound && !isPreviewing()">404 - Not Found</div>

    <Content
      v-else
      :content="content"
      :model="pageModel"
      :apiKey="apiKey"
      :customComponents="[customHeroInfo]"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  Content,
  fetchOneEntry,
  isPreviewing,
  type BuilderContent
} from '@builder.io/sdk-vue';

import { customHeroInfo } from '@/components/custom-components/custom-hero/CustomHeroInfo';

const pageModel = 'page';
const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

const content = ref<BuilderContent | null>(null);
const notFound = ref(false);

onMounted(async () => {
  try {
    const fetchedContent = await fetchOneEntry({
      model: pageModel,
      apiKey,
      userAttributes: {
        urlPath: window.location.pathname,
      },
    });
    if (fetchedContent) {
      content.value = fetchedContent;
    } else {
      notFound.value = true;
    }
  } catch (err) {
    console.error('Oops: ', err);
  }
});
</script>

