<template>
  <div v-if="notFound && !isEditing">
    <!-- Show your 404 content -->
    Page not found
  </div>
  <div v-else>
    <builder-render-content model="page" :content="content" />
  </div>
</template>

<script>
import Vue from 'vue'
import { getContent, isEditing } from '@builder.io/sdk-vue'

// Important to import this anywhere you use <RenderContent /> so the custom
// components will be registered and usable
import '../scripts/register-builder-components'

// TODO: enter your public API key
const BUILDER_PUBLIC_API_KEY = 'jdGaMusrVpYgdcAnAtgn'

export default Vue.extend({
  data: () => ({
    notFound: false,
    content: null,
    isEditing: isEditing(),
  }),
  async fetch() {
    let content = await getContent({
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
    this.notFound = !content
  },
})
</script>
