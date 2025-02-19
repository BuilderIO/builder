<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useAsyncData, useRoute } from '#app'
import { fetchOneEntry, subscribeToEditor } from '@builder.io/sdk-vue'

const route = useRoute()

const slug = computed(() => route.path)

const {
  data: content,
  pending,
  error,
  refresh
} = await useAsyncData('livePreview', () =>
  fetchOneEntry({
    model: 'blog-data',
    apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
    userAttributes: {
      urlPath: slug.value,
    },
  })
)

watch(slug, () => {
  refresh()
})

const unsubscribe = ref<() => void>()
if (process.client) {
  onMounted(() => {
    unsubscribe.value = subscribeToEditor({
      model: 'blog-data',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      callback(updatedContent) {
        content.value = updatedContent
      },
    })
  })

  onBeforeUnmount(() => {
    if (unsubscribe.value) {
      unsubscribe.value()
    }
  })
}

const publishedDate = computed(() => {
  if (!content.value?.data?.publishedDate) return ''
  return content.value.data.publishedDate.split(' ').slice(0, 4).join(' ')
})
</script>

<template>
  <div>
    <div v-if="pending">Loading Data...</div>

    <div class="blog-data-preview">
      <div>Blog Title: {{ content?.data?.title }}</div>
      <div>Authored by: {{ content?.data?.author }}</div>
      <div>Handle: {{ content?.data?.handle }}</div>
      <div>Published date: {{ publishedDate }}</div>
    </div>
  </div>
</template>
