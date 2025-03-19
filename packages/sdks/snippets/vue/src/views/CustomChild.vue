<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="!content && !isPreviewing()">404 - Not Found</div>
    <Content
      v-else
      :content="content"
      model="custom-child"
      apiKey="ee9f13b4981e489a9a1209887695ef2b"
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
  type BuilderContent,
} from '@builder.io/sdk-vue';
import customHeroInfo from '@/components/custom-components/custom-hero/CustomHeroInfo';
import { useRoute } from 'vue-router';

const route = useRoute();
const content = ref<BuilderContent | null>(null);
const loading = ref(true);

onMounted(() => {
  fetchOneEntry({
    model: 'custom-child',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    userAttributes: { urlPath: route.path },
  })
    .then((result) => {
      content.value = result;
    })
    .finally(() => {
      loading.value = false;
    });
});
</script>
