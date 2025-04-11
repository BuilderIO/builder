<template>
      <div v-if="!content && !isPreviewing()">
        404
      </div>
      <div v-else>
    <!-- Render the Builder content -->
    <Content model="homepage" :content="content" apiKey="ee9f13b4981e489a9a1209887695ef2b" />
  </div>
</template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue'
  import type { BuilderContent } from '@builder.io/sdk-vue'
  
  const content = ref<BuilderContent | null>(null)
  
  onMounted(() => {
    fetchOneEntry({
      model: 'homepage',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    }).then((res) => {
      content.value = res
    })
  })
  </script>
  