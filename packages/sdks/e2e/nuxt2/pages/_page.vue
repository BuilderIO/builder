<template>
  <div v-if="props?.content">
    <RenderContent v-bind="props" />
  </div>
  <div v-else>Content not Found</div>
</template>

<script>
import Vue from 'vue'
import { RenderContent } from '@builder.io/sdk-vue'
import { getProps } from '@builder.io/sdks-e2e-tests'

export default Vue.extend({
  components: {
    RenderContent,
  },
  data: () => ({
    props: null,
  }),
  async fetch() {
    this.props = await getProps(this.$route.path)
  },
})
</script>
