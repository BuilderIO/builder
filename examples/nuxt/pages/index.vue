<template>
  <RenderContent
    model="page"
    :options="{
      url: $route.path,
    }"
  />
</template>

<script>
import { builder, RenderContent } from '@builder.io/vue'
import Vue from 'vue'

// TODO: enter your public API key
builder.init('jdGaMusrVpYgdcAnAtgn')

export default Vue.extend({
  components: { RenderContent },
})
</script>
