<template>
  <div>
    <div>Hello world from your Vue project. Below is Builder Content:</div>
    <div v-if="canShowContent">
      <builder-render-content model="page" :content="content" />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { getContent, isEditing, isPreviewing } from '@builder.io/sdk-vue'

// Important to import this anywhere you use <RenderContent /> so the custom
// components will be registered and usable
import '../scripts/register-builder-components'

// TODO: enter your public API key
const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'

export default Vue.extend({
  data: () => ({
    canShowContent: false,
    content: null,
  }),
  async fetch() {
    const content = await getContent({
      model: 'page',
      apiKey: BUILDER_PUBLIC_API_KEY,
      userAttributes: {
        urlPath: this.$route.path,
      },
    })
    if (!content) {
      if (this.$nuxt.context?.ssrContext?.res) {
        this.$nuxt.context.ssrContext.res.statusCode = 404
      }
    }
    this.content = content
    this.canShowContent = content || isEditing()
  },
})
</script>
