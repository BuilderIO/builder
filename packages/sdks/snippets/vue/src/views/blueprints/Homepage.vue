<template>
  <div v-if="content || isPreviewing()">
    <Content model={model} :content="content" apiKey={apiKey} />
  </div>
  <div v-else>
    404
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue'
  import type { BuilderContent } from '@builder.io/sdk-vue'
  
  const content = ref<BuilderContent | null>(null)

  const model = 'homepage';
  const apiKey = 'ee9f13b4981e489a9a1209887695ef2b';

  onMounted(() => {
    fetchOneEntry({
      model: model,
      apiKey: apiKey,
    }).then((res) => {
      content.value = res
    })
  })
  </script>
  