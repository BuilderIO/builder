<template>
  <div id="home">
    <div>Hello world from your Vue project. Below is Builder Content:</div>

    <div v-if="canShowContent">
      <div>
        page:
        {{ (content && content.data && content.data.title) || 'Unpublished' }}
      </div>
      <builder-render-content
        model="page"
        :content="content"
        :api-key="apiKey"
        :customComponents="getRegisteredComponents()"
      />
    </div>
  </div>
</template>
<script>
import Vue from 'vue';

import {
  RenderContent,
  getContent,
  getBuilderSearchParams,
  convertSearchParamsToQueryObject,
  isEditing,
  isPreviewing,
} from '@builder.io/sdk-vue/vue2';

// Register your Builder components
import HelloWorldComponent from './HelloWorld.vue';

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
  components: {
    'builder-render-content': RenderContent,
  },
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
    getContent({
      model: 'page',
      apiKey: BUILDER_PUBLIC_API_KEY,
      options: getBuilderSearchParams(
        convertSearchParamsToQueryObject(new URLSearchParams(window.location.search))
      ),
      userAttributes: {
        urlPath: window.location.pathname,
      },
    }).then(res => {
      this.content = res;
      this.canShowContent = this.content || isEditing() || isPreviewing();
    });
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
