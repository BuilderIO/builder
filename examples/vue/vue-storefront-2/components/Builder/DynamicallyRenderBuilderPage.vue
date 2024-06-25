<template>
  <div id="home">
    <div>Hello world from your Vue project. Below is Builder Content:</div>

    <div v-if="canShowContent">
      <div>
        page title:
        {{ (content && content.data && content.data.title) || 'Unpublished' }}
      </div>
      <builder-render-content
        model="page"
        :content="content"
        :api-key="apiKey"
        :customComponents="getRegisteredComponents()"
      />
    </div>
    <div v-else>Content not Found</div>
  </div>
</template>
<script>
import Vue from 'vue';

import { fetchOneEntry, isPreviewing } from '@builder.io/sdk-vue';
import HelloWorldComponent from './HelloWorld.vue';

// Register your Builder components
export const REGISTERED_COMPONENTS = [
  {
    component: HelloWorldComponent,
    name: 'Hello World',
    canHaveChildren: true,
    inputs: [
      {
        name: 'text',
        type: 'string',
        defaultValue: 'World',
      },
    ],
  },
];

// TODO: enter your public API key
const BUILDER_PUBLIC_API_KEY = 'f1a790f8c3204b3b8c5c1795aeac4660'; // ggignore

export default Vue.extend({
  name: 'DynamicallyRenderBuilderPage',
  data: () => ({
    canShowContent: false,
    content: null,
    apiKey: BUILDER_PUBLIC_API_KEY,
  }),
  methods: {
    getRegisteredComponents() {
      return REGISTERED_COMPONENTS;
    },
  },
  mounted() {
    // we need to re-run this check on the client in case of SSR
    this.canShowContent = this.content || isPreviewing();
  },
  async fetch() {
    const content = await fetchOneEntry({
      model: 'page',
      apiKey: BUILDER_PUBLIC_API_KEY,
      userAttributes: {
        urlPath: this.$route.path,
      },
    });
    this.canShowContent = content || isPreviewing();
    this.content = content;

    if (!this.canShowContent) {
      if (this.$nuxt.context?.ssrContext?.res) {
        this.$nuxt.context.ssrContext.res.statusCode = 404;
      }
    }
  },
});
</script>

<style>
#home {
  box-sizing: border-box;
  padding: 0 var(--spacer-sm);
  max-width: 1240px;
  padding: 0;
  margin: 0 auto;
}
</style>
