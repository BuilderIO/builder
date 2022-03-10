<template>
  <div>
    <div>Hello world from your Vue project. Below is Builder Content:</div>
    <RenderContent
      model="page"
      @contentLoaded="contentLoaded"
      @contentError="contentError"
      :options="{
        // optional - define the URL to pull content for
        // in browsers this is grabbed automatically from location.href for pages
        // and content targeted to specific URLs
        url: $route.path,
      }"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import { builder, RenderContent } from '@builder.io/vue'

// TODO: enter your public API key
const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660' // ggignore
builder.init(BUILDER_PUBLIC_API_KEY)

export default Vue.extend({
  components: { RenderContent },
  data: () => ({
    notFound: false,
  }),
  methods: {
    contentLoaded(content) {
      if (!content) {
        this.notFound = true
      }
    },
    contentError(err) {
      // Handle error
    },
  },
})
</script>
