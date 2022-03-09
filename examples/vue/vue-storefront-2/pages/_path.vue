<template>
  <div id="home">
    <div>Hello world from your Vue project. Below is Builder Content:</div>

    <div v-if="canShowContent">
      <div>page: {{ content.data.title }}</div>
      <builder-render-content model="page" :content="content" />
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
import cacheControl from '../helpers/cacheControl';

import './init-builder';
import { getContent, isEditing } from '@builder.io/sdk-vue';

// TODO: enter your public API key
const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

export default Vue.extend({
  name: 'Home',
  middleware: cacheControl({
    'max-age': 60,
    'stale-when-revalidate': 5,
  }),
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
    });
    if (!content) {
      if (this.$nuxt.context?.ssrContext?.res) {
        this.$nuxt.context.ssrContext.res.statusCode = 404;
      }
    }
    this.content = content;
    this.canShowContent = content || isEditing();
  },
});
</script>

<style lang="scss" scoped>
#home {
  box-sizing: border-box;
  padding: 0 var(--spacer-sm);
  @include for-desktop {
    max-width: 1240px;
    padding: 0;
    margin: 0 auto;
  }
}
</style>
