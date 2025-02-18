<!-- https://www.builder.io/c/docs/previewing-data-models -->
 
<template>
    <div v-if="!content && !loading">Loading Data...</div>
    
    <div v-else class="blog-data-preview">
      <div>Blog Title: {{ content?.data?.title }}</div>
      <div>Authored by: {{ content?.data?.author }}</div>
      <div>Handle: {{ content?.data?.handle }}</div>
      <div>Published date: {{ publishedDate }}</div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { fetchOneEntry, subscribeToEditor } from '@builder.io/sdk-vue'
  
  const content = ref<any>(null)
  const loading = ref(true)
  
  const route = useRoute()
  
  function getSlug() {
    return route.path
  }
  
  const publishedDate = computed(() => {
    const dateStr = content.value?.data?.publishedDate
    if (!dateStr) return ''
    return dateStr.split(' ').slice(0, 4).join(' ')
  })
  
  async function fetchContent() {
    loading.value = true
    try {
      const data = await fetchOneEntry({
        model: 'blog-data',
        apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
        userAttributes: { urlPath: getSlug() },
      })
      content.value = data
    } catch (err) {
      console.error('Error fetching Builder content:', err)
    } finally {
      loading.value = false
    }
  }
  
  let unsubscribe: (() => void) | undefined
  
  onMounted(() => {
    fetchContent()
    unsubscribe = subscribeToEditor({
      model: 'blog-data',
      apiKey: 'ee9f13b4981e489a9a1209887695ef2b',
      callback: (updatedContent) => {
        content.value = updatedContent
      },
    })
  })
  
  watch(
    () => route.path,
    () => {
      fetchContent()
    }
  )
  
  onBeforeUnmount(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })
  </script>


  