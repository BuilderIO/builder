<script setup lang="ts">
import { useAsyncData } from '#app'
import { Content, fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue'

const { data: content } = await useAsyncData('homepage', () =>
  fetchOneEntry({
    model: 'homepage',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
  })
)
</script>

<template>
    <div v-if="!content && !isPreviewing()">
      404
    </div>
    <div v-else>
      <Content model="homepage" :content="content" apiKey="ee9f13b4981e489a9a1209887695ef2b" />
    </div>
</template>
